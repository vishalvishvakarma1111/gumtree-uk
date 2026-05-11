import Link from 'next/link'
import { Check, Plus } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { ListingCard } from '@/components/listings/listing-card'
import { ListingCardSkeleton } from '@/components/listings/listing-card-skeleton'
import { Listing } from '@/types'
import { mockListings } from '@/lib/data/mock-listings'

const HERO_COLLAGE = [
  'gumtree-armchair', 'gumtree-camera', 'gumtree-hand', 'gumtree-house', 'gumtree-car',
  'gumtree-dog', 'gumtree-shake', 'gumtree-clothes', 'gumtree-fridge', 'gumtree-fix',
]

const CATEGORIES = [
  { name: 'Cars & Vehicles',  slug: 'cars-vehicles',  imgSeed: 'gum-cars' },
  { name: 'Home & Garden',    slug: 'home-garden',    imgSeed: 'gum-home' },
  { name: 'Tradespeople',     slug: 'services',       imgSeed: 'gum-trades' },
  { name: 'Baby & Kids',      slug: 'kids-baby',      imgSeed: 'gum-baby' },
  { name: 'Fashion',          slug: 'fashion',        imgSeed: 'gum-fashion' },
  { name: 'Sports & Leisure', slug: 'sport-leisure',  imgSeed: 'gum-sport' },
  { name: 'Computers',        slug: 'electronics',    imgSeed: 'gum-comp' },
  { name: 'Properties',       slug: 'property',       imgSeed: 'gum-property' },
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
      {/* ── Hero card: Free local classifieds + image collage ── */}
      <section className="max-w-7xl mx-auto px-4 py-6">
        <div className="bg-white rounded-xl border shadow-sm overflow-hidden" style={{ borderColor: '#dbdadb' }}>
          <div className="grid md:grid-cols-2 gap-6 p-6 md:p-8 items-center">
            {/* Left — copy + CTA */}
            <div>
              <h1 className="text-2xl md:text-3xl font-extrabold mb-2" style={{ color: '#0D475C' }}>
                Free local classifieds
              </h1>
              <p className="text-sm text-gray-600 mb-4">One place for all your Ads</p>
              <ul className="space-y-2 mb-6">
                <li className="flex items-center gap-2 text-xs font-semibold text-gray-700">
                  <Check size={14} style={{ color: '#72ef36' }} strokeWidth={3} />
                  <span className="uppercase tracking-wide">600K daily active users</span>
                </li>
                <li className="flex items-center gap-2 text-xs font-semibold text-gray-700">
                  <Check size={14} style={{ color: '#72ef36' }} strokeWidth={3} />
                  <span className="uppercase tracking-wide">30K daily new ads</span>
                </li>
              </ul>
              <Link
                href="/post-ad"
                className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded font-bold text-sm transition-opacity hover:opacity-90"
                style={{ backgroundColor: '#72ef36', color: '#0D475C' }}
              >
                <Plus size={16} strokeWidth={3} />
                Post Ad
              </Link>
            </div>

            {/* Right — staggered photo collage */}
            <div className="grid grid-cols-5 gap-1.5 max-h-56 overflow-hidden">
              {HERO_COLLAGE.map((seed, i) => (
                <div
                  key={seed}
                  className={`relative rounded-md overflow-hidden ${i % 2 === 0 ? 'mt-0' : 'mt-4'}`}
                  style={{ aspectRatio: '1 / 1' }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={`https://picsum.photos/seed/${seed}/160/160`}
                    alt=""
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Discover popular categories — 4-per-row photo tiles ── */}
      <section className="max-w-7xl mx-auto px-4 py-6">
        <h2 className="text-xl font-extrabold mb-4" style={{ color: '#0D475C' }}>
          Discover popular categories
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
          {CATEGORIES.map(cat => (
            <Link
              key={cat.slug}
              href={`/browse?category=${cat.slug}`}
              className="block bg-white rounded-lg overflow-hidden border hover:shadow-md transition-shadow group"
              style={{ borderColor: '#dbdadb' }}
            >
              <div className="relative w-full" style={{ aspectRatio: '1 / 0.8' }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`https://picsum.photos/seed/${cat.imgSeed}/400/320`}
                  alt={cat.name}
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  loading="lazy"
                />
              </div>
              <div className="px-3 py-2 bg-white">
                <h3 className="text-sm font-bold text-gray-900">{cat.name}</h3>
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
            className="inline-flex items-center gap-1.5 flex-shrink-0 px-5 py-2.5 rounded font-bold text-sm transition-opacity hover:opacity-90 whitespace-nowrap"
            style={{ backgroundColor: '#72ef36', color: '#0D475C' }}
          >
            <Plus size={16} strokeWidth={3} />
            Post Ad
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
              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded font-bold text-sm transition-opacity hover:opacity-90"
              style={{ backgroundColor: '#72ef36', color: '#0D475C' }}
            >
              <Plus size={16} strokeWidth={3} />
              Post Ad
            </Link>
          </div>
        </div>
      </section>

      {/* ── Popular locations ── */}
      <section className="bg-white border-b py-8 px-4" style={{ borderColor: '#dbdadb' }}>
        <div className="max-w-7xl mx-auto">
          <h3 className="text-sm font-bold mb-4 text-center" style={{ color: '#0D475C' }}>
            Popular locations
          </h3>
          <div className="flex flex-wrap justify-center items-center gap-y-2">
            {UK_LOCATIONS.map((loc, i) => (
              <div key={loc} className="flex items-center">
                <Link
                  href={`/browse?location=${loc}`}
                  className="text-lg font-bold hover:underline px-4"
                  style={{ color: '#007fb0' }}
                >
                  {loc}
                </Link>
                {i < UK_LOCATIONS.length - 1 && (
                  <span
                    aria-hidden="true"
                    className="inline-block h-5 w-px"
                    style={{ backgroundColor: '#dbdadb' }}
                  />
                )}
              </div>
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
        className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded font-bold text-sm transition-opacity hover:opacity-90"
        style={{ backgroundColor: '#72ef36', color: '#0D475C' }}
      >
        <Plus size={16} strokeWidth={3} />
        Post Ad
      </Link>
    </div>
  )
}
