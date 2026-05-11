import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    if (!UUID_RE.test(id)) {
      return NextResponse.json({ error: 'Invalid conversation id' }, { status: 400 })
    }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

    const { data: convo } = await supabase
      .from('conversations')
      .select('id, buyer_id, seller_id')
      .eq('id', id)
      .maybeSingle()
    if (!convo) return NextResponse.json({ error: 'Conversation not found' }, { status: 404 })
    if (convo.buyer_id !== user.id && convo.seller_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { data, error } = await supabase
      .from('messages')
      .update({ read_at: new Date().toISOString() })
      .eq('conversation_id', id)
      .neq('sender_id', user.id)
      .is('read_at', null)
      .select('id')

    if (error) throw error
    return NextResponse.json({ ok: true, marked: data?.length ?? 0 })
  } catch (error) {
    console.error('Mark conversation read error:', error)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
