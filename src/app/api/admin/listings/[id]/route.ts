import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'
import { isAdminUser } from '@/lib/admin'
import { sendEmail, listingApprovedEmail, listingRejectedEmail } from '@/lib/email'

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
    const { data: updated, error } = await admin
      .from('listings')
      .update(update)
      .eq('id', id)
      .select('id, user_id, title, status, rejection_reason')
      .maybeSingle<{
        id: string
        user_id: string
        title: string
        status: string
        rejection_reason: string | null
      }>()
    if (error) throw error

    if (updated && (updated.status === 'active' || updated.status === 'rejected')) {
      notifyOwner(updated).catch(err => console.error('notifyOwner failed:', err))
    }

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('Admin listings PATCH error:', error)
    return NextResponse.json({ error: 'Failed to update' }, { status: 500 })
  }
}

async function notifyOwner(listing: { id: string; user_id: string; title: string; status: string; rejection_reason: string | null }) {
  const admin = createServiceClient()
  const { data: profile } = await admin
    .from('user_profiles')
    .select('name, email_notifications')
    .eq('id', listing.user_id)
    .maybeSingle<{ name: string; email_notifications: boolean }>()
  if (!profile || profile.email_notifications === false) return

  const { data: authUser } = await admin.auth.admin.getUserById(listing.user_id)
  const email = authUser?.user?.email
  if (!email) return

  const tpl = listing.status === 'active'
    ? listingApprovedEmail({
        recipientName: profile.name || 'there',
        listingTitle: listing.title,
        listingId: listing.id,
      })
    : listingRejectedEmail({
        recipientName: profile.name || 'there',
        listingTitle: listing.title,
        reason: listing.rejection_reason,
      })

  await sendEmail({ to: email, ...tpl })
}
