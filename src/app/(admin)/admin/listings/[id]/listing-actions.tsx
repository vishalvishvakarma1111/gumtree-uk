'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, Check, X, Archive } from 'lucide-react'

interface Props {
  listingId: string
  currentStatus: string
}

export default function ListingActions({ listingId, currentStatus }: Props) {
  const router = useRouter()
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [rejectOpen, setRejectOpen] = useState(false)
  const [rejectReason, setRejectReason] = useState('')

  async function patch(body: Record<string, unknown>) {
    setBusy(true)
    setError('')
    try {
      const res = await fetch(`/api/admin/listings/${listingId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed')
      router.refresh()
      router.push('/admin/listings')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed')
    } finally {
      setBusy(false)
    }
  }

  return (
    <>
      <div className="flex flex-wrap gap-2 pt-3 border-t" style={{ borderColor: '#f0f0f0' }}>
        {currentStatus !== 'active' && (
          <button
            onClick={() => patch({ status: 'active' })}
            disabled={busy}
            className="flex items-center gap-1.5 px-4 py-2 rounded text-white text-sm font-bold disabled:opacity-60"
            style={{ backgroundColor: '#15803d' }}
          >
            {busy ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
            Approve
          </button>
        )}
        {currentStatus !== 'rejected' && (
          <button
            onClick={() => setRejectOpen(true)}
            disabled={busy}
            className="flex items-center gap-1.5 px-4 py-2 rounded text-white text-sm font-bold disabled:opacity-60"
            style={{ backgroundColor: '#b91c1c' }}
          >
            <X size={14} />
            Reject
          </button>
        )}
        {currentStatus === 'active' && (
          <button
            onClick={() => patch({ status: 'expired' })}
            disabled={busy}
            className="flex items-center gap-1.5 px-4 py-2 rounded text-sm font-bold border"
            style={{ borderColor: '#dbdadb', color: '#0D475C' }}
          >
            <Archive size={14} />
            Take down
          </button>
        )}
      </div>

      {error && <p className="text-xs text-red-500 mt-2">{error}</p>}

      {rejectOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-xl w-full max-w-md p-6 shadow-xl">
            <h3 className="font-bold text-base mb-3" style={{ color: '#b91c1c' }}>Reject listing</h3>
            <p className="text-xs text-gray-500 mb-2">Tell the seller why so they can fix the listing.</p>
            <textarea
              rows={4}
              value={rejectReason}
              onChange={e => setRejectReason(e.target.value)}
              placeholder="e.g. Photos missing, prohibited item, misleading title…"
              className="w-full border rounded-lg px-3 py-2.5 text-sm outline-none resize-none mb-3"
              style={{ borderColor: '#dbdadb' }}
            />
            <div className="flex gap-3">
              <button
                onClick={() => setRejectOpen(false)}
                className="flex-1 py-2.5 rounded border text-sm font-medium"
                style={{ borderColor: '#dbdadb', color: '#555' }}
              >
                Cancel
              </button>
              <button
                onClick={() => { setRejectOpen(false); patch({ status: 'rejected', rejection_reason: rejectReason || 'No reason provided' }) }}
                disabled={busy}
                className="flex-1 py-2.5 rounded text-white text-sm font-bold disabled:opacity-60"
                style={{ backgroundColor: '#b91c1c' }}
              >
                Confirm reject
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
