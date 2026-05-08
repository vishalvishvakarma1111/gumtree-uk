import { Suspense } from 'react'
import Link from 'next/link'
import { ListingCard } from '@/components/listings/listing-card'
import { ListingCardSkeleton } from '@/components/listings/listing-card-skeleton'
import FilterSidebar from '@/components/filters/filter-sidebar'
import SortDropdown from '@/components/browse/sort-dropdown'
import { mockListings } from '@/lib/data/mock-listings'
import { Listing } from '@/types'
import { SlidersHorizontal } from 'lucide-react'

interface SP {
  q?: string
  category?: string
  location?: string
  min_price?: string
  max_price?: string
  conditions?: string
  urgent?: string
  sort?: string
}

function applyFilters(params: SP): Listing[] {
  let out = [...mockListings] as Listing[]

  if (params.q) {
    const q = params.q.toLowerCase()
    out = out.filter(
      l =>
        l.title.toLowerCase().includes(q) ||
        l.description.toLowerCase().includes(q)
    )
  }

  if (params.category) {
    const slug = params.category.toLowerCase()
    out = out.filter(l => l.categories?.slug === slug)
  }

  if (params.location) {
    const loc = params.location.toLowerCase()
    out = out.filter(l => l.location.toLowerCase().includes(loc))
  }

  if (params.min_price) {
    const min = parseFloat(params.min_price)
    out = out.filter(l => l.price !== null && l.price >= min)
  }

  if (params.max_price) {
    const max = parseFloat(params.max_price)
    out = out.filter(l => l.price !== null && l.price <= max)
  }

  if (params.conditions) {
    const conds = params.conditions.split(',')
    out = out.filter(l => conds.includes(l.condition))
  }

  if (params.urgent === '1') {
    out = out.filter(l => l.is_urgent)
  }

  switch (params.sort) {
    case 'price_asc':
      out.sort((a, b) => (a.price ?? 0) - (b.price ?? 0))
      break
    case 'price_desc':
      out.sort((a, b) => (b.price ?? 0) - (a.price ?? 0))
      break
    case 'oldest':
      out.sort(
        (a, b) =>
          new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      )
      break
    default:
      out.sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      )
  }

  return out
}

function pageTitle(params: SP): string {
  if (params.q && params.location) return `"${params.q}" in ${params.location}`
  if (params.q) return `"${params.q}"`
  if (params.category)
    return params.category.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
  if (params.location) return `Listings in ${params.location}`
  return 'All listings'
}

export default async function BrowsePage({
  searchParams,
}: {
  searchParams: Promise<SP>
}) {
  const params = await searchParams
  const listings = applyFilters(params)
  const sort = params.sort ?? 'newest'

  return (
    <div style={{ backgroundColor: '#f1f1f1', minHeight: '100vh' }}>
      {/* ── Results header bar ── */}
      <div className="bg-white border-b" style={{ borderColor: '#dbdadb' }}>
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <h1 className="text-lg font-extrabold" style={{ color: '#0D475C' }}>
                {pageTitle(params)}
              </h1>
              <p className="text-xs text-gray-400 mt-0.5">
                {listings.length} {listings.length === 1 ? 'ad' : 'ads'} found
                {params.location ? ` · ${params.location}` : ' · United Kingdom'}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-400 hidden sm:block">Sort by:</span>
              <Suspense fallback={<div className="w-36 h-8 bg-gray-100 rounded animate-pulse" />}>
                <SortDropdown current={sort} />
              </Suspense>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex gap-5 items-start">
          {/* ── Filter sidebar ── */}
          <aside className="hidden lg:block w-56 xl:w-64 flex-shrink-0">
            <Suspense
              fallback={
                <div className="bg-white rounded-lg border animate-pulse h-[480px]" style={{ borderColor: '#dbdadb' }} />
              }
            >
              <FilterSidebar
                defaultCategory={params.category ?? ''}
                defaultMinPrice={params.min_price ?? ''}
                defaultMaxPrice={params.max_price ?? ''}
                defaultConditions={params.conditions?.split(',') ?? []}
                defaultUrgent={params.urgent === '1'}
              />
            </Suspense>
          </aside>

          {/* ── Listing grid ── */}
          <div className="flex-1 min-w-0">
            {listings.length === 0 ? (
              <div
                className="bg-white rounded-xl py-20 text-center border"
                style={{ borderColor: '#dbdadb' }}
              >
                <p className="text-6xl mb-4">🔍</p>
                <h2 className="text-lg font-bold text-gray-700 mb-2">No ads found</h2>
                <p className="text-sm text-gray-400 mb-6">
                  Try different keywords, a wider location, or remove some filters.
                </p>
                <Link
                  href="/browse"
                  className="text-sm font-semibold hover:underline"
                  style={{ color: '#e75462' }}
                >
                  Clear all filters
                </Link>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3">
                  {listings.map(l => (
                    <ListingCard key={l.id} listing={l} />
                  ))}
                </div>

                {/* Pagination stub */}
                {listings.length >= 12 && (
                  <div className="flex justify-center mt-8 gap-1">
                    {[1, 2, 3, '...', 12].map((p, i) => (
                      <button
                        key={i}
                        className="w-9 h-9 rounded text-sm font-medium border transition-colors"
                        style={
                          p === 1
                            ? { backgroundColor: '#0D475C', color: '#fff', borderColor: '#0D475C' }
                            : { backgroundColor: '#fff', color: '#555', borderColor: '#dbdadb' }
                        }
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
