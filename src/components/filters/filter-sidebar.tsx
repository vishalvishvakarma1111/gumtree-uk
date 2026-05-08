'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

const CATEGORIES = [
  { label: 'All categories', slug: '' },
  { label: 'Cars & Vehicles', slug: 'cars-vehicles' },
  { label: 'Property', slug: 'property' },
  { label: 'Jobs', slug: 'jobs' },
  { label: 'Electronics', slug: 'electronics' },
  { label: 'Home & Garden', slug: 'home-garden' },
  { label: 'Pets', slug: 'pets' },
  { label: 'Fashion', slug: 'fashion' },
  { label: 'Sport & Leisure', slug: 'sport-leisure' },
  { label: 'Kids & Baby', slug: 'kids-baby' },
  { label: 'Services', slug: 'services' },
  { label: 'Community', slug: 'community' },
  { label: 'Business & Industrial', slug: 'business-industrial' },
  { label: 'Other', slug: 'other' },
]

const CONDITIONS: { label: string; value: string }[] = [
  { label: 'New', value: 'new' },
  { label: 'Like New', value: 'like_new' },
  { label: 'Good', value: 'good' },
  { label: 'Fair', value: 'fair' },
  { label: 'Parts Only', value: 'parts_only' },
]

interface FilterSidebarProps {
  defaultCategory?: string
  defaultMinPrice?: string
  defaultMaxPrice?: string
  defaultConditions?: string[]
  defaultUrgent?: boolean
}

export default function FilterSidebar({
  defaultCategory = '',
  defaultMinPrice = '',
  defaultMaxPrice = '',
  defaultConditions = [],
  defaultUrgent = false,
}: FilterSidebarProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [category, setCategory] = useState(defaultCategory)
  const [minPrice, setMinPrice] = useState(defaultMinPrice)
  const [maxPrice, setMaxPrice] = useState(defaultMaxPrice)
  const [conditions, setConditions] = useState<string[]>(defaultConditions)
  const [urgent, setUrgent] = useState(defaultUrgent)
  const [shipping, setShipping] = useState(false)

  function applyFilters() {
    const params = new URLSearchParams(searchParams.toString())
    if (category) params.set('category', category)
    else params.delete('category')
    if (minPrice) params.set('min_price', minPrice)
    else params.delete('min_price')
    if (maxPrice) params.set('max_price', maxPrice)
    else params.delete('max_price')
    if (conditions.length) params.set('conditions', conditions.join(','))
    else params.delete('conditions')
    if (urgent) params.set('urgent', '1')
    else params.delete('urgent')
    router.push(`/browse?${params.toString()}`)
  }

  function clearFilters() {
    const q = searchParams.get('q')
    const loc = searchParams.get('location')
    const p = new URLSearchParams()
    if (q) p.set('q', q)
    if (loc) p.set('location', loc)
    setCategory('')
    setMinPrice('')
    setMaxPrice('')
    setConditions([])
    setUrgent(false)
    setShipping(false)
    router.push(`/browse?${p.toString()}`)
  }

  function toggleCondition(val: string) {
    setConditions(prev =>
      prev.includes(val) ? prev.filter(c => c !== val) : [...prev, val]
    )
  }

  return (
    <div
      className="bg-white rounded-lg border overflow-hidden text-sm"
      style={{ borderColor: '#dbdadb' }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-3 border-b"
        style={{ borderColor: '#dbdadb' }}
      >
        <span className="font-bold" style={{ color: '#0D475C' }}>
          Refine your results
        </span>
        <button
          onClick={clearFilters}
          className="text-xs font-medium hover:underline"
          style={{ color: '#e75462' }}
        >
          Clear all
        </button>
      </div>

      {/* Category */}
      <div className="px-4 py-4 border-b" style={{ borderColor: '#f0f0f0' }}>
        <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">
          Category
        </p>
        <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
          {CATEGORIES.map(cat => (
            <label key={cat.slug} className="flex items-center gap-2.5 cursor-pointer group">
              <input
                type="radio"
                name="category"
                value={cat.slug}
                checked={category === cat.slug}
                onChange={() => setCategory(cat.slug)}
                className="w-3.5 h-3.5 cursor-pointer"
                style={{ accentColor: '#0D475C' }}
              />
              <span
                className="text-sm leading-tight group-hover:text-gray-900"
                style={{ color: category === cat.slug ? '#0D475C' : '#444' }}
              >
                {cat.label}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Price */}
      <div className="px-4 py-4 border-b" style={{ borderColor: '#f0f0f0' }}>
        <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">
          Price
        </p>
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs">
              £
            </span>
            <input
              type="number"
              min="0"
              placeholder="Min"
              value={minPrice}
              onChange={e => setMinPrice(e.target.value)}
              className="w-full pl-6 pr-2 py-1.5 border border-gray-300 rounded text-sm outline-none"
              style={{ borderColor: '#dbdadb' }}
              onFocus={e => (e.currentTarget.style.borderColor = '#0D475C')}
              onBlur={e => (e.currentTarget.style.borderColor = '#dbdadb')}
            />
          </div>
          <span className="text-gray-300 text-lg">–</span>
          <div className="relative flex-1">
            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs">
              £
            </span>
            <input
              type="number"
              min="0"
              placeholder="Max"
              value={maxPrice}
              onChange={e => setMaxPrice(e.target.value)}
              className="w-full pl-6 pr-2 py-1.5 border border-gray-300 rounded text-sm outline-none"
              style={{ borderColor: '#dbdadb' }}
              onFocus={e => (e.currentTarget.style.borderColor = '#0D475C')}
              onBlur={e => (e.currentTarget.style.borderColor = '#dbdadb')}
            />
          </div>
        </div>
      </div>

      {/* Condition */}
      <div className="px-4 py-4 border-b" style={{ borderColor: '#f0f0f0' }}>
        <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">
          Condition
        </p>
        <div className="space-y-2">
          {CONDITIONS.map(c => (
            <label key={c.value} className="flex items-center gap-2.5 cursor-pointer group">
              <input
                type="checkbox"
                checked={conditions.includes(c.value)}
                onChange={() => toggleCondition(c.value)}
                className="w-3.5 h-3.5 rounded cursor-pointer"
                style={{ accentColor: '#0D475C' }}
              />
              <span className="text-sm text-gray-700 group-hover:text-gray-900">
                {c.label}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Options */}
      <div className="px-4 py-4 border-b" style={{ borderColor: '#f0f0f0' }}>
        <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">
          Options
        </p>
        <div className="space-y-2">
          <label className="flex items-center gap-2.5 cursor-pointer">
            <input
              type="checkbox"
              checked={urgent}
              onChange={e => setUrgent(e.target.checked)}
              className="w-3.5 h-3.5 rounded cursor-pointer"
              style={{ accentColor: '#0D475C' }}
            />
            <span className="text-sm text-gray-700">Urgent listings only</span>
          </label>
          <label className="flex items-center gap-2.5 cursor-pointer">
            <input
              type="checkbox"
              checked={shipping}
              onChange={e => setShipping(e.target.checked)}
              className="w-3.5 h-3.5 rounded cursor-pointer"
              style={{ accentColor: '#0D475C' }}
            />
            <span className="text-sm text-gray-700">Shipping available</span>
          </label>
        </div>
      </div>

      {/* Apply */}
      <div className="px-4 py-4">
        <button
          onClick={applyFilters}
          className="w-full py-2.5 rounded text-white text-sm font-bold transition-opacity hover:opacity-90"
          style={{ backgroundColor: '#0D475C' }}
        >
          Apply filters
        </button>
      </div>
    </div>
  )
}
