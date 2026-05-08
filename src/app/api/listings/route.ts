import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

    const body = await req.json()
    const { title, description, price, price_type, condition, category_id, location, images, offers_shipping, is_urgent } = body

    if (!title || !category_id || !location) {
      return NextResponse.json({ error: 'Title, category, and location are required' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('listings')
      .insert({
        user_id: user.id,
        title,
        description,
        price: price ?? null,
        price_type: price_type ?? 'fixed',
        condition: condition ?? 'good',
        category_id,
        location,
        images: images ?? [],
        offers_shipping: offers_shipping ?? false,
        is_urgent: is_urgent ?? false,
        status: 'active',
      })
      .select('id')
      .single()

    if (error) throw error
    return NextResponse.json({ id: data.id })
  } catch (error) {
    console.error('Create listing error:', error)
    return NextResponse.json({ error: 'Failed to create listing' }, { status: 500 })
  }
}
