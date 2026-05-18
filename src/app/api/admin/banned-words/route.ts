import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'
import { isAdminUser } from '@/lib/admin'
import { logAuditAction } from '@/lib/audit'

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
    if (!(await isAdminUser(supabase, user.id))) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await req.json()
    const word = typeof body.word === 'string' ? body.word.trim().toLowerCase() : ''
    if (!word) return NextResponse.json({ error: 'Word required' }, { status: 400 })
    if (word.length > 64) return NextResponse.json({ error: 'Word too long' }, { status: 400 })

    const severity = body.severity === 'flag' ? 'flag' : 'block'

    const admin = createServiceClient()
    const { data, error } = await admin
      .from('banned_words')
      .insert({ word, severity, created_by: user.id })
      .select('id, word, severity, created_at')
      .single()
    if (error) {
      if (error.code === '23505') {
        return NextResponse.json({ error: 'Word already on list' }, { status: 409 })
      }
      throw error
    }

    await logAuditAction({
      actorId: user.id,
      action: 'banned_word.create',
      entityType: 'banned_word',
      entityId: data.id,
      meta: { word, severity },
    }, admin)

    return NextResponse.json({ banned_word: data })
  } catch (error) {
    console.error('Create banned word error:', error)
    return NextResponse.json({ error: 'Failed to create' }, { status: 500 })
  }
}
