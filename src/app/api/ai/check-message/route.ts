import { NextRequest, NextResponse } from 'next/server'
import { anthropic } from '@/lib/claude'

export async function POST(req: NextRequest) {
  try {
    const { content } = await req.json()
    if (!content || typeof content !== 'string' || content.length > 4000) {
      return NextResponse.json({ error: 'Invalid content' }, { status: 400 })
    }

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 200,
      messages: [
        {
          role: 'user',
          content: `Analyse this Gumtree UK marketplace message for safety risks.
Flag if it contains: payment scams, off-platform contact attempts (asking for phone, email, WhatsApp before deal agreed), fake courier/escrow scams, advance-fee fraud, prize/lottery scams, prohibited items, threats.

Message:
"""
${content}
"""

Return ONLY JSON, no markdown:
{"risk": "low" | "medium" | "high", "reasons": ["short reason 1"], "advice": "one-sentence safety tip if risk medium/high, else empty string"}`,
        },
      ],
    })

    const text = message.content[0].type === 'text' ? message.content[0].text : ''
    const cleaned = text.replace(/```json|```/g, '').trim()
    let parsed: { risk?: string; reasons?: string[]; advice?: string } = {}
    try {
      parsed = JSON.parse(cleaned)
    } catch {
      return NextResponse.json({ risk: 'low', reasons: [], advice: '' })
    }

    return NextResponse.json({
      risk: ['low', 'medium', 'high'].includes(parsed.risk ?? '') ? parsed.risk : 'low',
      reasons: Array.isArray(parsed.reasons) ? parsed.reasons.slice(0, 3) : [],
      advice: parsed.advice ?? '',
    })
  } catch (error) {
    console.error('check-message error:', error)
    return NextResponse.json({ risk: 'low', reasons: [], advice: '' })
  }
}
