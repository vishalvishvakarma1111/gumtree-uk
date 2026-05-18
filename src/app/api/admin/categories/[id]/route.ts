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

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
    if (!(await isAdminUser(supabase, user.id))) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { id } = await params
    const body = await req.json()

    const update: Record<string, unknown> = { updated_at: new Date().toISOString() }
    if (typeof body.name === 'string' && body.name.trim()) {
      update.name = body.name.trim()
    }
    if (typeof body.slug === 'string' && body.slug.trim()) {
      const slug = slugify(body.slug)
      if (!slug) return NextResponse.json({ error: 'Invalid slug' }, { status: 400 })
      update.slug = slug
    }
    if (typeof body.icon === 'string') update.icon = body.icon.slice(0, 8)
    if (Number.isFinite(body.sort_order)) update.sort_order = Number(body.sort_order)
    if (body.parent_id === null || typeof body.parent_id === 'string') {
      update.parent_id = body.parent_id || null
    }

    const admin = createServiceClient()

    if (update.parent_id === id) {
      return NextResponse.json({ error: 'Category cannot be its own parent' }, { status: 400 })
    }
    if (update.parent_id) {
      const { data: parent } = await admin
        .from('categories')
        .select('id, parent_id')
        .eq('id', update.parent_id as string)
        .maybeSingle<{ id: string; parent_id: string | null }>()
      if (!parent) return NextResponse.json({ error: 'Parent not found' }, { status: 400 })
      if (parent.parent_id) {
        return NextResponse.json({ error: 'Nesting limited to two levels' }, { status: 400 })
      }
      const { count: childCount } = await admin
        .from('categories')
        .select('id', { count: 'exact', head: true })
        .eq('parent_id', id)
      if ((childCount ?? 0) > 0) {
        return NextResponse.json({ error: 'Category has children — cannot move under another parent' }, { status: 400 })
      }
    }

    const { data, error } = await admin
      .from('categories')
      .update(update)
      .eq('id', id)
      .select('id, name, slug, icon, parent_id, sort_order')
      .maybeSingle()
    if (error) {
      if (error.code === '23505') {
        return NextResponse.json({ error: 'Slug already exists' }, { status: 409 })
      }
      throw error
    }
    if (!data) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    await logAuditAction({
      actorId: user.id,
      action: 'category.update',
      entityType: 'category',
      entityId: id,
      meta: update,
    }, admin)

    return NextResponse.json({ category: data })
  } catch (error) {
    console.error('Update category error:', error)
    return NextResponse.json({ error: 'Failed to update category' }, { status: 500 })
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
    if (!(await isAdminUser(supabase, user.id))) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { id } = await params
    const admin = createServiceClient()

    const { count: listingCount } = await admin
      .from('listings')
      .select('id', { count: 'exact', head: true })
      .eq('category_id', id)
    if ((listingCount ?? 0) > 0) {
      return NextResponse.json({
        error: `Category has ${listingCount} listing(s) — move or delete them first`,
      }, { status: 409 })
    }

    const { count: childCount } = await admin
      .from('categories')
      .select('id', { count: 'exact', head: true })
      .eq('parent_id', id)
    if ((childCount ?? 0) > 0) {
      return NextResponse.json({
        error: `Category has ${childCount} subcategor${childCount === 1 ? 'y' : 'ies'} — delete them first`,
      }, { status: 409 })
    }

    const { error } = await admin.from('categories').delete().eq('id', id)
    if (error) throw error

    await logAuditAction({
      actorId: user.id,
      action: 'category.delete',
      entityType: 'category',
      entityId: id,
    }, admin)

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('Delete category error:', error)
    return NextResponse.json({ error: 'Failed to delete category' }, { status: 500 })
  }
}
