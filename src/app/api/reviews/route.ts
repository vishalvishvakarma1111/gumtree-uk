import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

function clampRating(n: unknown): number | null {
  const v = Number(n)
  if (!Number.isInteger(v) || v < 1 || v > 5) return null
  return v
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

    const body = await req.json()
    const overall = clampRating(body.overall)
    const communication = clampRating(body.communication)
    const reliability = clampRating(body.reliability)
    const as_described = clampRating(body.as_described)
    if (!overall || !communication || !reliability || !as_described) {
      return NextResponse.json({ error: 'Ratings 1-5 required' }, { status: 400 })
    }
    if (!body.listing_id) return NextResponse.json({ error: 'listing_id required' }, { status: 400 })

    const { data: listing, error: lErr } = await supabase
      .from('listings')
      .select('user_id')
      .eq('id', body.listing_id)
      .maybeSingle()
    if (lErr) throw lErr
    if (!listing) return NextResponse.json({ error: 'Listing not found' }, { status: 404 })
    if (listing.user_id === user.id) {
      return NextResponse.json({ error: "Can't review your own listing" }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('reviews')
      .insert({
        reviewer_id: user.id,
        reviewee_id: listing.user_id,
        listing_id: body.listing_id,
        overall,
        communication,
        reliability,
        as_described,
        comment: typeof body.comment === 'string' ? body.comment.slice(0, 2000) : null,
      })
      .select('id')
      .single()

    if (error) {
      if (error.code === '23505') {
        return NextResponse.json({ error: 'Already reviewed this listing' }, { status: 409 })
      }
      throw error
    }

    return NextResponse.json({ id: data.id })
  } catch (error) {
    console.error('Reviews POST error:', error)
    return NextResponse.json({ error: 'Failed to submit review' }, { status: 500 })
  }
}
