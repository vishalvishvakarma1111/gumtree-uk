import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { ListingCard } from '@/components/listings/listing-card'
import { ListingCardSkeleton } from '@/components/listings/listing-card-skeleton'
import { Listing } from '@/types'
import { mockListings } from '@/lib/data/mock-listings'

const CATEGORIES = [
  { name: 'Cars & Vehicles',  slug: 'cars-vehicles',       bg: '#1a3a5c', emoji: '🚗' },
  { name: 'Home & Garden',    slug: 'home-garden',         bg: '#2d6a3f', emoji: '🏡' },
  { name: 'Tradespeople',     slug: 'services',            bg: '#7a4a1e', emoji: '🔧' },
  { name: 'Baby & Kids',      slug: 'kids-baby',           bg: '#b03060', emoji: '🧸' },
  { name: 'Fashion',          slug: 'fashion',             bg: '#5a2d82', emoji: '👗' },
  { name: 'Sports & Leisure', slug: 'sport-leisure',       bg: '#1a6b6b', emoji: '⚽' },
  { name: 'Electronics',      slug: 'electronics',         bg: '#2a4080', emoji: '💻' },
  { name: 'Property',         slug: 'property',            bg: '#0D475C', emoji: '🏠' },
  { name: 'Pets',             slug: 'pets',                bg: '#5c3a1a', emoji: '🐾' },
  { name: 'Jobs',             slug: 'jobs',                bg: '#1a5c3a', emoji: '💼' },
  { name: 'Community',        slug: 'community',           bg: '#4a3060', emoji: '🤝' },
  { name: 'Business',         slug: 'business-industrial', bg: '#3a3a3a', emoji: '🏭' },
]

const UK_LOCATIONS = [
  'London', 'Manchester', 'Birmingham', 'Leeds', 'Glasgow',
  'Edinburgh', 'Bristol', 'Cardiff', 'Sheffield', 'Newcastle',
  'Brighton', 'Liverpool', 'Reading', 'Nottingham', 'Belfast',
]

async function getListings(): Promise<Listing[]> {
  try {
    const supabase = await createClient()
    const { data } = await supabase
      .from('listings')
      .select('*, user_profiles(name, avatar_url, location, reply_rate, avg_reply_hours, bio, phone, created_at), categories(name, slug, icon, parent_id)')
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(12)
    if (data && data.length > 0) return data as Listing[]
  } catch {
    // Supabase not configured — use mock data
  }
  return mockListings.slice(0, 12)
}

export default async function HomePage() {
  const listings = await getListings()

  return (
    <div style={{ backgroundColor: '#f1f1f1' }}>
      {/* ── Hero ── */}
      <section className="relative py-14 px-4" style={{ backgroundColor: '#0D475C' }}>
        <div className="max-w-3xl mx-auto text-center text-white">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-2 leading-tight tracking-tight">
            Free local classifieds
          </h1>
          <p className="text-base text-white/75 mb-8">
            Buy and sell locally across the UK — it's free and easy
          </p>

          <form action="/browse" method="GET">
            <div className="flex flex-col sm:flex-row bg-white rounded-md overflow-hidden shadow-xl">
              <input
                name="q"
                type="text"
                placeholder="What are you looking for?"
                className="flex-1 px-4 py-3.5 text-gray-800 text-sm outline-none min-w-0"
              />
              <div className="hidden sm:block w-px bg-gray-200 my-2" />
              <input
                name="location"
                type="text"
                placeholder="📍 Location"
                className="sm:w-44 px-4 py-3.5 text-gray-800 text-sm outline-none border-t sm:border-t-0 border-gray-200"
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

          <div className="flex justify-center gap-10 mt-8">
            <div className="text-center">
              <p className="text-2xl font-bold">14M+</p>
              <p className="text-[11px] text-white/60 uppercase tracking-widest mt-0.5">Live Ads</p>
            </div>
            <div className="w-px bg-white/20" />
            <div className="text-center">
              <p className="text-2xl font-bold">600K</p>
              <p className="text-[11px] text-white/60 uppercase tracking-widest mt-0.5">Daily Users</p>
            </div>
            <div className="w-px bg-white/20" />
            <div className="text-center">
              <p className="text-2xl font-bold">Free</p>
              <p className="text-[11px] text-white/60 uppercase tracking-widest mt-0.5">To Post</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Categories ── */}
      <section className="max-w-7xl mx-auto px-4 py-10">
        <h2 className="text-xl font-extrabold mb-5" style={{ color: '#0D475C' }}>
          Browse popular categories
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {CATEGORIES.map(cat => (
            <Link
              key={cat.slug}
              href={`/browse?category=${cat.slug}`}
              className="relative overflow-hidden rounded-lg h-28 group"
              style={{ backgroundColor: cat.bg }}
            >
              <span className="absolute top-2 right-2 text-4xl opacity-20 group-hover:opacity-30 transition-opacity select-none">
                {cat.emoji}
              </span>
              <div className="absolute inset-0 bg-gradient-to-t from-black/65 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-2.5 z-10">
                <p className="text-white font-semibold text-xs leading-tight">{cat.name}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ── Sell Your Car Promo ── */}
      <section className="mx-4 md:mx-auto max-w-7xl rounded-xl overflow-hidden mb-6">
        <div
          className="flex flex-col md:flex-row items-center justify-between gap-4 px-6 py-5"
          style={{ backgroundColor: '#0D475C' }}
        >
          <div className="text-white">
            <h3 className="text-lg font-extrabold mb-1">Looking to sell your car?</h3>
            <p className="text-sm text-white/70">Post a free ad in minutes and reach thousands of buyers</p>
            <div className="flex gap-5 text-xs text-white/60 mt-2">
              <span>✓ 100% Free</span>
              <span>✓ Quick to post</span>
              <span>✓ Millions of buyers</span>
            </div>
          </div>
          <Link
            href="/post-ad?category=cars-vehicles"
            className="flex-shrink-0 px-7 py-3 rounded font-bold text-sm text-white transition-opacity hover:opacity-90 whitespace-nowrap"
            style={{ backgroundColor: '#e75462' }}
          >
            Post an Ad →
          </Link>
        </div>
      </section>

      {/* ── Latest Listings ── */}
      <section className="max-w-7xl mx-auto px-4 pb-10">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-xl font-extrabold" style={{ color: '#0D475C' }}>
              Discover Good Finds near you
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">📍 United Kingdom</p>
          </div>
          <Link
            href="/browse"
            className="text-sm font-semibold hover:underline"
            style={{ color: '#e75462' }}
          >
            See all →
          </Link>
        </div>

        {listings.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {listings.map(l => (
              <ListingCard key={l.id} listing={l} />
            ))}
          </div>
        ) : (
          <EmptyState />
        )}
      </section>

      {/* ── How it works ── */}
      <section className="bg-white border-y py-10 px-4" style={{ borderColor: '#dbdadb' }}>
        <div className="max-w-4xl mx-auto">
          <h2 className="text-xl font-extrabold text-center mb-8" style={{ color: '#0D475C' }}>
            How Gumtree works
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 text-center">
            {[
              { icon: '📝', title: 'Post your ad', desc: 'It only takes a few minutes — add photos, a description, and your price.' },
              { icon: '💬', title: 'Get responses', desc: 'Buyers will message you directly through our secure messaging system.' },
              { icon: '🤝', title: 'Make the deal', desc: 'Agree on a price, arrange to meet safely, and hand over the goods.' },
            ].map(step => (
              <div key={step.title} className="flex flex-col items-center gap-3">
                <span className="text-5xl">{step.icon}</span>
                <h3 className="font-bold text-base" style={{ color: '#0D475C' }}>{step.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
          <div className="text-center mt-8">
            <Link
              href="/post-ad"
              className="inline-block px-8 py-3 rounded font-bold text-sm text-white transition-opacity hover:opacity-90"
              style={{ backgroundColor: '#e75462' }}
            >
              Post a free ad
            </Link>
          </div>
        </div>
      </section>

      {/* ── Popular locations ── */}
      <section className="bg-white border-b py-8 px-4" style={{ borderColor: '#dbdadb' }}>
        <div className="max-w-7xl mx-auto">
          <h3 className="text-sm font-bold mb-4" style={{ color: '#0D475C' }}>
            Popular locations
          </h3>
          <div className="flex flex-wrap gap-x-5 gap-y-2">
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

function EmptyState() {
  return (
    <div className="bg-white rounded-xl py-16 text-center border" style={{ borderColor: '#dbdadb' }}>
      <p className="text-5xl mb-3">🏷️</p>
      <p className="text-gray-500 text-sm mb-5">No listings yet — be the first!</p>
      <Link
        href="/post-ad"
        className="inline-block px-6 py-2.5 rounded text-white text-sm font-bold"
        style={{ backgroundColor: '#e75462' }}
      >
        Post a free ad
      </Link>
    </div>
  )
}
