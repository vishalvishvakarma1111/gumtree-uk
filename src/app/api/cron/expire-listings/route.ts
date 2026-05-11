import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/service'

// Vercel Cron hits this daily. Bearer token (CRON_SECRET) prevents
// public abuse. Vercel injects `Authorization: Bearer ${CRON_SECRET}`
// automatically when the cron is declared in vercel.json.
export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET
  if (secret) {
    const header = req.headers.get('authorization')
    if (header !== `Bearer ${secret}`) {
      return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
    }
  }

  try {
    const admin = createServiceClient()
    const { data, error } = await admin
      .from('listings')
      .update({ status: 'expired' })
      .eq('status', 'active')
      .lt('expires_at', new Date().toISOString())
      .select('id')

    if (error) throw error
    return NextResponse.json({ ok: true, expired: data?.length ?? 0 })
  } catch (error) {
    console.error('Cron expire-listings error:', error)
    return NextResponse.json({ error: 'Cron failed' }, { status: 500 })
  }
}
