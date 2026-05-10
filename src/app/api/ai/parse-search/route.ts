import { NextRequest, NextResponse } from 'next/server'
import { anthropic } from '@/lib/claude'

const CATEGORY_SLUGS = [
  'cars-vehicles', 'for-sale', 'services', 'property', 'pets', 'jobs', 'community',
]

export async function POST(req: NextRequest) {
  try {
    const { query } = await req.json()
    if (!query || typeof query !== 'string') {
      return NextResponse.json({ error: 'query required' }, { status: 400 })
    }

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 250,
      messages: [
        {
          role: 'user',
          content: `Parse this Gumtree UK search query into structured filters.

Query: "${query}"

Return ONLY JSON, no markdown fence:
{
  "keyword": "main item being searched, no price/location words",
  "min_price": null or number (GBP),
  "max_price": null or number (GBP),
  "location": null or "UK city/town",
  "category": null or one of [${CATEGORY_SLUGS.join(', ')}]
}

Rules:
- "cheap" / "budget" → max_price 200 if no number given
- "under £X" → max_price X. "over £X" → min_price X. "£X-£Y" → both
- Strip price/location/category words from keyword
- Lowercase keyword`,
        },
      ],
    })

    const text = message.content[0].type === 'text' ? message.content[0].text : ''
    const cleaned = text.replace(/```json|```/g, '').trim()

    let parsed: {
      keyword?: string
      min_price?: number | null
      max_price?: number | null
      location?: string | null
      category?: string | null
    } = {}
    try {
      parsed = JSON.parse(cleaned)
    } catch {
      return NextResponse.json({ error: 'Could not parse AI response' }, { status: 502 })
    }

    return NextResponse.json({
      keyword: parsed.keyword ?? '',
      min_price: typeof parsed.min_price === 'number' ? parsed.min_price : null,
      max_price: typeof parsed.max_price === 'number' ? parsed.max_price : null,
      location: parsed.location ?? null,
      category: parsed.category && CATEGORY_SLUGS.includes(parsed.category) ? parsed.category : null,
    })
  } catch (error) {
    console.error('parse-search error:', error)
    return NextResponse.json({ error: 'Failed to parse query' }, { status: 500 })
  }
}
