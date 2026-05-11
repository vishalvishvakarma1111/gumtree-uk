'use client'

import { useState, useTransition, FormEvent } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { MapPin, Search } from 'lucide-react'
import { RADIUS_OPTIONS, parseRadius } from '@/lib/geo'

interface Props {
  defaultPostcode?: string
  defaultRadius?: string
}

export default function PostcodeRadiusSearch({
  defaultPostcode = '',
  defaultRadius,
}: Props) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [postcode, setPostcode] = useState(defaultPostcode)
  const [radius, setRadius] = useState(String(parseRadius(defaultRadius)))
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)

    const trimmed = postcode.trim()
    const sp = new URLSearchParams(searchParams.toString())

    if (!trimmed) {
      sp.delete('postcode')
      sp.delete('radius')
      sp.delete('page')
      startTransition(() => router.push(`/browse?${sp.toString()}`))
      return
    }

    try {
      const res = await fetch(`/api/postcode?code=${encodeURIComponent(trimmed)}`)
      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as { error?: string }
        setError(body.error ?? 'Postcode not found')
        return
      }
    } catch {
      setError('Could not check postcode. Try again.')
      return
    }

    sp.set('postcode', trimmed)
    sp.set('radius', radius)
    sp.delete('page')
    startTransition(() => router.push(`/browse?${sp.toString()}`))
  }

  return (
    <div
      className="bg-white rounded-lg border p-3 mb-3"
      style={{ borderColor: '#dbdadb' }}
    >
      <form onSubmit={onSubmit} className="flex flex-col gap-2">
        <label
          htmlFor="postcode-input"
          className="text-xs font-bold flex items-center gap-1"
          style={{ color: '#0D475C' }}
        >
          <MapPin size={12} />
          Postcode &amp; distance
        </label>
        <div className="flex gap-2">
          <input
            id="postcode-input"
            type="text"
            inputMode="text"
            autoComplete="postal-code"
            placeholder="e.g. SW1A 1AA"
            value={postcode}
            onChange={e => setPostcode(e.target.value)}
            className="flex-1 min-w-0 px-2.5 py-1.5 text-sm border rounded focus:outline-none focus:ring-2 focus:ring-offset-0"
            style={{ borderColor: error ? '#e75462' : '#dbdadb' }}
            aria-invalid={error ? 'true' : 'false'}
            aria-describedby={error ? 'postcode-error' : undefined}
          />
          <select
            aria-label="Radius in miles"
            value={radius}
            onChange={e => setRadius(e.target.value)}
            className="px-2 py-1.5 text-sm border rounded bg-white"
            style={{ borderColor: '#dbdadb' }}
          >
            {RADIUS_OPTIONS.map(r => (
              <option key={r} value={r}>
                +{r} mi
              </option>
            ))}
          </select>
        </div>
        {error && (
          <p id="postcode-error" className="text-xs" style={{ color: '#e75462' }}>
            {error}
          </p>
        )}
        <button
          type="submit"
          disabled={pending}
          className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded font-bold text-sm transition-opacity hover:opacity-90 disabled:opacity-50"
          style={{ backgroundColor: '#72ef36', color: '#0D475C' }}
        >
          <Search size={14} strokeWidth={3} />
          {pending ? 'Searching…' : 'Search'}
        </button>
      </form>
    </div>
  )
}
