import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'
import { isAdminUser } from '@/lib/admin'
import { logAuditAction } from '@/lib/audit'

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
    const { data: row } = await admin
      .from('banned_words')
      .select('word')
      .eq('id', id)
      .maybeSingle<{ word: string }>()

    const { error } = await admin.from('banned_words').delete().eq('id', id)
    if (error) throw error

    await logAuditAction({
      actorId: user.id,
      action: 'banned_word.delete',
      entityType: 'banned_word',
      entityId: id,
      meta: { word: row?.word },
    }, admin)

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('Delete banned word error:', error)
    return NextResponse.json({ error: 'Failed to delete' }, { status: 500 })
  }
}
