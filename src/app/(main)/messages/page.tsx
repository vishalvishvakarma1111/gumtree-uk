import { redirect } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/server'
import { MessageCircle } from 'lucide-react'
import { timeAgo } from '@/lib/utils'
import MessagesRefresher from './messages-refresher'

interface ConversationRow {
  id: string
  listing_id: string
  buyer_id: string
  seller_id: string
  created_at: string
  listings: {
    id: string
    title: string
    images: string[]
    price: number | null
    price_type: string
  } | null
  buyer: { id: string; name: string; avatar_url: string | null } | null
  seller: { id: string; name: string; avatar_url: string | null } | null
}

interface MessageRow {
  conversation_id: string
  sender_id: string
  content: string
  read_at: string | null
  created_at: string
}

export default async function MessagesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login?next=/messages')

  const { data: convos } = await supabase
    .from('conversations')
    .select(`
      id, listing_id, buyer_id, seller_id, created_at,
      listings ( id, title, images, price, price_type ),
      buyer:user_profiles!conversations_buyer_id_fkey ( id, name, avatar_url ),
      seller:user_profiles!conversations_seller_id_fkey ( id, name, avatar_url )
    `)
    .or(`buyer_id.eq.${user.id},seller_id.eq.${user.id}`)
    .order('created_at', { ascending: false })

  const conversations = (convos ?? []) as unknown as ConversationRow[]
  const lastMessages = new Map<string, MessageRow>()
  const unreadCounts = new Map<string, number>()

  if (conversations.length > 0) {
    const ids = conversations.map(c => c.id)
    const { data: msgs } = await supabase
      .from('messages')
      .select('conversation_id, sender_id, content, read_at, created_at')
      .in('conversation_id', ids)
      .order('created_at', { ascending: false })

    for (const m of (msgs ?? []) as MessageRow[]) {
      if (!lastMessages.has(m.conversation_id)) lastMessages.set(m.conversation_id, m)
      if (m.sender_id !== user.id && !m.read_at) {
        unreadCounts.set(m.conversation_id, (unreadCounts.get(m.conversation_id) ?? 0) + 1)
      }
    }
  }

  return (
    <div style={{ backgroundColor: '#f1f1f1', minHeight: '100vh' }}>
      <MessagesRefresher userId={user.id} />
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-xl font-extrabold mb-6" style={{ color: '#0D475C' }}>Messages</h1>

        {conversations.length === 0 ? (
          <div className="bg-white rounded-xl border py-20 text-center" style={{ borderColor: '#dbdadb' }}>
            <MessageCircle size={44} className="mx-auto text-gray-200 mb-4" />
            <h3 className="font-bold text-gray-700 mb-2">No messages yet</h3>
            <p className="text-sm text-gray-400 mb-6">
              When you reply to an ad or a seller contacts you, messages will appear here.
            </p>
            <Link
              href="/browse"
              className="inline-block px-6 py-2.5 rounded text-white text-sm font-bold"
              style={{ backgroundColor: '#0D475C' }}
            >
              Browse ads
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-xl border overflow-hidden" style={{ borderColor: '#dbdadb' }}>
            {conversations.map(c => {
              const otherParty = c.buyer_id === user.id ? c.seller : c.buyer
              const lastMsg = lastMessages.get(c.id)
              const unread = unreadCounts.get(c.id) ?? 0
              const listingImage = c.listings?.images?.[0]
              return (
                <Link
                  key={c.id}
                  href={`/messages/${c.id}`}
                  className="flex items-center gap-4 px-5 py-4 border-b hover:bg-gray-50 transition-colors"
                  style={{ borderColor: '#f0f0f0' }}
                >
                  <div className="relative w-12 h-12 rounded-full overflow-hidden flex-shrink-0 flex items-center justify-center text-white font-bold" style={{ backgroundColor: '#0D475C' }}>
                    {otherParty?.avatar_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={otherParty.avatar_url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      otherParty?.name?.slice(0, 1).toUpperCase() ?? '?'
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline justify-between gap-2">
                      <p className={`text-sm truncate ${unread > 0 ? 'font-bold text-gray-900' : 'font-semibold text-gray-700'}`}>
                        {otherParty?.name ?? 'Unknown'}
                      </p>
                      {lastMsg && (
                        <span className="text-xs text-gray-400 flex-shrink-0">{timeAgo(lastMsg.created_at)}</span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 truncate">{c.listings?.title ?? 'Listing removed'}</p>
                    {lastMsg && (
                      <p className={`text-xs truncate mt-0.5 ${unread > 0 ? 'text-gray-900 font-medium' : 'text-gray-400'}`}>
                        {lastMsg.sender_id === user.id && 'You: '}
                        {lastMsg.content}
                      </p>
                    )}
                  </div>
                  {listingImage && (
                    <div className="relative w-12 h-12 rounded overflow-hidden flex-shrink-0 bg-gray-100">
                      <Image src={listingImage} alt="" fill className="object-cover" />
                    </div>
                  )}
                  {unread > 0 && (
                    <span
                      className="text-xs font-bold text-white rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: '#e75462' }}
                    >
                      {unread}
                    </span>
                  )}
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
