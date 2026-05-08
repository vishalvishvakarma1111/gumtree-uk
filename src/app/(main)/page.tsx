import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { ListingCard } from '@/components/listings/listing-card'
import { Listing } from '@/types'

const CATEGORIES = [
  { name: 'Cars & Vehicles', slug: 'cars-vehicles', bg: '#1a3a5c', emoji: '🚗' },
  { name: 'Home & Garden', slug: 'home-garden', bg: '#2d6a3f', emoji: '🏡' },
  { name: 'Tradespeople', slug: 'services', bg: '#7a4a1e', emoji: '🔧' },
  { name: 'Baby & Kids', slug: 'kids', bg: '#b03060', emoji: '🧸' },
  { name: 'Fashion', slug: 'fashion', bg: '#5a2d82', emoji: '👗' },
  { name: 'Sports & Leisure', slug: 'sport', bg: '#1a6b6b', emoji: '⚽' },
  { name: 'Computers', slug: 'electronics', bg: '#2a4080', emoji: '💻' },
  { name: 'Properties', slug: 'property', bg: '#0D475C', emoji: '🏠' },
]

const UK_LOCATIONS = [
  'London', 'Glasgow', 'Manchester', 'Edinburgh', 'Bristol',
  'Birmingham', 'Leeds', 'Cardiff', 'Belfast', 'Sheffield',
]

async function getLatestListings(): Promise<Listing[]> {
  try {
    const supabase = await createClient()
    const { data } = await supabase
      .from('listings')
      .select('*, user_profiles(name, avatar_url), categories(name, slug)')
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(8)
    return (data as Listing[]) ?? []
  } catch {
    return []
  }
}

export default async function HomePage() {
  const listings = await getLatestListings()

  return (
    <div style={{ backgroundColor: '#f1f1f1' }}>
      {/* Hero */}
      <section
        className="relative py-16 px-4"
        style={{ backgroundColor: '#0D475C' }}
      >
        <div className="max-w-3xl mx-auto text-center text-white">
          <h1 className="text-4xl md:text-5xl font-bold mb-2 leading-tight">
            Free local classifieds
          </h1>
          <p className="text-lg text-white/80 mb-8">
            One place for all your Ads
          </p>

          {/* Hero search */}
          <form action="/browse" method="GET" className="mb-8">
            <div className="flex flex-col sm:flex-row gap-0 bg-white rounded-md overflow-hidden shadow-lg">
              <input
                name="q"
                type="text"
                placeholder="What are you looking for?"
                className="flex-1 px-4 py-3.5 text-gray-800 text-sm outline-none"
              />
              <div className="hidden sm:block w-px bg-gray-200 my-2" />
              <input
                name="location"
                type="text"
                placeholder="Location e.g. London"
                className="sm:w-44 px-4 py-3.5 text-gray-800 text-sm outline-none"
              />
              <button
                type="submit"
                className="px-8 py-3.5 text-sm font-bold text-white transition-opacity hover:opacity-90"
                style={{ backgroundColor: '#e75462' }}
              >
                Search
              </button>
            </div>
          </form>

          {/* Stats */}
          <div className="flex justify-center gap-12">
            <div className="text-center">
              <p className="text-2xl font-bold text-white">600K</p>
              <p className="text-xs text-white/70 uppercase tracking-wider">Daily Active Users</p>
            </div>
            <div className="w-px bg-white/20" />
            <div className="text-center">
              <p className="text-2xl font-bold text-white">30K</p>
              <p className="text-xs text-white/70 uppercase tracking-wider">Daily New Ads</p>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="max-w-7xl mx-auto px-4 py-10">
        <h2 className="text-xl font-bold mb-5" style={{ color: '#0D475C' }}>
          Discover popular categories
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {CATEGORIES.map(cat => (
            <Link
              key={cat.slug}
              href={`/browse?category=${cat.slug}`}
              className="relative overflow-hidden rounded-lg h-32 group"
              style={{ backgroundColor: cat.bg }}
            >
              {/* Background emoji (decorative) */}
              <span className="absolute top-3 right-3 text-5xl opacity-25 group-hover:opacity-35 transition-opacity select-none">
                {cat.emoji}
              </span>
              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              {/* Name */}
              <div className="absolute bottom-0 left-0 right-0 p-3 z-10">
                <p className="text-white font-semibold text-sm leading-tight">
                  {cat.name}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Sell your car promo */}
      <section
        className="mx-4 md:mx-auto max-w-7xl rounded-xl p-6 mb-8 flex flex-col md:flex-row items-center justify-between gap-4"
        style={{ backgroundColor: '#0D475C' }}
      >
        <div className="text-white">
          <h3 className="text-xl font-bold mb-1">Looking to sell your car?</h3>
          <div className="flex gap-6 text-sm text-white/80 mt-2">
            <span>✓ Free</span>
            <span>✓ Quick</span>
            <span>✓ Easy</span>
          </div>
        </div>
        <Link
          href="/post-ad?category=cars-vehicles"
          className="flex-shrink-0 px-6 py-3 rounded text-white font-semibold text-sm transition-opacity hover:opacity-90"
          style={{ backgroundColor: '#e75462' }}
        >
          Post Ad
        </Link>
      </section>

      {/* Latest Listings */}
      <section className="max-w-7xl mx-auto px-4 pb-12">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl font-bold" style={{ color: '#0D475C' }}>
            Discover more Good Finds
          </h2>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">📍 United Kingdom</span>
            <Link
              href="/browse"
              className="text-sm font-semibold hover:underline"
              style={{ color: '#e75462' }}
            >
              See all
            </Link>
          </div>
        </div>

        {listings.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {listings.map(listing => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        ) : (
          <EmptyListings />
        )}
      </section>

      {/* Location links */}
      <section className="bg-white border-t border-b py-8 px-4" style={{ borderColor: '#dbdadb' }}>
        <div className="max-w-7xl mx-auto">
          <h3 className="text-sm font-semibold mb-4" style={{ color: '#0D475C' }}>
            Popular locations
          </h3>
          <div className="flex flex-wrap gap-3">
            {UK_LOCATIONS.map(loc => (
              <Link
                key={loc}
                href={`/browse?location=${loc}`}
                className="text-sm hover:underline"
                style={{ color: '#e75462' }}
              >
                {loc}
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}

function EmptyListings() {
  return (
    <div className="bg-white rounded-xl py-16 text-center border" style={{ borderColor: '#dbdadb' }}>
      <p className="text-4xl mb-3">🏷️</p>
      <p className="text-gray-500 text-sm mb-4">No listings yet — be the first!</p>
      <Link
        href="/post-ad"
        className="inline-block px-6 py-2.5 rounded text-white text-sm font-semibold"
        style={{ backgroundColor: '#e75462' }}
      >
        Post a free ad
      </Link>
    </div>
  )
}
