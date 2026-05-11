import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

    const { data, error } = await supabase
      .from('watchlist')
      .select('listing_id, created_at, listings(*, user_profiles(*), categories(*))')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) throw error
    return NextResponse.json({ watchlist: data ?? [] })
  } catch (error) {
    console.error('Watchlist GET error:', error)
    return NextResponse.json({ error: 'Failed to load watchlist' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

    const { listing_id } = await req.json()
    if (!listing_id) return NextResponse.json({ error: 'listing_id required' }, { status: 400 })
    if (!UUID_RE.test(String(listing_id))) {
      return NextResponse.json({ error: 'This is a demo listing — only real ads can be saved.' }, { status: 400 })
    }

    const { error } = await supabase
      .from('watchlist')
      .upsert({ user_id: user.id, listing_id }, { onConflict: 'user_id,listing_id', ignoreDuplicates: true })

    if (error) throw error
    return NextResponse.json({ saved: true })
  } catch (error) {
    console.error('Watchlist POST error:', error)
    return NextResponse.json({ error: 'Failed to save' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

    const listing_id = req.nextUrl.searchParams.get('listing_id')
    if (!listing_id) return NextResponse.json({ error: 'listing_id required' }, { status: 400 })
    if (!UUID_RE.test(listing_id)) {
      return NextResponse.json({ error: 'Invalid listing_id' }, { status: 400 })
    }

    const { error } = await supabase
      .from('watchlist')
      .delete()
      .eq('user_id', user.id)
      .eq('listing_id', listing_id)

    if (error) throw error
    return NextResponse.json({ saved: false })
  } catch (error) {
    console.error('Watchlist DELETE error:', error)
    return NextResponse.json({ error: 'Failed to remove' }, { status: 500 })
  }
}
