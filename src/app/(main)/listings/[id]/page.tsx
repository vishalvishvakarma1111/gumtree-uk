import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { mockListings, similarListings } from '@/lib/data/mock-listings'
import { ListingCard } from '@/components/listings/listing-card'
import ImageGallery from '@/components/listing/image-gallery'
import ContactPanel from '@/components/listing/contact-panel'
import ReviewForm from '@/components/listing/review-form'
import ViewTracker from '@/components/listing/view-tracker'
import { isAdminUser } from '@/lib/admin'
import { formatPrice, timeAgo } from '@/lib/utils'
import type { Listing } from '@/types'
import {
  MapPin,
  Clock,
  Eye,
  Truck,
  Zap,
  Star,
  ShieldCheck,
  ChevronRight,
} from 'lucide-react'

const CONDITION_LABEL: Record<string, string> = {
  new: 'New',
  like_new: 'Like New',
  good: 'Good',
  fair: 'Fair',
  parts_only: 'Parts Only',
}

export default async function ListingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  let listing: Listing | undefined
  let isAuthenticated = false
  let dbSimilar: Listing[] | null = null
  let initialSaved = false
  let currentUserId: string | null = null
  let alreadyReviewed = false

  try {
    const supabase = await createClient()
    const [{ data: { user } }, { data: dbListing }] = await Promise.all([
      supabase.auth.getUser(),
      supabase
        .from('listings')
        .select('*, user_profiles(*), categories(*)')
        .eq('id', id)
        .maybeSingle(),
    ])
    isAuthenticated = !!user
    currentUserId = user?.id ?? null
    if (dbListing) {
      listing = dbListing as Listing
      const [{ data: similarRows }, { data: watch }] = await Promise.all([
        supabase
          .from('listings')
          .select('*, user_profiles(*), categories(*)')
          .eq('status', 'active')
          .eq('category_id', dbListing.category_id)
          .neq('id', id)
          .limit(6),
        user
          ? supabase
              .from('watchlist')
              .select('id')
              .eq('user_id', user.id)
              .eq('listing_id', id)
              .maybeSingle()
          : Promise.resolve({ data: null }),
      ])
      if (similarRows && similarRows.length > 0) dbSimilar = similarRows as Listing[]
      initialSaved = !!watch
      if (user && dbListing.user_id !== user.id) {
        const { data: existingReview } = await supabase
          .from('reviews')
          .select('id')
          .eq('reviewer_id', user.id)
          .eq('listing_id', id)
          .maybeSingle()
        alreadyReviewed = !!existingReview
      }
    }
  } catch { }

  if (!listing) {
    listing = mockListings.find(l => l.id === id) as Listing | undefined
  }
  if (!listing) notFound()

  // Hide non-active listings from non-owner / non-admin viewers.
  const supabaseAuth = await createClient()
  const { data: { user: viewer } } = await supabaseAuth.auth.getUser()
  const isOwner = !!viewer && viewer.id === listing.user_id
  const isAdmin = isAdminUser(viewer)
  if (listing.status !== 'active' && !isOwner && !isAdmin) {
    notFound()
  }

  const similar = dbSimilar ?? similarListings(id, listing.categories?.slug ?? '', 6)
  const seller = listing.user_profiles

  return (
    <div style={{ backgroundColor: '#f1f1f1', minHeight: '100vh' }}>
      <ViewTracker listingId={listing.id} />
      {/* ── Breadcrumb ── */}
      <div className="bg-white border-b" style={{ borderColor: '#dbdadb' }}>
        <div className="max-w-7xl mx-auto px-4 py-2.5">
          <nav className="flex items-center gap-1 text-xs text-gray-400">
            <Link href="/" className="hover:underline" style={{ color: '#0D475C' }}>Home</Link>
            <ChevronRight size={12} />
            <Link href="/browse" className="hover:underline" style={{ color: '#0D475C' }}>Browse</Link>
            {listing.categories && (
              <>
                <ChevronRight size={12} />
                <Link
                  href={`/browse?category=${listing.categories.slug}`}
                  className="hover:underline"
                  style={{ color: '#0D475C' }}
                >
                  {listing.categories.name}
                </Link>
              </>
            )}
            <ChevronRight size={12} />
            <span className="text-gray-400 truncate max-w-[200px]">{listing.title}</span>
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* ── Left column ── */}
          <div className="lg:col-span-2 space-y-4">
            {/* Image gallery */}
            <div className="bg-white rounded-lg p-3 border" style={{ borderColor: '#dbdadb' }}>
              <ImageGallery images={listing.images} title={listing.title} />
            </div>

            {/* Title + meta (mobile) */}
            <div className="lg:hidden bg-white rounded-lg p-4 border" style={{ borderColor: '#dbdadb' }}>
              <MobileTitleBlock listing={listing} />
            </div>

            {/* Description */}
            <div className="bg-white rounded-lg p-5 border" style={{ borderColor: '#dbdadb' }}>
              <h2 className="text-base font-bold mb-3" style={{ color: '#0D475C' }}>
                Description
              </h2>
              <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
                {listing.description}
              </p>
            </div>

            {/* Details table */}
            <div className="bg-white rounded-lg p-5 border" style={{ borderColor: '#dbdadb' }}>
              <h2 className="text-base font-bold mb-3" style={{ color: '#0D475C' }}>
                Ad details
              </h2>
              <dl className="grid grid-cols-2 gap-x-4 gap-y-2.5 text-sm">
                {[
                  ['Category', listing.categories?.name ?? '—'],
                  ['Condition', CONDITION_LABEL[listing.condition] ?? listing.condition],
                  ['Location', listing.location],
                  ['Price type', listing.price_type === 'negotiable' ? 'Negotiable' : listing.price_type === 'free' ? 'Free' : 'Fixed'],
                  ['Posted', new Date(listing.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })],
                  ['Ad ID', listing.id],
                ].map(([key, val]) => (
                  <div key={key} className="contents">
                    <dt className="text-gray-400 font-medium">{key}</dt>
                    <dd className="text-gray-700">{val}</dd>
                  </div>
                ))}
              </dl>
            </div>

            {/* Badges */}
            <div className="flex flex-wrap gap-2">
              {listing.offers_shipping && (
                <span className="flex items-center gap-1.5 text-xs font-medium text-gray-600 bg-white border rounded-full px-3 py-1.5" style={{ borderColor: '#dbdadb' }}>
                  <Truck size={12} />
                  Shipping available
                </span>
              )}
              {listing.is_urgent && (
                <span className="flex items-center gap-1.5 text-xs font-medium text-red-600 bg-red-50 border border-red-200 rounded-full px-3 py-1.5">
                  <Zap size={12} />
                  Urgent
                </span>
              )}
            </div>
          </div>

          {/* ── Right column ── */}
          <div className="space-y-4">
            {/* Price + title (desktop) */}
            <div className="hidden lg:block bg-white rounded-lg p-5 border" style={{ borderColor: '#dbdadb' }}>
              <DesktopTitleBlock listing={listing} />
            </div>

            {/* Contact panel (client) */}
            <ContactPanel listingId={listing.id} sellerName={seller?.name ?? 'Seller'} isAuthenticated={isAuthenticated} initialSaved={initialSaved} />

            {isAuthenticated && currentUserId && listing.user_id !== currentUserId && (
              <ReviewForm
                listingId={listing.id}
                sellerName={seller?.name ?? 'Seller'}
                alreadyReviewed={alreadyReviewed}
              />
            )}

            {/* Seller card */}
            {seller && (
              <div className="bg-white rounded-lg p-5 border" style={{ borderColor: '#dbdadb' }}>
                <div className="flex items-center gap-3 mb-4">
                  <div
                    className="w-11 h-11 rounded-full flex items-center justify-center text-white font-bold text-lg flex-shrink-0"
                    style={{ backgroundColor: '#0D475C' }}
                  >
                    {seller.name[0].toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-sm text-gray-900 truncate">{seller.name}</p>
                    <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                      <MapPin size={10} />
                      {seller.location}
                    </p>
                  </div>
                </div>
                <div className="flex gap-4 text-xs text-gray-500 mb-4">
                  <div className="flex items-center gap-1">
                    <Star size={12} className="text-amber-400 fill-amber-400" />
                    <span>{seller.reply_rate}% reply rate</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock size={12} />
                    <span>Replies in ~{seller.avg_reply_hours}h</span>
                  </div>
                </div>
                <Link
                  href={`/users/${seller.id}`}
                  className="block text-center text-xs font-semibold py-2 rounded border hover:bg-gray-50 transition-colors"
                  style={{ borderColor: '#0D475C', color: '#0D475C' }}
                >
                  View all seller&apos;s ads
                </Link>
              </div>
            )}

            {/* Safety tip */}
            <div className="rounded-lg p-4 text-xs text-gray-500 border" style={{ backgroundColor: '#f9f9f9', borderColor: '#e8e8e8' }}>
              <div className="flex items-start gap-2">
                <ShieldCheck size={16} className="flex-shrink-0 mt-0.5" style={{ color: '#0D475C' }} />
                <div>
                  <p className="font-semibold text-gray-600 mb-1">Stay safe</p>
                  <p className="leading-relaxed">
                    Meet in a public place, never pay in advance, and don't share personal financial details.{' '}
                    <Link href="#" className="hover:underline" style={{ color: '#0D475C' }}>
                      Read our safety tips
                    </Link>
                  </p>
                </div>
              </div>
            </div>

            {/* Meta info */}
            <div className="flex items-center justify-between text-xs text-gray-400 px-1">
              <span className="flex items-center gap-1"><Eye size={12} /> {listing.views_count.toLocaleString()} views</span>
              <span className="flex items-center gap-1"><Clock size={12} /> {timeAgo(listing.created_at)}</span>
            </div>
          </div>
        </div>

        {/* ── Similar listings ── */}
        {similar.length > 0 && (
          <section className="mt-10">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-extrabold" style={{ color: '#0D475C' }}>
                Similar ads
              </h2>
              <Link
                href={`/browse?category=${listing.categories?.slug ?? ''}`}
                className="text-sm font-semibold hover:underline"
                style={{ color: '#e75462' }}
              >
                See all →
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {similar.map(l => (
                <ListingCard key={l.id} listing={l} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  )
}

function DesktopTitleBlock({ listing }: { listing: (typeof mockListings)[0] }) {
  return (
    <>
      {listing.is_urgent && (
        <span className="inline-flex items-center gap-1 text-xs font-bold text-red-600 bg-red-50 border border-red-200 rounded-full px-2.5 py-1 mb-2">
          <Zap size={11} /> URGENT
        </span>
      )}
      <h1 className="text-lg font-extrabold text-gray-900 leading-snug mb-2">
        {listing.title}
      </h1>
      <p className="text-2xl font-extrabold mb-2" style={{ color: '#e75462' }}>
        {formatPrice(listing.price, listing.price_type)}
      </p>
      {listing.price_type === 'negotiable' && (
        <p className="text-xs text-gray-400 mb-3">Price negotiable</p>
      )}
      <div className="flex items-center gap-1.5 text-xs text-gray-400">
        <MapPin size={12} />
        <span>{listing.location}</span>
      </div>
    </>
  )
}

function MobileTitleBlock({ listing }: { listing: (typeof mockListings)[0] }) {
  return (
    <>
      <h1 className="text-base font-extrabold text-gray-900 mb-1">{listing.title}</h1>
      <p className="text-xl font-extrabold mb-1" style={{ color: '#e75462' }}>
        {formatPrice(listing.price, listing.price_type)}
      </p>
      <div className="flex items-center gap-1.5 text-xs text-gray-400 mt-1">
        <MapPin size={11} />
        <span>{listing.location}</span>
        <span className="mx-1">·</span>
        <Clock size={11} />
        <span>{timeAgo(listing.created_at)}</span>
      </div>
    </>
  )
}
