# Claude AI Integration

## Overview

Claude AI is used in one place: the "Post an Ad" form.
When a user fills in title + category, they can click "Generate with AI"
to auto-generate a professional listing description.

The API is ONLY called from the server-side API route — never from the browser.

---

## API Route

**Path**: `src/app/api/ai/generate-description/route.ts`

```ts
import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

export async function POST(req: NextRequest) {
  try {
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
          content: `Write a compelling classified ad description for Gumtree Australia.

Ad details:
- Title: ${title}
- Category: ${category}
- Condition: ${condition ?? 'not specified'}
- Price: ${price ? `$${price}` : 'not specified'}

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
```

---

## Client-Side Hook

```ts
// src/lib/hooks/useGenerateDescription.ts
"use client"
import { useState } from 'react'

export function useGenerateDescription() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const generate = async (params: {
    title: string
    category: string
    condition?: string
    price?: number
  }): Promise<string | null> => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/ai/generate-description', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      return data.description
    } catch (err: any) {
      setError(err.message ?? 'Something went wrong')
      return null
    } finally {
      setLoading(false)
    }
  }

  return { generate, loading, error }
}
```

---

## Usage in Post Ad Form

```tsx
// Inside PostAdForm component
const { generate, loading } = useGenerateDescription()

const handleGenerateDescription = async () => {
  if (!title || !selectedCategory) {
    alert('Please enter a title and select a category first')
    return
  }
  const result = await generate({ title, category: selectedCategory, condition, price })
  if (result) setDescription(result) // fills the textarea
}
```

---

## Future AI Enhancements (Day 8 bonus)

- **Smart search**: Natural language search — "I want a cheap iPhone under $300 in Sydney"
- **Price suggestion**: "Similar items sell for $150–200" based on category + title
- **Scam detection**: Flag suspicious messages in conversations

These are stretch goals — implement only if core features are complete.
