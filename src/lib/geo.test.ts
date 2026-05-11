import { describe, it, expect } from 'vitest'
import {
  boundingBox,
  haversineMiles,
  parseRadius,
  RADIUS_OPTIONS,
} from './geo'

describe('haversineMiles', () => {
  it('returns 0 for identical points', () => {
    expect(haversineMiles(51.5, -0.13, 51.5, -0.13)).toBe(0)
  })

  it('matches the known London → Manchester great-circle distance', () => {
    // London (51.5074, -0.1278) → Manchester (53.4808, -2.2426)
    // Authoritative value ≈ 162 statute miles. Allow ±2 mi tolerance.
    const d = haversineMiles(51.5074, -0.1278, 53.4808, -2.2426)
    expect(d).toBeGreaterThan(160)
    expect(d).toBeLessThan(165)
  })

  it('is symmetric', () => {
    const a = haversineMiles(51.5, -0.13, 55.95, -3.19)
    const b = haversineMiles(55.95, -3.19, 51.5, -0.13)
    expect(a).toBeCloseTo(b, 6)
  })
})

describe('boundingBox', () => {
  it('produces a box that contains the centre point', () => {
    const box = boundingBox(51.5, -0.13, 10)
    expect(box.minLat).toBeLessThan(51.5)
    expect(box.maxLat).toBeGreaterThan(51.5)
    expect(box.minLng).toBeLessThan(-0.13)
    expect(box.maxLng).toBeGreaterThan(-0.13)
  })

  it('returns a box whose half-height in miles matches the radius', () => {
    const box = boundingBox(51.5, -0.13, 10)
    // North edge from centre should equal ~radius miles.
    const north = haversineMiles(51.5, -0.13, box.maxLat, -0.13)
    expect(north).toBeGreaterThan(9.5)
    expect(north).toBeLessThan(10.5)
  })

  it('scales with radius', () => {
    const small = boundingBox(51.5, -0.13, 1)
    const big = boundingBox(51.5, -0.13, 50)
    expect(big.maxLat - big.minLat).toBeGreaterThan(small.maxLat - small.minLat)
  })
})

describe('parseRadius', () => {
  it('returns 10 by default when undefined', () => {
    expect(parseRadius(undefined)).toBe(10)
  })

  it('returns 10 when value is not a valid option', () => {
    expect(parseRadius('999')).toBe(10)
    expect(parseRadius('abc')).toBe(10)
    expect(parseRadius('')).toBe(10)
  })

  it('accepts every documented radius option', () => {
    for (const r of RADIUS_OPTIONS) {
      expect(parseRadius(String(r))).toBe(r)
    }
  })
})
