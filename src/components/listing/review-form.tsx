'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Star, Loader2, Check } from 'lucide-react'

interface Props {
  listingId: string
  sellerName: string
  alreadyReviewed?: boolean
}

const FIELDS = [
  { key: 'overall', label: 'Overall' },
  { key: 'communication', label: 'Communication' },
  { key: 'reliability', label: 'Reliability' },
  { key: 'as_described', label: 'Item as described' },
] as const

type FieldKey = typeof FIELDS[number]['key']

export default function ReviewForm({ listingId, sellerName, alreadyReviewed = false }: Props) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [ratings, setRatings] = useState<Record<FieldKey, number>>({
    overall: 0, communication: 0, reliability: 0, as_described: 0,
  })
  const [comment, setComment] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(alreadyReviewed)

  async function submit() {
    if (FIELDS.some(f => ratings[f.key] === 0)) {
      setError('Rate all four categories')
      return
    }
    setBusy(true)
    setError('')
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ listing_id: listingId, ...ratings, comment }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed')
      setDone(true)
      setTimeout(() => { setOpen(false); router.refresh() }, 1500)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed')
    } finally {
      setBusy(false)
    }
  }

  if (done) {
    return (
      <div className="bg-white rounded-lg p-4 border text-center" style={{ borderColor: '#dbdadb' }}>
        <Check size={20} className="inline-block text-green-600 mb-1" />
        <p className="text-sm font-semibold text-gray-700">Review submitted</p>
      </div>
    )
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="w-full flex items-center justify-center gap-2 py-2.5 rounded font-semibold text-sm border hover:bg-gray-50 transition-colors"
        style={{ borderColor: '#dbdadb', color: '#0D475C' }}
      >
        <Star size={14} />
        Leave a review
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-xl w-full max-w-md p-6 shadow-xl max-h-[90vh] overflow-y-auto">
            <h3 className="font-bold text-base mb-1" style={{ color: '#0D475C' }}>Review {sellerName}</h3>
            <p className="text-xs text-gray-400 mb-4">Rate this transaction. Other buyers see your review.</p>

            <div className="space-y-3">
              {FIELDS.map(f => (
                <div key={f.key} className="flex items-center justify-between gap-3">
                  <label className="text-sm font-medium text-gray-700">{f.label}</label>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map(n => (
                      <button
                        key={n}
                        type="button"
                        onClick={() => setRatings(r => ({ ...r, [f.key]: n }))}
                        className="p-0.5"
                      >
                        <Star
                          size={20}
                          fill={n <= ratings[f.key] ? '#f59e0b' : 'none'}
                          stroke={n <= ratings[f.key] ? '#f59e0b' : '#dbdadb'}
                        />
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <textarea
              rows={4}
              value={comment}
              onChange={e => setComment(e.target.value)}
              placeholder="Optional — tell other buyers about your experience"
              maxLength={2000}
              className="w-full border rounded-lg px-3 py-2.5 text-sm outline-none resize-none mt-4"
              style={{ borderColor: '#dbdadb' }}
            />

            {error && <p className="text-xs text-red-500 mt-2">{error}</p>}

            <div className="flex gap-3 mt-4">
              <button
                onClick={() => setOpen(false)}
                className="flex-1 py-2.5 rounded border text-sm font-medium text-gray-600 hover:bg-gray-50"
                style={{ borderColor: '#dbdadb' }}
              >
                Cancel
              </button>
              <button
                onClick={submit}
                disabled={busy}
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded text-white text-sm font-bold disabled:opacity-60"
                style={{ backgroundColor: '#e75462' }}
              >
                {busy && <Loader2 size={14} className="animate-spin" />}
                {busy ? 'Sending…' : 'Submit review'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
