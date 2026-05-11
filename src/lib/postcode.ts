// UK postcode → coordinates lookup via api.postcodes.io.
// Free, public, no auth. Cached 24h via Next fetch cache.
// Never throws; returns null on bad input, 404, or network failure.

const UK_POSTCODE_REGEX = /^[A-Z]{1,2}\d[A-Z\d]?\s*\d[A-Z]{2}$/i

export interface PostcodeCoords {
  postcode: string
  latitude: number
  longitude: number
}

interface PostcodesIoResponse {
  status: number
  result: {
    postcode: string
    latitude: number
    longitude: number
  } | null
}

export function normalisePostcode(raw: string): string | null {
  if (!raw) return null
  const trimmed = raw.trim().toUpperCase().replace(/\s+/g, ' ')
  if (!UK_POSTCODE_REGEX.test(trimmed)) return null
  return trimmed.replace(/\s+/g, '')
}

export async function lookupPostcode(
  raw: string,
): Promise<PostcodeCoords | null> {
  const code = normalisePostcode(raw)
  if (!code) return null

  try {
    const res = await fetch(
      `https://api.postcodes.io/postcodes/${encodeURIComponent(code)}`,
      { next: { revalidate: 86400 } },
    )
    if (!res.ok) return null
    const body = (await res.json()) as PostcodesIoResponse
    if (!body.result) return null
    return {
      postcode: body.result.postcode,
      latitude: body.result.latitude,
      longitude: body.result.longitude,
    }
  } catch {
    return null
  }
}
