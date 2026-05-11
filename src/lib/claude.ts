import Anthropic from '@anthropic-ai/sdk'
import { NextResponse } from 'next/server'

export const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

/**
 * Convert an Anthropic SDK error into a friendly NextResponse.
 * - 401 / invalid_api_key → 503 "AI temporarily unavailable"
 * - 400 with "credit balance" → 503 "AI temporarily unavailable"
 * - 429 → 429 "Too many requests, try again in a moment"
 * - everything else → 500 with the supplied fallback message
 */
export function claudeErrorResponse(error: unknown, fallback: string): NextResponse {
  if (error instanceof Anthropic.APIError) {
    const msg = error.message || ''

    if (
      error.status === 401 ||
      msg.includes('credit balance') ||
      msg.includes('invalid x-api-key')
    ) {
      return NextResponse.json(
        { error: 'AI is temporarily unavailable. Please try again later.' },
        { status: 503 }
      )
    }

    if (error.status === 429) {
      return NextResponse.json(
        { error: 'Too many AI requests right now. Try again in a moment.' },
        { status: 429 }
      )
    }
  }

  return NextResponse.json({ error: fallback }, { status: 500 })
}
