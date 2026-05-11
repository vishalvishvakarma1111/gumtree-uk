import { NextRequest, NextResponse } from 'next/server'
import { lookupPostcode, normalisePostcode } from '@/lib/postcode'

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get('code')?.trim()
  if (!code) {
    return NextResponse.json({ error: 'Missing code' }, { status: 400 })
  }

  if (!normalisePostcode(code)) {
    return NextResponse.json({ error: 'Invalid UK postcode' }, { status: 400 })
  }

  const coords = await lookupPostcode(code)
  if (!coords) {
    return NextResponse.json({ error: 'Postcode not found' }, { status: 404 })
  }

  return NextResponse.json(coords)
}
