'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Heart, Loader2 } from 'lucide-react'

interface Props {
  listingId: string
  initialSaved?: boolean
  size?: number
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export function WatchlistButton({ listingId, initialSaved = false, size = 18 }: Props) {
  const router = useRouter()
  const [saved, setSaved] = useState(initialSaved)
  const [busy, setBusy] = useState(false)

  const isDemo = !UUID_RE.test(listingId)

  async function onClick(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    if (busy) return
    if (isDemo) return
    setBusy(true)
    const next = !saved
    setSaved(next)
    try {
      const res = next
        ? await fetch('/api/watchlist', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ listing_id: listingId }),
          })
        : await fetch(`/api/watchlist?listing_id=${listingId}`, { method: 'DELETE' })

      if (res.status === 401) {
        router.push(`/login?next=/browse`)
        return
      }
      if (!res.ok) throw new Error()
      router.refresh()
    } catch {
      setSaved(!next)
    } finally {
      setBusy(false)
    }
  }

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={saved ? 'Remove from watchlist' : 'Save to watchlist'}
      aria-pressed={saved}
      disabled={busy}
      className="flex items-center justify-center rounded-full bg-white shadow-md border hover:shadow-lg transition-shadow disabled:opacity-60"
      style={{
        width: size + 16,
        height: size + 16,
        borderColor: '#dbdadb',
      }}
    >
      {busy ? (
        <Loader2 size={size} className="animate-spin text-gray-400" />
      ) : (
        <Heart
          size={size}
          strokeWidth={2.2}
          fill={saved ? '#e75462' : 'none'}
          color={saved ? '#e75462' : '#0D475C'}
        />
      )}
    </button>
  )
}
