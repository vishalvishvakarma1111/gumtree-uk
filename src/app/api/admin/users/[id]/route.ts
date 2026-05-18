import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'
import { isAdminUser } from '@/lib/admin'
import { logAuditAction } from '@/lib/audit'

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
    if (id === user.id) {
      return NextResponse.json({ error: 'Cannot modify your own admin status or ban' }, { status: 400 })
    }

    const body = await req.json()
    const update: Record<string, unknown> = {}
    const auditMeta: Record<string, unknown> = {}

    if (typeof body.is_admin === 'boolean') {
      update.is_admin = body.is_admin
      auditMeta.is_admin = body.is_admin
    }

    if (body.ban === true) {
      const days = Number.isFinite(body.ban_days) ? Math.max(1, Math.min(3650, Number(body.ban_days))) : 30
      const until = new Date(Date.now() + days * 86400 * 1000).toISOString()
      update.banned_until = until
      update.banned_reason = typeof body.ban_reason === 'string' ? body.ban_reason.slice(0, 500) : null
      auditMeta.ban_days = days
      auditMeta.ban_reason = update.banned_reason
    } else if (body.ban === false) {
      update.banned_until = null
      update.banned_reason = null
      auditMeta.unban = true
    }

    if (Object.keys(update).length === 0) {
      return NextResponse.json({ error: 'Nothing to update' }, { status: 400 })
    }

    const admin = createServiceClient()
    const { data, error } = await admin
      .from('user_profiles')
      .update(update)
      .eq('id', id)
      .select('id, name, is_admin, banned_until, banned_reason')
      .maybeSingle()
    if (error) throw error
    if (!data) return NextResponse.json({ error: 'User not found' }, { status: 404 })

    await logAuditAction({
      actorId: user.id,
      action: body.ban === true ? 'user.ban'
            : body.ban === false ? 'user.unban'
            : 'user.update',
      entityType: 'user',
      entityId: id,
      meta: auditMeta,
    }, admin)

    return NextResponse.json({ user: data })
  } catch (error) {
    console.error('Update user error:', error)
    return NextResponse.json({ error: 'Failed to update user' }, { status: 500 })
  }
}
