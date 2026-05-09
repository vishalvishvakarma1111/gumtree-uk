import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

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
    return NextResponse.json({ conversation_id: convoId, message: msg })
  } catch (error) {
    console.error('Messages POST error:', error)
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 })
  }
}
