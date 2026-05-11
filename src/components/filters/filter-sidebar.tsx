'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { ChevronDown, ChevronRight } from 'lucide-react'
import type { CategoryNode } from '@/lib/categories'

const CONDITIONS: { label: string; value: string }[] = [
  { label: 'New', value: 'new' },
  { label: 'Like New', value: 'like_new' },
  { label: 'Good', value: 'good' },
  { label: 'Fair', value: 'fair' },
  { label: 'Parts Only', value: 'parts_only' },
]

interface FilterSidebarProps {
  tree: CategoryNode[]
  defaultCategory?: string
  defaultMinPrice?: string
  defaultMaxPrice?: string
  defaultConditions?: string[]
  defaultUrgent?: boolean
}

function pickInitialExpanded(tree: CategoryNode[], selected: string): string | null {
  for (const node of tree) {
    if (node.slug === selected) return node.slug
    if (node.children.some(c => c.slug === selected)) return node.slug
  }
  return null
}

export default function FilterSidebar({
  tree,
  defaultCategory = '',
  defaultMinPrice = '',
  defaultMaxPrice = '',
  defaultConditions = [],
  defaultUrgent = false,
}: FilterSidebarProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [category, setCategory] = useState(defaultCategory)
  const [expanded, setExpanded] = useState<string | null>(
    pickInitialExpanded(tree, defaultCategory),
  )
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
    params.delete('page')
    router.push(`/browse?${params.toString()}`)
  }

  function clearFilters() {
    const q = searchParams.get('q')
    const loc = searchParams.get('location')
    const p = new URLSearchParams()
    if (q) p.set('q', q)
    if (loc) p.set('location', loc)
    setCategory('')
    setExpanded(null)
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

  function pickCategory(slug: string) {
    setCategory(slug)
  }

  function toggleExpanded(slug: string) {
    setExpanded(prev => (prev === slug ? null : slug))
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
        <div className="space-y-1 max-h-96 overflow-y-auto pr-1">
          <label className="flex items-center gap-2.5 cursor-pointer group">
            <input
              type="radio"
              name="category"
              value=""
              checked={category === ''}
              onChange={() => pickCategory('')}
              className="w-3.5 h-3.5 cursor-pointer"
              style={{ accentColor: '#0D475C' }}
            />
            <span
              className="text-sm leading-tight group-hover:text-gray-900"
              style={{ color: category === '' ? '#0D475C' : '#444' }}
            >
              All categories
            </span>
          </label>

          {tree.map(parent => {
            const isOpen = expanded === parent.slug
            const isSelected = category === parent.slug
            const hasSelectedChild = parent.children.some(c => c.slug === category)

            return (
              <div key={parent.slug}>
                <div className="flex items-center gap-1">
                  <label className="flex items-center gap-2.5 cursor-pointer group flex-1 min-w-0">
                    <input
                      type="radio"
                      name="category"
                      value={parent.slug}
                      checked={isSelected}
                      onChange={() => pickCategory(parent.slug)}
                      className="w-3.5 h-3.5 cursor-pointer"
                      style={{ accentColor: '#0D475C' }}
                    />
                    <span
                      className="text-sm leading-tight truncate group-hover:text-gray-900"
                      style={{
                        color: isSelected || hasSelectedChild ? '#0D475C' : '#444',
                        fontWeight: isSelected || hasSelectedChild ? 600 : 400,
                      }}
                    >
                      <span className="mr-1">{parent.icon}</span>
                      {parent.name}
                    </span>
                  </label>
                  {parent.children.length > 0 && (
                    <button
                      type="button"
                      onClick={() => toggleExpanded(parent.slug)}
                      className="p-1 text-gray-400 hover:text-gray-700"
                      aria-label={isOpen ? `Collapse ${parent.name}` : `Expand ${parent.name}`}
                      aria-expanded={isOpen}
                    >
                      {isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                    </button>
                  )}
                </div>

                {isOpen && parent.children.length > 0 && (
                  <div className="ml-5 mt-1 mb-1 space-y-1 border-l pl-3" style={{ borderColor: '#f0f0f0' }}>
                    {parent.children.map(child => (
                      <label key={child.slug} className="flex items-center gap-2.5 cursor-pointer group">
                        <input
                          type="radio"
                          name="category"
                          value={child.slug}
                          checked={category === child.slug}
                          onChange={() => pickCategory(child.slug)}
                          className="w-3.5 h-3.5 cursor-pointer"
                          style={{ accentColor: '#0D475C' }}
                        />
                        <span
                          className="text-xs leading-tight group-hover:text-gray-900"
                          style={{ color: category === child.slug ? '#0D475C' : '#666' }}
                        >
                          {child.name}
                        </span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
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
