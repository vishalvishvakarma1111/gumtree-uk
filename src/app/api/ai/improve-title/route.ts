import { NextRequest, NextResponse } from 'next/server'
import { anthropic } from '@/lib/claude'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

    const { title, category } = await req.json()
    if (!title) return NextResponse.json({ error: 'Title required' }, { status: 400 })

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 300,
      messages: [
        {
          role: 'user',
          content: `Rewrite this Gumtree UK classified ad title 3 different ways.
Make each more compelling and search-optimised.

Original title: ${title}
Category: ${category ?? 'not specified'}

Rules:
- Each suggestion under 60 chars.
- Lead with key product/brand/model.
- Plain text only, no quotes, no numbering, no markdown.
- Return exactly 3 lines, one suggestion per line.`,
        },
      ],
    })

    const text = message.content[0].type === 'text' ? message.content[0].text : ''
    const suggestions = text
      .split('\n')
      .map(l => l.replace(/^[\s\-\d.)]+/, '').trim())
      .filter(Boolean)
      .slice(0, 3)

    return NextResponse.json({ suggestions })
  } catch (error) {
    console.error('improve-title error:', error)
    return NextResponse.json({ error: 'Failed to improve title' }, { status: 500 })
  }
}
