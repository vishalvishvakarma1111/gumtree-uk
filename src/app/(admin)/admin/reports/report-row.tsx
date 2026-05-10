'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'

export default function ReportRow({ id, listingId }: { id: string; listingId?: string }) {
  const router = useRouter()
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  async function patch(action: 'dismiss' | 'resolve' | 'takedown') {
    setBusy(true)
    setError('')
    try {
      const res = await fetch(`/api/admin/reports/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      })
      if (!res.ok) throw new Error('Failed')
      router.refresh()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="flex flex-wrap gap-2">
      <button
        onClick={() => patch('dismiss')}
        disabled={busy}
        className="text-xs font-semibold px-3 py-1.5 rounded border disabled:opacity-60"
        style={{ borderColor: '#dbdadb', color: '#0D475C' }}
      >
        Dismiss
      </button>
      <button
        onClick={() => patch('resolve')}
        disabled={busy}
        className="text-xs font-semibold px-3 py-1.5 rounded border disabled:opacity-60"
        style={{ borderColor: '#dbdadb', color: '#0D475C' }}
      >
        Mark resolved
      </button>
      {listingId && (
        <button
          onClick={() => patch('takedown')}
          disabled={busy}
          className="text-xs font-semibold px-3 py-1.5 rounded text-white disabled:opacity-60"
          style={{ backgroundColor: '#b91c1c' }}
        >
          Take down listing
        </button>
      )}
      {busy && <Loader2 size={12} className="animate-spin text-gray-400" />}
      {error && <span className="text-xs text-red-500">{error}</span>}
    </div>
  )
}
