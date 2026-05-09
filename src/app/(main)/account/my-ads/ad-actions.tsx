'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'

interface MyAdActionsProps {
  listingId: string
  status: string
}

export default function MyAdActions({ listingId, status }: MyAdActionsProps) {
  const router = useRouter()
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  async function setStatus(next: 'sold' | 'active') {
    if (busy) return
    setBusy(true)
    setError('')
    try {
      const res = await fetch(`/api/listings/${listingId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: next }),
      })
      if (!res.ok) throw new Error()
      router.refresh()
    } catch {
      setError('Failed to update')
    } finally {
      setBusy(false)
    }
  }

  async function remove() {
    if (busy) return
    if (!confirm('Delete this listing? This cannot be undone.')) return
    setBusy(true)
    setError('')
    try {
      const res = await fetch(`/api/listings/${listingId}`, { method: 'DELETE' })
      if (!res.ok) throw new Error()
      router.refresh()
    } catch {
      setError('Failed to delete')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="flex items-center gap-2 mt-3 text-xs">
      {status === 'active' && (
        <button
          onClick={() => setStatus('sold')}
          disabled={busy}
          className="px-3 py-1.5 rounded border font-medium hover:bg-gray-50 disabled:opacity-60"
          style={{ borderColor: '#dbdadb', color: '#0D475C' }}
        >
          Mark sold
        </button>
      )}
      {status === 'sold' && (
        <button
          onClick={() => setStatus('active')}
          disabled={busy}
          className="px-3 py-1.5 rounded border font-medium hover:bg-gray-50 disabled:opacity-60"
          style={{ borderColor: '#dbdadb', color: '#0D475C' }}
        >
          Relist
        </button>
      )}
      <button
        onClick={remove}
        disabled={busy}
        className="px-3 py-1.5 rounded border font-medium hover:bg-red-50 disabled:opacity-60"
        style={{ borderColor: '#fecaca', color: '#b91c1c' }}
      >
        Delete
      </button>
      {busy && <Loader2 size={12} className="animate-spin text-gray-400" />}
      {error && <span className="text-red-500">{error}</span>}
    </div>
  )
}
