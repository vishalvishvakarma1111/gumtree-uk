'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Trash2 } from 'lucide-react'

export interface BannedWordRow {
  id: string
  word: string
  severity: 'block' | 'flag'
  created_at: string
}

export default function BannedWordsClient({ initial }: { initial: BannedWordRow[] }) {
  const router = useRouter()
  const [, startTransition] = useTransition()
  const [word, setWord] = useState('')
  const [severity, setSeverity] = useState<'block' | 'flag'>('block')
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState<string | null>(null)

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    if (!word.trim()) return
    setBusy(true); setErr(null)
    try {
      const res = await fetch('/api/admin/banned-words', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ word: word.trim(), severity }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Add failed')
      setWord('')
      startTransition(() => router.refresh())
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Add failed')
    } finally {
      setBusy(false)
    }
  }

  async function handleDelete(id: string, w: string) {
    if (!confirm(`Remove "${w}" from the banned list?`)) return
    setBusy(true); setErr(null)
    try {
      const res = await fetch(`/api/admin/banned-words/${id}`, { method: 'DELETE' })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Delete failed')
      startTransition(() => router.refresh())
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Delete failed')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="bg-white rounded-xl border" style={{ borderColor: '#dbdadb' }}>
      <form onSubmit={handleAdd} className="p-3 border-b flex gap-2 flex-wrap" style={{ borderColor: '#f0f0f0' }}>
        <input
          className="border rounded px-3 py-2 text-sm flex-1 min-w-[200px]"
          placeholder="Word or phrase (e.g. scam)"
          value={word}
          onChange={e => setWord(e.target.value)}
          disabled={busy}
        />
        <select
          className="border rounded px-3 py-2 text-sm"
          value={severity}
          onChange={e => setSeverity(e.target.value as 'block' | 'flag')}
          disabled={busy}
        >
          <option value="block">block</option>
          <option value="flag">flag</option>
        </select>
        <button
          type="submit"
          className="inline-flex items-center gap-1.5 text-sm font-semibold px-3 py-2 rounded text-white disabled:opacity-50"
          style={{ backgroundColor: '#0D475C' }}
          disabled={busy || !word.trim()}
        >
          <Plus size={14} /> Add
        </button>
      </form>

      {err && (
        <div className="mx-3 mt-3 px-3 py-2 rounded bg-red-50 border border-red-200 text-xs text-red-700">
          {err}
        </div>
      )}

      {initial.length === 0 ? (
        <div className="py-16 text-center">
          <p className="text-5xl mb-3">🛡️</p>
          <p className="font-semibold text-gray-700">No banned words yet</p>
        </div>
      ) : (
        <ul className="divide-y" style={{ borderColor: '#f0f0f0' }}>
          {initial.map(w => (
            <li key={w.id} className="px-4 py-2.5 flex items-center gap-3">
              <span className="font-mono text-sm flex-1 text-gray-900">{w.word}</span>
              <span
                className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded"
                style={{
                  backgroundColor: w.severity === 'block' ? '#fee2e2' : '#fef3c7',
                  color: w.severity === 'block' ? '#b91c1c' : '#a16207',
                }}
              >
                {w.severity}
              </span>
              <button
                type="button"
                className="text-red-600 hover:bg-red-50 p-1.5 rounded disabled:opacity-50"
                onClick={() => handleDelete(w.id, w.word)}
                disabled={busy}
                title="Remove"
              >
                <Trash2 size={14} />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
