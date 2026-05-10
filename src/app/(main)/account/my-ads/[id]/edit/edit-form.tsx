'use client'

import { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Loader2, Upload, X, Image as ImageIcon } from 'lucide-react'

interface ListingShape {
  id: string
  title: string
  description: string
  price: number | null
  price_type: string
  condition: string
  location: string
  images: string[]
  offers_shipping: boolean
  is_urgent: boolean
  status: string
}

const CONDITIONS = [
  { value: 'new', label: 'New' },
  { value: 'like_new', label: 'Like New' },
  { value: 'good', label: 'Good' },
  { value: 'fair', label: 'Fair' },
  { value: 'parts_only', label: 'Parts Only' },
]

const PRICE_TYPES = [
  { value: 'fixed', label: 'Fixed price' },
  { value: 'negotiable', label: 'Negotiable' },
  { value: 'free', label: 'Free' },
]

const STATUS_OPTIONS = [
  { value: 'active', label: 'Active' },
  { value: 'sold', label: 'Sold' },
  { value: 'draft', label: 'Draft' },
]

export default function EditListingForm({ listing }: { listing: ListingShape }) {
  const router = useRouter()
  const [title, setTitle] = useState(listing.title)
  const [description, setDescription] = useState(listing.description)
  const [price, setPrice] = useState(listing.price?.toString() ?? '')
  const [priceType, setPriceType] = useState(listing.price_type)
  const [condition, setCondition] = useState(listing.condition)
  const [location, setLocation] = useState(listing.location)
  const [photos, setPhotos] = useState<string[]>(listing.images ?? [])
  const [offersShipping, setOffersShipping] = useState(listing.offers_shipping)
  const [isUrgent, setIsUrgent] = useState(listing.is_urgent)
  const [status, setStatus] = useState(listing.status)
  const [uploadingPhoto, setUploadingPhoto] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  async function handlePhotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? [])
    if (files.length === 0) return
    const remaining = 10 - photos.length
    if (remaining <= 0) return
    const toUpload = files.slice(0, remaining)
    setUploadingPhoto(true)
    try {
      const results = await Promise.all(
        toUpload.map(async file => {
          const fd = new FormData()
          fd.append('file', file)
          const res = await fetch('/api/upload', { method: 'POST', body: fd })
          const data = await res.json()
          if (!res.ok) throw new Error(data.error)
          return data.url as string
        })
      )
      setPhotos(p => [...p, ...results])
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Upload failed')
    } finally {
      setUploadingPhoto(false)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  async function handleSave() {
    setSubmitting(true)
    setError('')
    try {
      const res = await fetch(`/api/listings/${listing.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          description,
          price: priceType === 'free' ? null : Number(price),
          price_type: priceType,
          condition,
          location,
          images: photos,
          offers_shipping: offersShipping,
          is_urgent: isUrgent,
          status,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Save failed')
      router.push('/account/my-ads')
      router.refresh()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Save failed')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="bg-white rounded-xl border p-6 space-y-5" style={{ borderColor: '#dbdadb' }}>
      <Field label="Title">
        <input
          type="text"
          value={title}
          onChange={e => setTitle(e.target.value)}
          maxLength={100}
          className="w-full border rounded-lg px-3 py-2.5 text-sm outline-none"
          style={{ borderColor: '#dbdadb' }}
        />
      </Field>

      <Field label="Description">
        <textarea
          rows={6}
          value={description}
          onChange={e => setDescription(e.target.value)}
          className="w-full border rounded-lg px-3 py-2.5 text-sm outline-none resize-none"
          style={{ borderColor: '#dbdadb' }}
        />
      </Field>

      <div className="grid grid-cols-2 gap-4">
        <Field label="Price type">
          <select
            value={priceType}
            onChange={e => setPriceType(e.target.value)}
            className="w-full border rounded-lg px-3 py-2.5 text-sm outline-none bg-white"
            style={{ borderColor: '#dbdadb' }}
          >
            {PRICE_TYPES.map(pt => (
              <option key={pt.value} value={pt.value}>{pt.label}</option>
            ))}
          </select>
        </Field>

        {priceType !== 'free' && (
          <Field label="Price (£)">
            <input
              type="number"
              value={price}
              onChange={e => setPrice(e.target.value)}
              min={0}
              className="w-full border rounded-lg px-3 py-2.5 text-sm outline-none"
              style={{ borderColor: '#dbdadb' }}
            />
          </Field>
        )}
      </div>

      <Field label="Condition">
        <div className="flex flex-wrap gap-2">
          {CONDITIONS.map(c => (
            <button
              key={c.value}
              type="button"
              onClick={() => setCondition(c.value)}
              className="px-3 py-1.5 rounded-lg border text-xs font-semibold transition-colors"
              style={
                condition === c.value
                  ? { backgroundColor: '#0D475C', color: '#fff', borderColor: '#0D475C' }
                  : { backgroundColor: '#fff', color: '#555', borderColor: '#dbdadb' }
              }
            >
              {c.label}
            </button>
          ))}
        </div>
      </Field>

      <Field label="Location">
        <input
          type="text"
          value={location}
          onChange={e => setLocation(e.target.value)}
          className="w-full border rounded-lg px-3 py-2.5 text-sm outline-none"
          style={{ borderColor: '#dbdadb' }}
        />
      </Field>

      <Field label="Photos">
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
          {photos.map((url, i) => (
            <div key={url} className="relative aspect-square rounded-lg overflow-hidden border" style={{ borderColor: '#dbdadb' }}>
              <Image src={url} alt="" fill className="object-cover" />
              <button
                type="button"
                onClick={() => setPhotos(p => p.filter((_, idx) => idx !== i))}
                className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/70 text-white flex items-center justify-center"
              >
                <X size={11} />
              </button>
            </div>
          ))}
          {photos.length < 10 && (
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              disabled={uploadingPhoto}
              className="aspect-square rounded-lg border-2 border-dashed flex flex-col items-center justify-center gap-1 text-gray-400 hover:border-gray-400 hover:text-gray-500 transition-colors disabled:opacity-60"
              style={{ borderColor: '#dbdadb' }}
            >
              {uploadingPhoto ? <Loader2 size={20} className="animate-spin" /> : <Upload size={20} />}
              <span className="text-xs">{uploadingPhoto ? 'Uploading…' : 'Add'}</span>
            </button>
          )}
        </div>
        <input
          ref={fileRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          className="hidden"
          onChange={handlePhotoUpload}
        />
        {photos.length === 0 && (
          <p className="text-xs text-gray-400 mt-2 flex items-center gap-1.5">
            <ImageIcon size={13} /> No photos yet — add up to 10.
          </p>
        )}
      </Field>

      <div className="grid grid-cols-2 gap-4">
        <Field label="Status">
          <select
            value={status}
            onChange={e => setStatus(e.target.value)}
            className="w-full border rounded-lg px-3 py-2.5 text-sm outline-none bg-white"
            style={{ borderColor: '#dbdadb' }}
          >
            {STATUS_OPTIONS.map(s => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
        </Field>
      </div>

      <div className="flex gap-4">
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={offersShipping} onChange={e => setOffersShipping(e.target.checked)} />
          Offers shipping
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={isUrgent} onChange={e => setIsUrgent(e.target.checked)} />
          Urgent
        </label>
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}

      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={() => router.back()}
          className="px-5 py-2.5 rounded-lg border text-sm font-semibold"
          style={{ borderColor: '#dbdadb', color: '#555' }}
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleSave}
          disabled={submitting}
          className="px-5 py-2.5 rounded-lg text-white text-sm font-semibold flex items-center gap-2 disabled:opacity-60"
          style={{ backgroundColor: '#e75462' }}
        >
          {submitting && <Loader2 size={14} className="animate-spin" />}
          {submitting ? 'Saving…' : 'Save changes'}
        </button>
      </div>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-semibold mb-1.5" style={{ color: '#0D475C' }}>{label}</label>
      {children}
    </div>
  )
}
