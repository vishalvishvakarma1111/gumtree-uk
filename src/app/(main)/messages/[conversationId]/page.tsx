import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { ChevronLeft } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { formatPrice } from '@/lib/utils'
import ChatThread from './chat-thread'

export default async function ConversationPage({
  params,
}: {
  params: Promise<{ conversationId: string }>
}) {
  const { conversationId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect(`/login?next=/messages/${conversationId}`)

  const { data: convo } = await supabase
    .from('conversations')
    .select(`
      id, listing_id, buyer_id, seller_id, created_at,
      listings ( id, title, images, price, price_type, status ),
      buyer:user_profiles!conversations_buyer_id_fkey ( id, name, avatar_url ),
      seller:user_profiles!conversations_seller_id_fkey ( id, name, avatar_url )
    `)
    .eq('id', conversationId)
    .maybeSingle()

  if (!convo) notFound()
  if (convo.buyer_id !== user.id && convo.seller_id !== user.id) notFound()

  const { data: messages } = await supabase
    .from('messages')
    .select('*')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true })

  // Mark unread messages from other party as read
  await supabase
    .from('messages')
    .update({ read_at: new Date().toISOString() })
    .eq('conversation_id', conversationId)
    .neq('sender_id', user.id)
    .is('read_at', null)

  const otherParty = (convo.buyer_id === user.id ? convo.seller : convo.buyer) as unknown as
    | { id: string; name: string; avatar_url: string | null }
    | null
  const listing = convo.listings as unknown as
    | { id: string; title: string; images: string[]; price: number | null; price_type: string; status: string }
    | null

  return (
    <div style={{ backgroundColor: '#f1f1f1', minHeight: '100vh' }}>
      <div className="max-w-3xl mx-auto h-[calc(100vh-64px)] flex flex-col">
        {/* Header */}
        <div className="bg-white border-b px-4 py-3 flex items-center gap-3" style={{ borderColor: '#dbdadb' }}>
          <Link href="/messages" className="text-gray-400 hover:text-gray-600 flex-shrink-0">
            <ChevronLeft size={20} />
          </Link>
          <div
            className="w-9 h-9 rounded-full overflow-hidden flex-shrink-0 flex items-center justify-center text-white font-bold text-sm"
            style={{ backgroundColor: '#0D475C' }}
          >
            {otherParty?.avatar_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={otherParty.avatar_url} alt="" className="w-full h-full object-cover" />
            ) : (
              otherParty?.name?.slice(0, 1).toUpperCase() ?? '?'
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-900 truncate">{otherParty?.name ?? 'Unknown'}</p>
            {listing && (
              <Link href={`/listings/${listing.id}`} className="text-xs text-gray-400 hover:underline truncate block">
                {listing.title}
              </Link>
            )}
          </div>
          {listing?.images?.[0] && (
            <Link href={`/listings/${listing.id}`} className="flex items-center gap-2 flex-shrink-0">
              <div className="relative w-10 h-10 rounded overflow-hidden bg-gray-100">
                <Image src={listing.images[0]} alt="" fill className="object-cover" />
              </div>
              <span className="text-sm font-bold hidden sm:block" style={{ color: '#0D475C' }}>
                {formatPrice(listing.price, listing.price_type)}
              </span>
            </Link>
          )}
        </div>

        <ChatThread
          conversationId={conversationId}
          currentUserId={user.id}
          initialMessages={messages ?? []}
        />
      </div>
    </div>
  )
}
