import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function PATCH(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

    const body = await req.json()
    const update: Record<string, unknown> = {}
    if (body.name !== undefined) update.name = String(body.name).slice(0, 100)
    if (body.location !== undefined) update.location = String(body.location).slice(0, 200)
    if (body.bio !== undefined) update.bio = String(body.bio).slice(0, 500)
    if (body.avatar_url !== undefined) update.avatar_url = body.avatar_url
    if (body.phone !== undefined) update.phone = body.phone

    if (Object.keys(update).length === 0) {
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('user_profiles')
      .update(update)
      .eq('id', user.id)
      .select('*')
      .single()

    if (error) throw error

    if (body.name) {
      await supabase.auth.updateUser({ data: { name: body.name } })
    }

    return NextResponse.json({ profile: data })
  } catch (error) {
    console.error('Profile PATCH error:', error)
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 })
  }
}
