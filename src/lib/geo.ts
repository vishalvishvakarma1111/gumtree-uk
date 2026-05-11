// Geospatial helpers used by the postcode + radius search. Pure math,
// no I/O — safe to import from anywhere (client or server).

const EARTH_RADIUS_MILES = 3958.8
const MILES_PER_DEGREE_LAT = 69

export interface LatLng {
  latitude: number
  longitude: number
}

export interface BoundingBox {
  minLat: number
  maxLat: number
  minLng: number
  maxLng: number
}

function toRadians(deg: number): number {
  return (deg * Math.PI) / 180
}

/**
 * Bounding box (square) around a point in miles. Used as a cheap
 * prefilter for radius search — circle ⊂ square, so this returns a
 * superset; final precision (if needed) comes from `haversineMiles`.
 *
 * Approximate: longitude degrees shrink with latitude, so we use the
 * cosine of the centre latitude. Good to within ~1% for typical UK
 * radii.
 */
export function boundingBox(
  latitude: number,
  longitude: number,
  radiusMiles: number,
): BoundingBox {
  const latDelta = radiusMiles / MILES_PER_DEGREE_LAT
  const lngDelta =
    radiusMiles / (MILES_PER_DEGREE_LAT * Math.cos(toRadians(latitude)))
  return {
    minLat: latitude - latDelta,
    maxLat: latitude + latDelta,
    minLng: longitude - lngDelta,
    maxLng: longitude + lngDelta,
  }
}

/**
 * Great-circle distance in statute miles between two lat/lng points
 * using the haversine formula.
 */
export function haversineMiles(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
): number {
  const dLat = toRadians(lat2 - lat1)
  const dLng = toRadians(lng2 - lng1)
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLng / 2) ** 2
  return 2 * EARTH_RADIUS_MILES * Math.asin(Math.sqrt(a))
}

/** Valid UK radius options shown in the search UI. */
export const RADIUS_OPTIONS = [1, 5, 10, 25, 50, 100] as const
export type RadiusMiles = (typeof RADIUS_OPTIONS)[number]

export function parseRadius(value: string | number | undefined): RadiusMiles {
  const n = typeof value === 'string' ? Number(value) : value
  if (!n || Number.isNaN(n)) return 10
  const valid = (RADIUS_OPTIONS as readonly number[]).includes(n)
  return (valid ? n : 10) as RadiusMiles
}
