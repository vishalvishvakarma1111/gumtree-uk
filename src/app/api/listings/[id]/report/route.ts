import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

    const { id: listingId } = await params
    const { reason } = await req.json()
    if (!reason || typeof reason !== 'string' || !reason.trim()) {
      return NextResponse.json({ error: 'Reason required' }, { status: 400 })
    }
    if (reason.length > 2000) {
      return NextResponse.json({ error: 'Reason too long' }, { status: 400 })
    }

    const { data: listing } = await supabase
      .from('listings')
      .select('id, user_id')
      .eq('id', listingId)
      .maybeSingle()
    if (!listing) return NextResponse.json({ error: 'Listing not found' }, { status: 404 })
    if (listing.user_id === user.id) {
      return NextResponse.json({ error: "Can't report your own listing" }, { status: 400 })
    }

    const { error } = await supabase.from('reports').insert({
      reporter_id: user.id,
      listing_id: listingId,
      reason: reason.trim(),
    })
    if (error) throw error

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('Report POST error:', error)
    return NextResponse.json({ error: 'Failed to file report' }, { status: 500 })
  }
}
