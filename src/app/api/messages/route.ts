import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'
import { sendEmail, newMessageEmail } from '@/lib/email'

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

    const { listing_id, content, conversation_id } = await req.json()
    if (!content?.trim()) return NextResponse.json({ error: 'Message content required' }, { status: 400 })

    let convoId = conversation_id

    if (!convoId) {
      if (!listing_id) return NextResponse.json({ error: 'listing_id required' }, { status: 400 })

      const { data: listing, error: lErr } = await supabase
        .from('listings')
        .select('user_id')
        .eq('id', listing_id)
        .maybeSingle()
      if (lErr) throw lErr
      if (!listing) return NextResponse.json({ error: 'Listing not found' }, { status: 404 })
      if (listing.user_id === user.id) {
        return NextResponse.json({ error: "Can't message yourself" }, { status: 400 })
      }

      const { data: existing } = await supabase
        .from('conversations')
        .select('id')
        .eq('listing_id', listing_id)
        .eq('buyer_id', user.id)
        .maybeSingle()

      if (existing) {
        convoId = existing.id
      } else {
        const { data: convo, error: cErr } = await supabase
          .from('conversations')
          .insert({ listing_id, buyer_id: user.id, seller_id: listing.user_id })
          .select('id')
          .single()
        if (cErr) throw cErr
        convoId = convo.id
      }
    }

    const { data: msg, error: mErr } = await supabase
      .from('messages')
      .insert({ conversation_id: convoId, sender_id: user.id, content: content.trim() })
      .select('*')
      .single()

    if (mErr) throw mErr

    notifyRecipient({
      conversationId: convoId,
      senderId: user.id,
      preview: content.trim(),
    }).catch(err => console.error('notifyRecipient failed:', err))

    return NextResponse.json({ conversation_id: convoId, message: msg })
  } catch (error) {
    console.error('Messages POST error:', error)
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 })
  }
}

async function notifyRecipient(opts: { conversationId: string; senderId: string; preview: string }) {
  const admin = createServiceClient()

  const { data: convo } = await admin
    .from('conversations')
    .select('buyer_id, seller_id, listing:listings(title)')
    .eq('id', opts.conversationId)
    .maybeSingle<{
      buyer_id: string
      seller_id: string
      listing: { title: string } | null
    }>()
  if (!convo) return

  const recipientId = convo.buyer_id === opts.senderId ? convo.seller_id : convo.buyer_id

  const { data: recipientProfile } = await admin
    .from('user_profiles')
    .select('name, email_notifications')
    .eq('id', recipientId)
    .maybeSingle<{ name: string; email_notifications: boolean }>()
  if (!recipientProfile || recipientProfile.email_notifications === false) return

  const { data: sender } = await admin
    .from('user_profiles')
    .select('name')
    .eq('id', opts.senderId)
    .maybeSingle<{ name: string }>()

  const { data: authUser } = await admin.auth.admin.getUserById(recipientId)
  const email = authUser?.user?.email
  if (!email) return

  const tpl = newMessageEmail({
    recipientName: recipientProfile.name || 'there',
    senderName: sender?.name || 'A buyer',
    listingTitle: convo.listing?.title ?? 'your listing',
    conversationId: opts.conversationId,
    preview: opts.preview,
  })
  await sendEmail({ to: email, ...tpl })
}
