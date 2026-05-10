'use client'

import { useEffect } from 'react'

const COOLDOWN_MS = 60 * 60 * 1000 // 1 hour

export default function ViewTracker({ listingId }: { listingId: string }) {
  useEffect(() => {
    const key = `viewed:${listingId}`
    try {
      const last = Number(localStorage.getItem(key) ?? 0)
      if (Date.now() - last < COOLDOWN_MS) return
      localStorage.setItem(key, String(Date.now()))
    } catch {
      // localStorage unavailable; still fire once per mount.
    }
    fetch(`/api/listings/${listingId}/view`, { method: 'POST' }).catch(() => {})
  }, [listingId])

  return null
}
