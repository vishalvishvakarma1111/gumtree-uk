'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { ChevronDown, ChevronRight, X } from 'lucide-react'
import type { CategoryNode } from '@/lib/categories'
import { DATE_POSTED_OPTIONS } from '@/lib/date-filter'
import { getCategoryAttrConfig } from '@/lib/category-attributes'

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
  defaultPosted?: string
  defaultAttrs?: Record<string, string>
}

type SectionKey = 'category' | 'attrs' | 'price' | 'condition' | 'date' | 'options'

function pickInitialExpanded(tree: CategoryNode[], selected: string): string | null {
  for (const node of tree) {
    if (node.slug === selected) return node.slug
    if (node.children.some(c => c.slug === selected)) return node.slug
  }
  return null
}

function Section({
  title,
  badge,
  open,
  onToggle,
  children,
}: {
  title: string
  badge?: number | string | null
  open: boolean
  onToggle: () => void
  children: React.ReactNode
}) {
  return (
    <div className="border-b" style={{ borderColor: '#f0f0f0' }}>
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50"
        aria-expanded={open}
      >
        <span className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-gray-500">
            {title}
          </span>
          {badge ? (
            <span
              className="text-[10px] font-bold px-1.5 py-0.5 rounded-full text-white"
              style={{ backgroundColor: '#0D475C' }}
            >
              {badge}
            </span>
          ) : null}
        </span>
        <ChevronDown
          size={16}
          className={`text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>
      {open && <div className="px-4 pb-4">{children}</div>}
    </div>
  )
}

export default function FilterSidebar({
  tree,
  defaultCategory = '',
  defaultMinPrice = '',
  defaultMaxPrice = '',
  defaultConditions = [],
  defaultUrgent = false,
  defaultPosted = '',
  defaultAttrs = {},
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
  const [posted, setPosted] = useState(defaultPosted)
  const [attrValues, setAttrValues] = useState<Record<string, string>>(defaultAttrs)

  const attrConfig = getCategoryAttrConfig(category)
  const activeAttrCount = Object.values(attrValues).filter(v => v && v !== 'false').length

  const initialOpen: Record<SectionKey, boolean> = {
    category: true,
    attrs: !!attrConfig && activeAttrCount > 0,
    price: !!(defaultMinPrice || defaultMaxPrice),
    condition: defaultConditions.length > 0,
    date: !!defaultPosted,
    options: defaultUrgent,
  }
  const [openSections, setOpenSections] = useState<Record<SectionKey, boolean>>(initialOpen)

  function toggleSection(k: SectionKey) {
    setOpenSections(s => ({ ...s, [k]: !s[k] }))
  }

  function detectTz(): string {
    try {
      return Intl.DateTimeFormat().resolvedOptions().timeZone || ''
    } catch {
      return ''
    }
  }

  function applyFilters() {
    const tz = detectTz()
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
    if (posted) {
      params.set('posted', posted)
      if (tz) params.set('tz', tz)
      else params.delete('tz')
    } else {
      params.delete('posted')
      params.delete('tz')
    }
    for (const key of [...params.keys()]) {
      if (key.startsWith('attr_')) params.delete(key)
    }
    for (const [k, v] of Object.entries(attrValues)) {
      if (v && v !== 'false') params.set(`attr_${k}`, v)
    }
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
    setPosted('')
    setAttrValues({})
    router.push(`/browse?${p.toString()}`)
  }

  function toggleCondition(val: string) {
    setConditions(prev =>
      prev.includes(val) ? prev.filter(c => c !== val) : [...prev, val]
    )
  }

  function pickCategory(slug: string) {
    setCategory(slug)
    setAttrValues({})
  }

  function toggleExpanded(slug: string) {
    setExpanded(prev => (prev === slug ? null : slug))
  }

  const selectedCategoryName =
    tree.find(p => p.slug === category)?.name ??
    tree.flatMap(p => p.children).find(c => c.slug === category)?.name ??
    null

  const priceBadge = minPrice || maxPrice ? `£${minPrice || '0'}–${maxPrice || '∞'}` : null
  const dateBadge = DATE_POSTED_OPTIONS.find(o => o.value === posted)?.label ?? null
  const optionsCount = (urgent ? 1 : 0) + (shipping ? 1 : 0)

  const totalActive =
    (category ? 1 : 0) +
    activeAttrCount +
    (minPrice || maxPrice ? 1 : 0) +
    conditions.length +
    (posted ? 1 : 0) +
    optionsCount

  return (
    <div
      className="bg-white rounded-lg border overflow-hidden text-sm sticky top-4"
      style={{ borderColor: '#dbdadb' }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-3 border-b"
        style={{ borderColor: '#dbdadb' }}
      >
        <span className="font-bold flex items-center gap-2" style={{ color: '#0D475C' }}>
          Filters
          {totalActive > 0 && (
            <span
              className="text-[10px] font-bold px-1.5 py-0.5 rounded-full text-white"
              style={{ backgroundColor: '#e75462' }}
            >
              {totalActive}
            </span>
          )}
        </span>
        {totalActive > 0 && (
          <button
            onClick={clearFilters}
            className="text-xs font-medium hover:underline flex items-center gap-1"
            style={{ color: '#e75462' }}
          >
            <X size={12} />
            Clear
          </button>
        )}
      </div>

      <div className="max-h-[calc(100vh-220px)] overflow-y-auto">
        {/* Category */}
        <Section
          title="Category"
          badge={selectedCategoryName}
          open={openSections.category}
          onToggle={() => toggleSection('category')}
        >
          <div className="space-y-1 max-h-60 overflow-y-auto pr-1">
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
                    <div
                      className="ml-5 mt-1 mb-1 space-y-1 border-l pl-3"
                      style={{ borderColor: '#f0f0f0' }}
                    >
                      {parent.children.map(child => (
                        <label
                          key={child.slug}
                          className="flex items-center gap-2.5 cursor-pointer group"
                        >
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
        </Section>

        {/* Category-specific attribute filters */}
        {attrConfig && attrConfig.filters.length > 0 && (
          <Section
            title="Details"
            badge={activeAttrCount || null}
            open={openSections.attrs}
            onToggle={() => toggleSection('attrs')}
          >
            {attrConfig.filters.map(filter => (
              <div key={filter.key} className="mb-3 last:mb-0">
                <p className="text-xs font-semibold text-gray-600 mb-1.5">
                  {filter.label}
                </p>
                {filter.type === 'boolean' ? (
                  <label className="flex items-center gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={attrValues[filter.key] === 'true'}
                      onChange={e =>
                        setAttrValues(a => ({
                          ...a,
                          [filter.key]: e.target.checked ? 'true' : '',
                        }))
                      }
                      className="w-3.5 h-3.5 rounded cursor-pointer"
                      style={{ accentColor: '#0D475C' }}
                    />
                    <span className="text-sm text-gray-700">{filter.label}</span>
                  </label>
                ) : (
                  <select
                    value={attrValues[filter.key] ?? ''}
                    onChange={e =>
                      setAttrValues(a => ({ ...a, [filter.key]: e.target.value }))
                    }
                    className="w-full border rounded px-2.5 py-1.5 text-sm outline-none bg-white"
                    style={{ borderColor: '#dbdadb' }}
                    onFocus={e => (e.currentTarget.style.borderColor = '#0D475C')}
                    onBlur={e => (e.currentTarget.style.borderColor = '#dbdadb')}
                  >
                    <option value="">Any</option>
                    {filter.options?.map(o => (
                      <option key={o} value={o}>
                        {o}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            ))}
          </Section>
        )}

        {/* Price */}
        <Section
          title="Price"
          badge={priceBadge}
          open={openSections.price}
          onToggle={() => toggleSection('price')}
        >
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
                className="w-full pl-6 pr-2 py-1.5 border rounded text-sm outline-none"
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
                className="w-full pl-6 pr-2 py-1.5 border rounded text-sm outline-none"
                style={{ borderColor: '#dbdadb' }}
                onFocus={e => (e.currentTarget.style.borderColor = '#0D475C')}
                onBlur={e => (e.currentTarget.style.borderColor = '#dbdadb')}
              />
            </div>
          </div>
        </Section>

        {/* Condition */}
        <Section
          title="Condition"
          badge={conditions.length || null}
          open={openSections.condition}
          onToggle={() => toggleSection('condition')}
        >
          <div className="grid grid-cols-2 gap-x-2 gap-y-1.5">
            {CONDITIONS.map(c => (
              <label
                key={c.value}
                className="flex items-center gap-2 cursor-pointer group"
              >
                <input
                  type="checkbox"
                  checked={conditions.includes(c.value)}
                  onChange={() => toggleCondition(c.value)}
                  className="w-3.5 h-3.5 rounded cursor-pointer"
                  style={{ accentColor: '#0D475C' }}
                />
                <span className="text-xs text-gray-700 group-hover:text-gray-900">
                  {c.label}
                </span>
              </label>
            ))}
          </div>
        </Section>

        {/* Date Posted */}
        <Section
          title="Date Posted"
          badge={dateBadge}
          open={openSections.date}
          onToggle={() => toggleSection('date')}
        >
          <select
            value={posted}
            onChange={e => setPosted(e.target.value)}
            className="w-full border rounded px-2.5 py-1.5 text-sm outline-none bg-white"
            style={{ borderColor: '#dbdadb' }}
            onFocus={e => (e.currentTarget.style.borderColor = '#0D475C')}
            onBlur={e => (e.currentTarget.style.borderColor = '#dbdadb')}
          >
            <option value="">Any time</option>
            {DATE_POSTED_OPTIONS.map(o => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </Section>

        {/* Options */}
        <Section
          title="Options"
          badge={optionsCount || null}
          open={openSections.options}
          onToggle={() => toggleSection('options')}
        >
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
        </Section>
      </div>

      {/* Sticky Apply footer */}
      <div
        className="px-4 py-3 border-t bg-white"
        style={{ borderColor: '#dbdadb' }}
      >
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
