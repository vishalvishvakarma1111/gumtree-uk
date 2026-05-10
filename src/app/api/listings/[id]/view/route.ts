import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()

    const { data: listing } = await supabase
      .from('listings')
      .select('user_id, status')
      .eq('id', id)
      .maybeSingle()

    if (!listing) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    // Don't count owner self-views or non-active listings.
    if (user && listing.user_id === user.id) {
      return NextResponse.json({ counted: false })
    }
    if (listing.status !== 'active') {
      return NextResponse.json({ counted: false })
    }

    const { error } = await supabase.rpc('increment_listing_view', { p_id: id })
    if (error) throw error

    return NextResponse.json({ counted: true })
  } catch (error) {
    console.error('View increment error:', error)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
