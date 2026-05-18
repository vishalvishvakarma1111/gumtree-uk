import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const ALLOWED_SORTS: Record<string, { column: string; ascending: boolean }> = {
  newest: { column: 'created_at', ascending: false },
  oldest: { column: 'created_at', ascending: true },
  price_asc: { column: 'price', ascending: true },
  price_desc: { column: 'price', ascending: false },
}

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient()
    const sp = req.nextUrl.searchParams

    let query = supabase
      .from('listings')
      .select('*, user_profiles(*), categories(*)')
      .eq('status', 'active')

    const q = sp.get('q')
    if (q) query = query.or(`title.ilike.%${q}%,description.ilike.%${q}%`)

    const categorySlug = sp.get('category')
    if (categorySlug) {
      const { data: cat } = await supabase
        .from('categories')
        .select('id')
        .eq('slug', categorySlug)
        .maybeSingle()
      if (cat) query = query.eq('category_id', cat.id)
    }

    const location = sp.get('location')
    if (location) query = query.ilike('location', `%${location}%`)

    const minPrice = sp.get('min_price')
    if (minPrice) query = query.gte('price', Number(minPrice))

    const maxPrice = sp.get('max_price')
    if (maxPrice) query = query.lte('price', Number(maxPrice))

    const conditions = sp.get('conditions')
    if (conditions) query = query.in('condition', conditions.split(','))

    const urgent = sp.get('urgent')
    if (urgent === '1') query = query.eq('is_urgent', true)

    for (const [key, val] of sp.entries()) {
      if (key.startsWith('attr_') && val) {
        const attrKey = key.slice(5)
        query = query.filter(`attributes->>${attrKey}`, 'eq', val)
      }
    }

    const sort = ALLOWED_SORTS[sp.get('sort') ?? 'newest'] ?? ALLOWED_SORTS.newest
    query = query.order(sort.column, { ascending: sort.ascending, nullsFirst: false })

    const limit = Math.min(Number(sp.get('limit') ?? 60), 100)
    query = query.limit(limit)

    const { data, error } = await query
    if (error) throw error
    return NextResponse.json({ listings: data ?? [] })
  } catch (error) {
    console.error('List listings error:', error)
    return NextResponse.json({ error: 'Failed to fetch listings' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

    const body = await req.json()
    const { title, description, price, price_type, condition, category_id, location, images, offers_shipping, is_urgent, attributes } = body

    if (!title || !category_id || !location) {
      return NextResponse.json({ error: 'Title, category, and location are required' }, { status: 400 })
    }

    let resolvedCategoryId = category_id
    const looksLikeUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(category_id)
    if (!looksLikeUuid) {
      const { data: cat, error: catError } = await supabase
        .from('categories')
        .select('id')
        .eq('slug', category_id)
        .maybeSingle()
      if (catError || !cat) {
        return NextResponse.json({ error: 'Invalid category' }, { status: 400 })
      }
      resolvedCategoryId = cat.id
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
        category_id: resolvedCategoryId,
        location,
        images: images ?? [],
        offers_shipping: offers_shipping ?? false,
        is_urgent: is_urgent ?? false,
        attributes: attributes && typeof attributes === 'object' ? attributes : {},
        status: 'pending',
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
