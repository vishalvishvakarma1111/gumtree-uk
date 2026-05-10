import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'
import { isAdminUser } from '@/lib/admin'

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
    const { action } = await req.json()
    if (!['dismiss', 'resolve', 'takedown'].includes(action)) {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }

    const admin = createServiceClient()

    const { data: report, error: rErr } = await admin
      .from('reports')
      .select('listing_id')
      .eq('id', id)
      .maybeSingle()
    if (rErr) throw rErr
    if (!report) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    const newStatus = action === 'dismiss' ? 'dismissed' : 'resolved'

    const { error: uErr } = await admin
      .from('reports')
      .update({ status: newStatus, resolved_at: new Date().toISOString() })
      .eq('id', id)
    if (uErr) throw uErr

    if (action === 'takedown' && report.listing_id) {
      const { error: lErr } = await admin
        .from('listings')
        .update({ status: 'rejected', rejection_reason: 'Removed after report — violates marketplace rules.' })
        .eq('id', report.listing_id)
      if (lErr) throw lErr
    }

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('Admin reports PATCH error:', error)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
