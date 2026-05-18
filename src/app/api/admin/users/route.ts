import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'
import { isAdminUser } from '@/lib/admin'

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
    if (!(await isAdminUser(supabase, user.id))) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const sp = req.nextUrl.searchParams
    const q = (sp.get('q') ?? '').trim()
    const filter = sp.get('filter') ?? 'all'
    const limit = Math.min(Number(sp.get('limit') ?? 50), 200)

    const admin = createServiceClient()
    let query = admin
      .from('user_profiles')
      .select('id, name, location, is_admin, banned_until, banned_reason, created_at')
      .order('created_at', { ascending: false })
      .limit(limit)

    if (q) query = query.ilike('name', `%${q}%`)
    if (filter === 'admins') query = query.eq('is_admin', true)
    if (filter === 'banned') query = query.gt('banned_until', new Date().toISOString())

    const { data, error } = await query
    if (error) throw error

    const ids = (data ?? []).map(u => u.id)
    const emails = new Map<string, string>()
    await Promise.all(
      ids.map(async id => {
        const { data: au } = await admin.auth.admin.getUserById(id)
        if (au?.user?.email) emails.set(id, au.user.email)
      })
    )

    return NextResponse.json({
      users: (data ?? []).map(u => ({ ...u, email: emails.get(u.id) ?? null })),
    })
  } catch (error) {
    console.error('List users error:', error)
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 })
  }
}
