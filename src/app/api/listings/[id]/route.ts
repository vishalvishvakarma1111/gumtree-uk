import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const STATUS_VALUES = ['active', 'sold', 'expired', 'draft']

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('listings')
      .select('*, user_profiles(*), categories(*)')
      .eq('id', id)
      .maybeSingle()
    if (error) throw error
    if (!data) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json({ listing: data })
  } catch (error) {
    console.error('Get listing error:', error)
    return NextResponse.json({ error: 'Failed to fetch listing' }, { status: 500 })
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

    const body = await req.json()
    const update: Record<string, unknown> = {}

    if (body.status !== undefined) {
      if (!STATUS_VALUES.includes(body.status)) {
        return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
      }
      update.status = body.status
    }
    if (body.title !== undefined) update.title = body.title
    if (body.description !== undefined) update.description = body.description
    if (body.price !== undefined) update.price = body.price
    if (body.price_type !== undefined) update.price_type = body.price_type
    if (body.condition !== undefined) update.condition = body.condition
    if (body.location !== undefined) update.location = body.location
    if (body.images !== undefined) update.images = body.images
    if (body.offers_shipping !== undefined) update.offers_shipping = body.offers_shipping
    if (body.is_urgent !== undefined) update.is_urgent = body.is_urgent

    if (Object.keys(update).length === 0) {
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('listings')
      .update(update)
      .eq('id', id)
      .eq('user_id', user.id)
      .select('id')
      .maybeSingle()

    if (error) throw error
    if (!data) return NextResponse.json({ error: 'Not found or forbidden' }, { status: 404 })
    return NextResponse.json({ id: data.id })
  } catch (error) {
    console.error('Update listing error:', error)
    return NextResponse.json({ error: 'Failed to update listing' }, { status: 500 })
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

    const { error } = await supabase
      .from('listings')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) throw error
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete listing error:', error)
    return NextResponse.json({ error: 'Failed to delete listing' }, { status: 500 })
  }
}
