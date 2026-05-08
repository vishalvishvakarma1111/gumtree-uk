import { NextRequest, NextResponse } from 'next/server'
import { anthropic } from '@/lib/claude'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

    const { title, category, condition, price } = await req.json()

    if (!title || !category) {
      return NextResponse.json({ error: 'Title and category are required' }, { status: 400 })
    }

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 400,
      messages: [
        {
          role: 'user',
          content: `Write a compelling classified ad description for Gumtree UK.

Ad details:
- Title: ${title}
- Category: ${category}
- Condition: ${condition ?? 'not specified'}
- Price: ${price ? `£${price}` : 'not specified'}

Write 2-3 short paragraphs. Be friendly, honest, and specific.
Mention condition, what's included, and why someone would want it.
Do not include the title or price in the description — just the body text.
Keep it under 150 words.`,
        },
      ],
    })

    const description = message.content[0].type === 'text' ? message.content[0].text : ''
    return NextResponse.json({ description })
  } catch (error) {
    console.error('Claude API error:', error)
    return NextResponse.json({ error: 'Failed to generate description' }, { status: 500 })
  }
}
