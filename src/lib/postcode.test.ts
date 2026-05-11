import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { lookupPostcode, normalisePostcode } from './postcode'

describe('normalisePostcode', () => {
  it('accepts a standard UK postcode', () => {
    expect(normalisePostcode('SW1A 1AA')).toBe('SW1A1AA')
  })

  it('uppercases and strips internal whitespace', () => {
    expect(normalisePostcode('  sw1a 1aa  ')).toBe('SW1A1AA')
  })

  it('accepts a postcode written without space', () => {
    expect(normalisePostcode('M11AE')).toBe('M11AE')
  })

  it('rejects an empty string', () => {
    expect(normalisePostcode('')).toBeNull()
  })

  it('rejects an obvious non-postcode', () => {
    expect(normalisePostcode('not a postcode')).toBeNull()
  })

  it('rejects a US zip code', () => {
    expect(normalisePostcode('94103')).toBeNull()
  })
})

describe('lookupPostcode', () => {
  const originalFetch = globalThis.fetch

  beforeEach(() => {
    globalThis.fetch = vi.fn() as unknown as typeof fetch
  })

  afterEach(() => {
    globalThis.fetch = originalFetch
  })

  it('returns coordinates for a valid postcode', async () => {
    ;(globalThis.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        status: 200,
        result: { postcode: 'SW1A 1AA', latitude: 51.5, longitude: -0.13 },
      }),
    })

    const coords = await lookupPostcode('SW1A 1AA')
    expect(coords).toEqual({
      postcode: 'SW1A 1AA',
      latitude: 51.5,
      longitude: -0.13,
    })
  })

  it('returns null without fetching when the postcode format is invalid', async () => {
    const coords = await lookupPostcode('not a postcode')
    expect(coords).toBeNull()
    expect(globalThis.fetch).not.toHaveBeenCalled()
  })

  it('returns null on 404', async () => {
    ;(globalThis.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: false,
      status: 404,
      json: async () => ({ status: 404, result: null }),
    })
    expect(await lookupPostcode('ZZ9 9ZZ')).toBeNull()
  })

  it('returns null when fetch throws', async () => {
    ;(globalThis.fetch as ReturnType<typeof vi.fn>).mockRejectedValueOnce(
      new Error('network down'),
    )
    expect(await lookupPostcode('SW1A 1AA')).toBeNull()
  })
})
