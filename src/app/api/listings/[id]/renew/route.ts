import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const RENEW_DAYS = 30

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

    const { id } = await params

    const expires = new Date(Date.now() + RENEW_DAYS * 24 * 60 * 60 * 1000).toISOString()

    const { data, error } = await supabase
      .from('listings')
      .update({ status: 'active', expires_at: expires })
      .eq('id', id)
      .eq('user_id', user.id)
      .in('status', ['expired', 'active'])
      .select('id, expires_at')
      .maybeSingle()

    if (error) throw error
    if (!data) return NextResponse.json({ error: 'Not found or forbidden' }, { status: 404 })

    return NextResponse.json({ id: data.id, expires_at: data.expires_at })
  } catch (error) {
    console.error('Renew listing error:', error)
    return NextResponse.json({ error: 'Failed to renew listing' }, { status: 500 })
  }
}
