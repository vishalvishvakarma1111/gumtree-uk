import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/lib/claude', () => ({
  anthropic: {
    messages: {
      create: vi.fn(),
    },
  },
}))

import { anthropic } from '@/lib/claude'
import { POST } from './route'

function makeReq(body: unknown): Request {
  return new Request('http://localhost/api/ai/parse-search', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}

describe('POST /api/ai/parse-search', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('rejects missing query', async () => {
    const res = await POST(makeReq({}) as never)
    expect(res.status).toBe(400)
  })

  it('parses Claude JSON response', async () => {
    ;(anthropic.messages.create as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
      content: [
        {
          type: 'text',
          text: '{"keyword":"iphone","min_price":null,"max_price":200,"location":"London","category":"electronics"}',
        },
      ],
    })

    const res = await POST(makeReq({ query: 'cheap iPhone under 200 in London' }) as never)
    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data.keyword).toBe('iphone')
    expect(data.max_price).toBe(200)
    expect(data.location).toBe('London')
    expect(data.category).toBe('electronics')
  })

  it('strips markdown fences', async () => {
    ;(anthropic.messages.create as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
      content: [
        {
          type: 'text',
          text: '```json\n{"keyword":"sofa","min_price":null,"max_price":null,"location":null,"category":null}\n```',
        },
      ],
    })

    const res = await POST(makeReq({ query: 'sofa' }) as never)
    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data.keyword).toBe('sofa')
  })

  it('rejects unknown category', async () => {
    ;(anthropic.messages.create as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
      content: [{ type: 'text', text: '{"keyword":"x","category":"made-up"}' }],
    })

    const res = await POST(makeReq({ query: 'x' }) as never)
    const data = await res.json()
    expect(data.category).toBeNull()
  })
})
