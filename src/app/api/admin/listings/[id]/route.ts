import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'
import { isAdminUser } from '@/lib/admin'

const ALLOWED_STATUSES = ['active', 'pending', 'rejected', 'expired', 'sold', 'draft']

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
    if (!isAdminUser(user)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const { id } = await params
    const body = await req.json()
    const update: Record<string, unknown> = {}

    if (body.status !== undefined) {
      if (!ALLOWED_STATUSES.includes(body.status)) {
        return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
      }
      update.status = body.status
      if (body.status !== 'rejected') update.rejection_reason = null
    }
    if (body.status === 'rejected' && body.rejection_reason !== undefined) {
      update.rejection_reason = String(body.rejection_reason).slice(0, 1000)
    }

    if (Object.keys(update).length === 0) {
      return NextResponse.json({ error: 'Nothing to update' }, { status: 400 })
    }

    const admin = createServiceClient()
    const { error } = await admin.from('listings').update(update).eq('id', id)
    if (error) throw error

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('Admin listings PATCH error:', error)
    return NextResponse.json({ error: 'Failed to update' }, { status: 500 })
  }
}
