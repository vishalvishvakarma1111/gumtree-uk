import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'
import { isAdminUser } from '@/lib/admin'
import { logAuditAction } from '@/lib/audit'

function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80)
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
    if (!(await isAdminUser(supabase, user.id))) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await req.json()
    const name = typeof body.name === 'string' ? body.name.trim() : ''
    if (!name) return NextResponse.json({ error: 'Name required' }, { status: 400 })

    const slug = typeof body.slug === 'string' && body.slug.trim()
      ? slugify(body.slug)
      : slugify(name)
    if (!slug) return NextResponse.json({ error: 'Invalid slug' }, { status: 400 })

    const icon = typeof body.icon === 'string' ? body.icon.slice(0, 8) : ''
    const parentId = typeof body.parent_id === 'string' && body.parent_id
      ? body.parent_id
      : null
    const sortOrder = Number.isFinite(body.sort_order) ? Number(body.sort_order) : 0

    const admin = createServiceClient()

    if (parentId) {
      const { data: parent } = await admin
        .from('categories')
        .select('id, parent_id')
        .eq('id', parentId)
        .maybeSingle<{ id: string; parent_id: string | null }>()
      if (!parent) return NextResponse.json({ error: 'Parent not found' }, { status: 400 })
      if (parent.parent_id) {
        return NextResponse.json({ error: 'Nesting limited to two levels' }, { status: 400 })
      }
    }

    const { data, error } = await admin
      .from('categories')
      .insert({ name, slug, icon, parent_id: parentId, sort_order: sortOrder })
      .select('id, name, slug, icon, parent_id, sort_order')
      .single()
    if (error) {
      if (error.code === '23505') {
        return NextResponse.json({ error: 'Slug already exists' }, { status: 409 })
      }
      throw error
    }

    await logAuditAction({
      actorId: user.id,
      action: 'category.create',
      entityType: 'category',
      entityId: data.id,
      meta: { name, slug, parent_id: parentId },
    }, admin)

    return NextResponse.json({ category: data })
  } catch (error) {
    console.error('Create category error:', error)
    return NextResponse.json({ error: 'Failed to create category' }, { status: 500 })
  }
}
