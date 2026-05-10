import { describe, it, expect, vi, afterEach } from 'vitest'
import { timeAgo, formatPrice, cn } from './utils'

describe('formatPrice', () => {
  it('returns "Free" for free price type', () => {
    expect(formatPrice(0, 'free')).toBe('Free')
    expect(formatPrice(100, 'free')).toBe('Free')
    expect(formatPrice(null, 'free')).toBe('Free')
  })

  it('returns "Price on ask" when price is null/0', () => {
    expect(formatPrice(null, 'fixed')).toBe('Price on ask')
    expect(formatPrice(0, 'fixed')).toBe('Price on ask')
  })

  it('formats GBP with thousands separator', () => {
    expect(formatPrice(1234, 'fixed')).toBe('£1,234')
    expect(formatPrice(50, 'negotiable')).toBe('£50')
    expect(formatPrice(1000000, 'fixed')).toBe('£1,000,000')
  })
})

describe('timeAgo', () => {
  const NOW = new Date('2026-05-09T12:00:00Z').getTime()

  afterEach(() => vi.useRealTimers())

  function freeze() {
    vi.useFakeTimers()
    vi.setSystemTime(NOW)
  }

  it('returns "just now" when < 1 minute', () => {
    freeze()
    expect(timeAgo(new Date(NOW - 30 * 1000).toISOString())).toBe('just now')
  })

  it('returns minutes when < 1 hour', () => {
    freeze()
    expect(timeAgo(new Date(NOW - 5 * 60_000).toISOString())).toBe('5m ago')
    expect(timeAgo(new Date(NOW - 59 * 60_000).toISOString())).toBe('59m ago')
  })

  it('returns hours when < 24h', () => {
    freeze()
    expect(timeAgo(new Date(NOW - 3 * 3_600_000).toISOString())).toBe('3h ago')
  })

  it('returns days, weeks, months at higher ranges', () => {
    freeze()
    expect(timeAgo(new Date(NOW - 2 * 86_400_000).toISOString())).toBe('2d ago')
    expect(timeAgo(new Date(NOW - 14 * 86_400_000).toISOString())).toBe('2w ago')
    expect(timeAgo(new Date(NOW - 60 * 86_400_000).toISOString())).toBe('2mo ago')
  })
})

describe('cn', () => {
  it('joins truthy class names', () => {
    expect(cn('a', 'b', 'c')).toBe('a b c')
  })

  it('filters falsy values', () => {
    expect(cn('a', false, null, undefined, 'b')).toBe('a b')
  })
})
