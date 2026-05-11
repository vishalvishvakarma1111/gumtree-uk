'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Sparkles, Upload, X, Truck, Zap, ChevronLeft, ChevronRight, Loader2, Image as ImageIcon } from 'lucide-react'

interface PostAdFormProps {
  categorySlug: string
  categoryName: string
}

const CONDITIONS = [
  { value: 'new',       label: 'New' },
  { value: 'like_new',  label: 'Like New' },
  { value: 'good',      label: 'Good' },
  { value: 'fair',      label: 'Fair' },
  { value: 'parts_only',label: 'Parts Only' },
]

const PRICE_TYPES = [
  { value: 'fixed',      label: 'Fixed price' },
  { value: 'negotiable', label: 'Negotiable' },
  { value: 'free',       label: 'Free' },
]

const STEPS = ['Ad details', 'Photos', 'Location & options', 'Review & post']

export default function PostAdForm({ categorySlug, categoryName }: PostAdFormProps) {
  const router = useRouter()
  const [step, setStep] = useState(0)

  // Form fields
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState('')
  const [priceType, setPriceType] = useState('fixed')
  const [condition, setCondition] = useState('good')
  const [location, setLocation] = useState('')
  const [offersShipping, setOffersShipping] = useState(false)
  const [isUrgent, setIsUrgent] = useState(false)

  // Photo state
  const [photos, setPhotos] = useState<string[]>([])
  const [uploadingPhoto, setUploadingPhoto] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  // AI state
  const [aiLoading, setAiLoading] = useState(false)
  const [aiError, setAiError] = useState('')
  const [titleAiLoading, setTitleAiLoading] = useState(false)
  const [titleSuggestions, setTitleSuggestions] = useState<string[]>([])
  const [priceAiLoading, setPriceAiLoading] = useState(false)
  const [priceSuggestion, setPriceSuggestion] = useState<{ min: number | null; max: number | null; reasoning: string } | null>(null)

  // Submit state
  const [submitting, setSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  async function handleGenerateDescription() {
    if (!title.trim()) {
      setErrors(e => ({ ...e, title: 'Enter a title first' }))
      return
    }
    setAiLoading(true)
    setAiError('')
    try {
      const res = await fetch('/api/ai/generate-description', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          category: categoryName,
          condition,
          price: priceType !== 'free' && price ? Number(price) : undefined,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setDescription(data.description)
    } catch (err: unknown) {
      setAiError(err instanceof Error ? err.message : 'Failed to generate description')
    } finally {
      setAiLoading(false)
    }
  }

  async function handleImproveTitle() {
    if (!title.trim()) {
      setErrors(e => ({ ...e, title: 'Enter a title first' }))
      return
    }
    setTitleAiLoading(true)
    setAiError('')
    try {
      const res = await fetch('/api/ai/improve-title', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, category: categoryName }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setTitleSuggestions(data.suggestions ?? [])
    } catch (err: unknown) {
      setAiError(err instanceof Error ? err.message : 'Failed to improve title')
    } finally {
      setTitleAiLoading(false)
    }
  }

  async function handleSuggestPrice() {
    if (!title.trim()) {
      setErrors(e => ({ ...e, title: 'Enter a title first' }))
      return
    }
    setPriceAiLoading(true)
    setAiError('')
    try {
      const res = await fetch('/api/ai/suggest-price', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, category: categoryName, condition }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setPriceSuggestion({ min: data.min, max: data.max, reasoning: data.reasoning })
    } catch (err: unknown) {
      setAiError(err instanceof Error ? err.message : 'Failed to suggest price')
    } finally {
      setPriceAiLoading(false)
    }
  }

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
      setErrors(er => ({ ...er, photos: err instanceof Error ? err.message : 'Photo upload failed' }))
    } finally {
      setUploadingPhoto(false)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  function removePhoto(idx: number) {
    setPhotos(p => p.filter((_, i) => i !== idx))
  }

  function movePhoto(idx: number, direction: -1 | 1) {
    setPhotos(p => {
      const next = [...p]
      const target = idx + direction
      if (target < 0 || target >= next.length) return next
      ;[next[idx], next[target]] = [next[target], next[idx]]
      return next
    })
  }

  function validateStep(): boolean {
    const e: Record<string, string> = {}
    if (step === 0) {
      if (!title.trim()) e.title = 'Title is required'
      if (!description.trim()) e.description = 'Description is required'
      if (priceType !== 'free' && (!price || isNaN(Number(price)))) {
        e.price = 'Enter a valid price'
      }
    }
    if (step === 2) {
      if (!location.trim()) e.location = 'Location is required'
    }
    setErrors(e)
    return Object.keys(e).length === 0
  }

  function nextStep() {
    if (validateStep()) setStep(s => s + 1)
  }

  async function handleSubmit() {
    if (!validateStep()) return
    setSubmitting(true)
    try {
      const res = await fetch('/api/listings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          description,
          price: priceType !== 'free' ? Number(price) : null,
          price_type: priceType,
          condition,
          category_id: categorySlug,
          location,
          images: photos,
          offers_shipping: offersShipping,
          is_urgent: isUrgent,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      router.push('/account/my-ads?tab=pending&posted=1')
      router.refresh()
    } catch {
      setErrors({ submit: 'Failed to post ad. Please try again.' })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Stepper */}
      <div className="flex items-center gap-2 mb-8">
        {/* Step 0 = choose category (done) */}
        {['Choose category', ...STEPS].map((label, i) => (
          <div key={label} className="flex items-center gap-2">
            <div
              className="flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold flex-shrink-0"
              style={
                i < step + 1
                  ? { backgroundColor: '#0D475C', color: '#fff' }
                  : i === step + 1
                  ? { backgroundColor: '#0D475C', color: '#fff' }
                  : { backgroundColor: '#e8e8e8', color: '#aaa' }
              }
            >
              {i < step + 1 ? '✓' : i + 1}
            </div>
            <span
              className="text-xs font-medium hidden sm:block"
              style={{ color: i <= step + 1 ? '#0D475C' : '#aaa' }}
            >
              {label}
            </span>
            {i < 4 && <div className="w-6 h-px flex-shrink-0" style={{ backgroundColor: '#dbdadb' }} />}
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl border overflow-hidden" style={{ borderColor: '#dbdadb' }}>
        {/* Step header */}
        <div className="px-6 py-4 border-b" style={{ borderColor: '#f0f0f0' }}>
          <p className="text-xs text-gray-400 mb-0.5">Step {step + 2} of 5 · {categoryName}</p>
          <h2 className="font-bold text-base" style={{ color: '#0D475C' }}>
            {STEPS[step]}
          </h2>
        </div>

        <div className="p-6 space-y-5">
          {/* ── Step 0: Ad details ── */}
          {step === 0 && (
            <>
              <Field label="Title" error={errors.title}>
                <div className="relative">
                  <input
                    type="text"
                    value={title}
                    onChange={e => { setTitle(e.target.value); setErrors(er => ({ ...er, title: '' })) }}
                    placeholder={`e.g. ${categoryName === 'Electronics' ? 'iPhone 14 Pro 256GB Space Black' : `${categoryName} item for sale`}`}
                    maxLength={100}
                    className="w-full border rounded-lg px-3 py-2.5 pr-32 text-sm outline-none"
                    style={{ borderColor: errors.title ? '#e75462' : '#dbdadb' }}
                    onFocus={e => (e.currentTarget.style.borderColor = '#0D475C')}
                    onBlur={e => (e.currentTarget.style.borderColor = errors.title ? '#e75462' : '#dbdadb')}
                  />
                  <button
                    type="button"
                    onClick={handleImproveTitle}
                    disabled={titleAiLoading}
                    className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded border transition-colors disabled:opacity-60"
                    style={{ color: '#7c3aed', borderColor: '#ddd4fe', backgroundColor: '#f5f3ff' }}
                  >
                    {titleAiLoading ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
                    {titleAiLoading ? '…' : 'Improve'}
                  </button>
                </div>
                <p className="text-xs text-gray-400 mt-1">{title.length}/100 characters</p>
                {titleSuggestions.length > 0 && (
                  <div className="mt-2 space-y-1.5">
                    <p className="text-xs font-semibold" style={{ color: '#7c3aed' }}>AI suggestions — tap to use:</p>
                    {titleSuggestions.map((s, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => { setTitle(s); setTitleSuggestions([]) }}
                        className="block w-full text-left text-xs px-3 py-2 rounded-lg border hover:bg-gray-50 transition-colors"
                        style={{ borderColor: '#ddd4fe', backgroundColor: '#fafafe' }}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                )}
              </Field>

              <Field label="Description" error={errors.description}>
                <div className="relative">
                  <textarea
                    rows={6}
                    value={description}
                    onChange={e => { setDescription(e.target.value); setErrors(er => ({ ...er, description: '' })) }}
                    placeholder="Describe your item — condition, what's included, reason for selling…"
                    className="w-full border rounded-lg px-3 py-2.5 text-sm outline-none resize-none"
                    style={{ borderColor: errors.description ? '#e75462' : '#dbdadb' }}
                    onFocus={e => (e.currentTarget.style.borderColor = '#0D475C')}
                    onBlur={e => (e.currentTarget.style.borderColor = errors.description ? '#e75462' : '#dbdadb')}
                  />
                  <button
                    type="button"
                    onClick={handleGenerateDescription}
                    disabled={aiLoading}
                    className="absolute bottom-3 right-3 flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border transition-colors disabled:opacity-60"
                    style={{ color: '#7c3aed', borderColor: '#ddd4fe', backgroundColor: '#f5f3ff' }}
                  >
                    {aiLoading ? <Loader2 size={13} className="animate-spin" /> : <Sparkles size={13} />}
                    {aiLoading ? 'Generating…' : 'Generate with AI'}
                  </button>
                </div>
                {aiError && <p className="text-xs text-red-500 mt-1">{aiError}</p>}
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
                  <Field label="Price (£)" error={errors.price}>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">£</span>
                      <input
                        type="number"
                        value={price}
                        onChange={e => { setPrice(e.target.value); setErrors(er => ({ ...er, price: '' })) }}
                        placeholder="0.00"
                        min={0}
                        className="w-full border rounded-lg pl-7 pr-24 py-2.5 text-sm outline-none"
                        style={{ borderColor: errors.price ? '#e75462' : '#dbdadb' }}
                        onFocus={e => (e.currentTarget.style.borderColor = '#0D475C')}
                        onBlur={e => (e.currentTarget.style.borderColor = errors.price ? '#e75462' : '#dbdadb')}
                      />
                      <button
                        type="button"
                        onClick={handleSuggestPrice}
                        disabled={priceAiLoading}
                        className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded border transition-colors disabled:opacity-60"
                        style={{ color: '#7c3aed', borderColor: '#ddd4fe', backgroundColor: '#f5f3ff' }}
                      >
                        {priceAiLoading ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
                        {priceAiLoading ? '…' : 'Suggest'}
                      </button>
                    </div>
                    {priceSuggestion && (priceSuggestion.min !== null || priceSuggestion.max !== null) && (
                      <div className="mt-2 px-3 py-2 rounded-lg border text-xs" style={{ borderColor: '#ddd4fe', backgroundColor: '#fafafe' }}>
                        <p className="font-semibold" style={{ color: '#7c3aed' }}>
                          Suggested: £{priceSuggestion.min ?? '?'} – £{priceSuggestion.max ?? '?'}
                        </p>
                        {priceSuggestion.reasoning && <p className="text-gray-600 mt-0.5">{priceSuggestion.reasoning}</p>}
                        <div className="flex gap-2 mt-1.5">
                          {priceSuggestion.min !== null && (
                            <button
                              type="button"
                              onClick={() => { setPrice(String(priceSuggestion.min)); setPriceSuggestion(null) }}
                              className="text-xs font-semibold underline"
                              style={{ color: '#7c3aed' }}
                            >
                              Use £{priceSuggestion.min}
                            </button>
                          )}
                          {priceSuggestion.max !== null && (
                            <button
                              type="button"
                              onClick={() => { setPrice(String(priceSuggestion.max)); setPriceSuggestion(null) }}
                              className="text-xs font-semibold underline"
                              style={{ color: '#7c3aed' }}
                            >
                              Use £{priceSuggestion.max}
                            </button>
                          )}
                        </div>
                      </div>
                    )}
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
                      className="px-4 py-2 text-sm rounded-full border font-medium transition-colors"
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
            </>
          )}

          {/* ── Step 1: Photos ── */}
          {step === 1 && (
            <div>
              <p className="text-sm text-gray-500 mb-4">
                Add up to 10 photos. First photo will be your main image.
              </p>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 mb-4">
                {photos.map((url, idx) => (
                  <div key={url} className="relative aspect-square rounded-lg overflow-hidden border group" style={{ borderColor: '#dbdadb' }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={url} alt={`Photo ${idx + 1}`} className="w-full h-full object-cover" />
                    {idx === 0 && (
                      <span className="absolute top-1 left-1 text-xs font-bold text-white px-1.5 py-0.5 rounded" style={{ backgroundColor: '#0D475C' }}>
                        Main
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={() => removePhoto(idx)}
                      className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/60 flex items-center justify-center text-white hover:bg-black/80"
                      aria-label="Remove photo"
                    >
                      <X size={11} />
                    </button>
                    <div className="absolute bottom-1 left-1 right-1 flex justify-between opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        type="button"
                        onClick={() => movePhoto(idx, -1)}
                        disabled={idx === 0}
                        className="w-6 h-6 rounded-full bg-black/60 text-white flex items-center justify-center disabled:opacity-30 hover:bg-black/80"
                        aria-label="Move photo left"
                      >
                        <ChevronLeft size={13} />
                      </button>
                      <button
                        type="button"
                        onClick={() => movePhoto(idx, 1)}
                        disabled={idx === photos.length - 1}
                        className="w-6 h-6 rounded-full bg-black/60 text-white flex items-center justify-center disabled:opacity-30 hover:bg-black/80"
                        aria-label="Move photo right"
                      >
                        <ChevronRight size={13} />
                      </button>
                    </div>
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
                    {uploadingPhoto
                      ? <Loader2 size={20} className="animate-spin" />
                      : <Upload size={20} />
                    }
                    <span className="text-xs">{uploadingPhoto ? 'Uploading…' : 'Add photo'}</span>
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
              {errors.photos && <p className="text-xs text-red-500 mb-2">{errors.photos}</p>}
              {photos.length === 0 && (
                <div
                  className="rounded-lg p-6 text-center border-2 border-dashed cursor-pointer hover:border-gray-400 transition-colors"
                  style={{ borderColor: '#dbdadb' }}
                  onClick={() => fileRef.current?.click()}
                >
                  <ImageIcon size={32} className="mx-auto text-gray-300 mb-2" />
                  <p className="text-sm font-medium text-gray-500">Click to add photos</p>
                  <p className="text-xs text-gray-400 mt-1">JPEG, PNG or WebP · max 5MB each</p>
                </div>
              )}
            </div>
          )}

          {/* ── Step 2: Location & options ── */}
          {step === 2 && (
            <>
              <Field label="Location" error={errors.location}>
                <input
                  type="text"
                  value={location}
                  onChange={e => { setLocation(e.target.value); setErrors(er => ({ ...er, location: '' })) }}
                  placeholder="e.g. London, Manchester, Edinburgh"
                  className="w-full border rounded-lg px-3 py-2.5 text-sm outline-none"
                  style={{ borderColor: errors.location ? '#e75462' : '#dbdadb' }}
                  onFocus={e => (e.currentTarget.style.borderColor = '#0D475C')}
                  onBlur={e => (e.currentTarget.style.borderColor = errors.location ? '#e75462' : '#dbdadb')}
                />
              </Field>

              <div className="space-y-3">
                <p className="text-sm font-semibold" style={{ color: '#0D475C' }}>Options</p>
                <ToggleRow
                  icon={<Truck size={15} />}
                  label="Offers shipping"
                  description="You're willing to ship this item to the buyer"
                  checked={offersShipping}
                  onChange={setOffersShipping}
                />
                <ToggleRow
                  icon={<Zap size={15} />}
                  label="Mark as urgent"
                  description="Your ad will be highlighted with an 'Urgent' badge"
                  checked={isUrgent}
                  onChange={setIsUrgent}
                />
              </div>
            </>
          )}

          {/* ── Step 3: Review ── */}
          {step === 3 && (
            <div className="space-y-4">
              <ReviewRow label="Title" value={title} />
              <ReviewRow label="Category" value={categoryName} />
              <ReviewRow label="Condition" value={CONDITIONS.find(c => c.value === condition)?.label ?? condition} />
              <ReviewRow
                label="Price"
                value={priceType === 'free' ? 'Free' : priceType === 'negotiable' ? `£${price} (negotiable)` : `£${price}`}
              />
              <ReviewRow label="Location" value={location} />
              <ReviewRow label="Description" value={description} multiline />
              {photos.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Photos</p>
                  <div className="flex gap-2 flex-wrap">
                    {photos.map((url, i) => (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img key={i} src={url} alt="" className="w-16 h-16 rounded object-cover border" style={{ borderColor: '#dbdadb' }} />
                    ))}
                  </div>
                </div>
              )}
              {offersShipping && <ReviewRow label="Shipping" value="Available" />}
              {isUrgent && <ReviewRow label="Urgent" value="Yes" />}

              {errors.submit && (
                <p className="text-sm text-red-500 text-center">{errors.submit}</p>
              )}
            </div>
          )}
        </div>

        {/* Footer nav */}
        <div className="px-6 py-4 border-t flex justify-between" style={{ borderColor: '#f0f0f0' }}>
          <button
            type="button"
            onClick={() => step === 0 ? router.push('/post-ad') : setStep(s => s - 1)}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded border text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
            style={{ borderColor: '#dbdadb' }}
          >
            <ChevronLeft size={15} />
            {step === 0 ? 'Change category' : 'Back'}
          </button>

          {step < 3 ? (
            <button
              type="button"
              onClick={nextStep}
              className="flex items-center gap-1.5 px-6 py-2.5 rounded text-white text-sm font-bold transition-opacity hover:opacity-90"
              style={{ backgroundColor: '#0D475C' }}
            >
              Continue
              <ChevronRight size={15} />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={submitting}
              className="flex items-center gap-1.5 px-6 py-2.5 rounded text-white text-sm font-bold transition-opacity hover:opacity-90 disabled:opacity-60"
              style={{ backgroundColor: '#e75462' }}
            >
              {submitting ? <Loader2 size={15} className="animate-spin" /> : null}
              {submitting ? 'Posting…' : 'Post ad'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-semibold mb-1.5" style={{ color: '#0D475C' }}>{label}</label>
      {children}
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  )
}

function ToggleRow({
  icon, label, description, checked, onChange,
}: {
  icon: React.ReactNode
  label: string
  description: string
  checked: boolean
  onChange: (v: boolean) => void
}) {
  return (
    <label className="flex items-center gap-3 p-3.5 rounded-lg border cursor-pointer hover:bg-gray-50 transition-colors" style={{ borderColor: '#dbdadb' }}>
      <div className="text-gray-500">{icon}</div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-800">{label}</p>
        <p className="text-xs text-gray-400">{description}</p>
      </div>
      <div
        className="w-10 h-5 rounded-full relative flex-shrink-0 transition-colors"
        style={{ backgroundColor: checked ? '#0D475C' : '#e0e0e0' }}
        onClick={() => onChange(!checked)}
      >
        <div
          className="absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform"
          style={{ transform: checked ? 'translateX(21px)' : 'translateX(2px)' }}
        />
      </div>
    </label>
  )
}

function ReviewRow({ label, value, multiline }: { label: string; value: string; multiline?: boolean }) {
  return (
    <div className="border-b pb-3" style={{ borderColor: '#f5f5f5' }}>
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-0.5">{label}</p>
      <p className={`text-sm text-gray-800 ${multiline ? 'whitespace-pre-line' : ''}`}>{value || '—'}</p>
    </div>
  )
}
