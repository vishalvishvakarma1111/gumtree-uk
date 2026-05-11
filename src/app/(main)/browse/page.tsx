import { Suspense } from 'react'
import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import { ListingCard } from '@/components/listings/listing-card'
import { ListingCardSkeleton } from '@/components/listings/listing-card-skeleton'
import FilterSidebar from '@/components/filters/filter-sidebar'
import SortDropdown from '@/components/browse/sort-dropdown'
import ViewToggle from '@/components/browse/view-toggle'
import PostcodeRadiusSearch from '@/components/browse/postcode-radius-search'
import { mockListings } from '@/lib/data/mock-listings'
import { createClient } from '@/lib/supabase/server'
import { lookupPostcode, type PostcodeCoords } from '@/lib/postcode'
import { boundingBox, haversineMiles, parseRadius } from '@/lib/geo'
import { Listing } from '@/types'

interface SP {
  q?: string
  category?: string
  location?: string
  postcode?: string
  radius?: string
  min_price?: string
  max_price?: string
  conditions?: string
  urgent?: string
  sort?: string
  page?: string
  view?: string
}

const PAGE_SIZE = 20

async function fetchFromDb(
  params: SP,
  coords: PostcodeCoords | null,
): Promise<Listing[] | null> {
  try {
    const supabase = await createClient()
    let query = supabase
      .from('listings')
      .select('*, user_profiles(*), categories(*)')
      .eq('status', 'active')

    if (params.q) query = query.or(`title.ilike.%${params.q}%,description.ilike.%${params.q}%`)
    if (params.location) query = query.ilike('location', `%${params.location}%`)
    if (params.min_price) query = query.gte('price', Number(params.min_price))
    if (params.max_price) query = query.lte('price', Number(params.max_price))
    if (params.conditions) query = query.in('condition', params.conditions.split(','))
    if (params.urgent === '1') query = query.eq('is_urgent', true)

    if (coords) {
      const box = boundingBox(coords.latitude, coords.longitude, parseRadius(params.radius))
      query = query
        .not('latitude', 'is', null)
        .not('longitude', 'is', null)
        .gte('latitude', box.minLat)
        .lte('latitude', box.maxLat)
        .gte('longitude', box.minLng)
        .lte('longitude', box.maxLng)
    }

    if (params.category) {
      const { data: cat } = await supabase
        .from('categories')
        .select('id')
        .eq('slug', params.category)
        .maybeSingle()
      if (cat) query = query.eq('category_id', cat.id)
    }

    const sortMap: Record<string, [string, boolean]> = {
      price_asc: ['price', true],
      price_desc: ['price', false],
      oldest: ['created_at', true],
      newest: ['created_at', false],
    }
    const [col, asc] = sortMap[params.sort ?? 'newest'] ?? sortMap.newest
    query = query.order(col, { ascending: asc, nullsFirst: false })

    const { data, error } = await query.limit(60)
    if (error || !data) return null
    return data as Listing[]
  } catch {
    return null
  }
}

function applyFilters(params: SP, coords: PostcodeCoords | null): Listing[] {
  let out = [...mockListings] as Listing[]

  if (coords) {
    const radius = parseRadius(params.radius)
    out = out.filter(
      l =>
        l.latitude !== null &&
        l.longitude !== null &&
        haversineMiles(coords.latitude, coords.longitude, l.latitude, l.longitude) <= radius,
    )
  }

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

function sortListings(rows: Listing[], sort?: string): Listing[] {
  const out = [...rows]
  switch (sort) {
    case 'price_asc':
      out.sort((a, b) => (a.price ?? 0) - (b.price ?? 0)); break
    case 'price_desc':
      out.sort((a, b) => (b.price ?? 0) - (a.price ?? 0)); break
    case 'oldest':
      out.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()); break
    default:
      out.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
  }
  return out
}

function pageNumbers(current: number, total: number): (number | '…')[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)
  const out: (number | '…')[] = [1]
  if (current > 3) out.push('…')
  for (let p = Math.max(2, current - 1); p <= Math.min(total - 1, current + 1); p++) out.push(p)
  if (current < total - 2) out.push('…')
  out.push(total)
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
  const coords = params.postcode ? await lookupPostcode(params.postcode) : null
  const dbListings = await fetchFromDb(params, coords)
  const mockMatches = applyFilters(params, coords)
  const merged = dbListings
    ? [...dbListings, ...mockMatches.filter(m => !dbListings.some(d => d.id === m.id))]
    : mockMatches
  const sorted = sortListings(merged, params.sort)
  const totalCount = sorted.length
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE))
  const currentPage = Math.min(Math.max(1, Number(params.page ?? 1) || 1), totalPages)
  const start = (currentPage - 1) * PAGE_SIZE
  const listings = sorted.slice(start, start + PAGE_SIZE)
  const sort = params.sort ?? 'newest'
  const view: 'grid' | 'list' = params.view === 'list' ? 'list' : 'grid'

  function pageHref(p: number) {
    const sp = new URLSearchParams()
    if (params.q) sp.set('q', params.q)
    if (params.category) sp.set('category', params.category)
    if (params.location) sp.set('location', params.location)
    if (params.postcode) sp.set('postcode', params.postcode)
    if (params.radius) sp.set('radius', params.radius)
    if (params.min_price) sp.set('min_price', params.min_price)
    if (params.max_price) sp.set('max_price', params.max_price)
    if (params.conditions) sp.set('conditions', params.conditions)
    if (params.urgent) sp.set('urgent', params.urgent)
    if (params.sort) sp.set('sort', params.sort)
    sp.set('page', String(p))
    return `/browse?${sp.toString()}`
  }

  return (
    <div style={{ backgroundColor: '#f1f1f1', minHeight: '100vh' }}>
      <div className="bg-white border-b" style={{ borderColor: '#dbdadb' }}>
        <div className="max-w-7xl mx-auto px-4 py-2.5">
          <nav className="flex items-center gap-1 text-xs text-gray-400">
            <Link href="/" className="hover:underline" style={{ color: '#0D475C' }}>Home</Link>
            <ChevronRight size={12} />
            <Link href="/browse" className="hover:underline" style={{ color: '#0D475C' }}>Browse</Link>
            {params.category && (
              <>
                <ChevronRight size={12} />
                <span className="text-gray-400 capitalize">{params.category.replace(/-/g, ' ')}</span>
              </>
            )}
            {params.q && (
              <>
                <ChevronRight size={12} />
                <span className="text-gray-400">&quot;{params.q}&quot;</span>
              </>
            )}
          </nav>
        </div>
      </div>
      <div className="bg-white border-b" style={{ borderColor: '#dbdadb' }}>
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <h1 className="text-lg font-extrabold" style={{ color: '#0D475C' }}>
                {pageTitle(params)}
              </h1>
              <p className="text-xs text-gray-400 mt-0.5">
                {totalCount} {totalCount === 1 ? 'ad' : 'ads'} found
                {coords
                  ? ` · within ${parseRadius(params.radius)} mi of ${coords.postcode}`
                  : params.location
                  ? ` · ${params.location}`
                  : ' · United Kingdom'}
                {totalPages > 1 && ` · page ${currentPage} of ${totalPages}`}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Suspense fallback={<div className="w-16 h-8 bg-gray-100 rounded animate-pulse" />}>
                <ViewToggle current={view} />
              </Suspense>
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
            <Suspense fallback={null}>
              <PostcodeRadiusSearch
                defaultPostcode={params.postcode ?? ''}
                defaultRadius={params.radius}
              />
            </Suspense>
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
                <div className={view === 'list' ? 'flex flex-col gap-3' : 'grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3'}>
                  {listings.map(l => (
                    <ListingCard
                      key={l.id}
                      listing={l}
                      variant={view}
                      distanceMiles={
                        coords && l.latitude !== null && l.longitude !== null
                          ? haversineMiles(coords.latitude, coords.longitude, l.latitude, l.longitude)
                          : undefined
                      }
                    />
                  ))}
                </div>

                {totalPages > 1 && (
                  <div className="flex justify-center mt-8 gap-1 flex-wrap">
                    {currentPage > 1 && (
                      <Link
                        href={pageHref(currentPage - 1)}
                        className="px-3 h-9 rounded text-sm font-medium border flex items-center"
                        style={{ backgroundColor: '#fff', color: '#555', borderColor: '#dbdadb' }}
                      >
                        Prev
                      </Link>
                    )}
                    {pageNumbers(currentPage, totalPages).map((p, i) =>
                      typeof p === 'number' ? (
                        <Link
                          key={i}
                          href={pageHref(p)}
                          className="w-9 h-9 rounded text-sm font-medium border flex items-center justify-center"
                          style={
                            p === currentPage
                              ? { backgroundColor: '#0D475C', color: '#fff', borderColor: '#0D475C' }
                              : { backgroundColor: '#fff', color: '#555', borderColor: '#dbdadb' }
                          }
                        >
                          {p}
                        </Link>
                      ) : (
                        <span key={i} className="w-9 h-9 flex items-center justify-center text-sm text-gray-400">…</span>
                      )
                    )}
                    {currentPage < totalPages && (
                      <Link
                        href={pageHref(currentPage + 1)}
                        className="px-3 h-9 rounded text-sm font-medium border flex items-center"
                        style={{ backgroundColor: '#fff', color: '#555', borderColor: '#dbdadb' }}
                      >
                        Next
                      </Link>
                    )}
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
