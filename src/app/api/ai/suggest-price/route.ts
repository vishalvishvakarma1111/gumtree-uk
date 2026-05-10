import { NextRequest, NextResponse } from 'next/server'
import { anthropic } from '@/lib/claude'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

    const { title, category, condition } = await req.json()
    if (!title) return NextResponse.json({ error: 'Title required' }, { status: 400 })

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 300,
      messages: [
        {
          role: 'user',
          content: `Suggest a fair UK secondhand market price range (in GBP) for this Gumtree listing.

Title: ${title}
Category: ${category ?? 'not specified'}
Condition: ${condition ?? 'not specified'}

Respond ONLY in JSON, no markdown fence, no commentary, like:
{"min": 80, "max": 120, "reasoning": "Short one-sentence reasoning."}`,
        },
      ],
    })

    const text = message.content[0].type === 'text' ? message.content[0].text : ''
    const cleaned = text.replace(/```json|```/g, '').trim()
    let parsed: { min?: number; max?: number; reasoning?: string } = {}
    try {
      parsed = JSON.parse(cleaned)
    } catch {
      return NextResponse.json({ error: 'Could not parse AI response' }, { status: 502 })
    }

    return NextResponse.json({
      min: typeof parsed.min === 'number' ? parsed.min : null,
      max: typeof parsed.max === 'number' ? parsed.max : null,
      reasoning: parsed.reasoning ?? '',
    })
  } catch (error) {
    console.error('suggest-price error:', error)
    return NextResponse.json({ error: 'Failed to suggest price' }, { status: 500 })
  }
}
