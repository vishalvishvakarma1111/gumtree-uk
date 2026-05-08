import Link from 'next/link'
import { ChevronRight } from 'lucide-react'

const CATEGORIES = [
  { name: 'Cars & Vehicles',       slug: 'cars-vehicles',       emoji: '🚗' },
  { name: 'Property',              slug: 'property',            emoji: '🏠' },
  { name: 'Jobs',                  slug: 'jobs',                emoji: '💼' },
  { name: 'Electronics',           slug: 'electronics',         emoji: '📱' },
  { name: 'Home & Garden',         slug: 'home-garden',         emoji: '🌿' },
  { name: 'Pets',                  slug: 'pets',                emoji: '🐾' },
  { name: 'Fashion',               slug: 'fashion',             emoji: '👗' },
  { name: 'Sport & Leisure',       slug: 'sport-leisure',       emoji: '⚽' },
  { name: 'Kids & Baby',           slug: 'kids-baby',           emoji: '🧸' },
  { name: 'Services',              slug: 'services',            emoji: '🔧' },
  { name: 'Community',             slug: 'community',           emoji: '🤝' },
  { name: 'Business & Industrial', slug: 'business-industrial', emoji: '🏭' },
  { name: 'Other',                 slug: 'other',               emoji: '📦' },
]

export default function PostAdPage() {
  return (
    <div style={{ backgroundColor: '#f1f1f1', minHeight: '100vh' }}>
      {/* Header bar */}
      <div className="bg-white border-b" style={{ borderColor: '#dbdadb' }}>
        <div className="max-w-3xl mx-auto px-4 py-4">
          <h1 className="text-xl font-extrabold" style={{ color: '#0D475C' }}>
            Post a free ad
          </h1>
          <p className="text-sm text-gray-400 mt-0.5">Choose a category to get started</p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Progress */}
        <div className="flex items-center gap-2 mb-8">
          {['Choose category', 'Ad details', 'Photos', 'Review'].map((step, i) => (
            <div key={step} className="flex items-center gap-2">
              <div
                className="flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold"
                style={
                  i === 0
                    ? { backgroundColor: '#0D475C', color: '#fff' }
                    : { backgroundColor: '#e8e8e8', color: '#aaa' }
                }
              >
                {i + 1}
              </div>
              <span
                className="text-xs font-medium hidden sm:block"
                style={{ color: i === 0 ? '#0D475C' : '#aaa' }}
              >
                {step}
              </span>
              {i < 3 && <div className="w-6 h-px" style={{ backgroundColor: '#dbdadb' }} />}
            </div>
          ))}
        </div>

        {/* Category grid */}
        <div className="bg-white rounded-xl border overflow-hidden" style={{ borderColor: '#dbdadb' }}>
          <div className="px-5 py-4 border-b" style={{ borderColor: '#f0f0f0' }}>
            <h2 className="font-bold text-base" style={{ color: '#0D475C' }}>
              What are you selling?
            </h2>
          </div>
          <div className="divide-y" style={{ borderColor: '#f0f0f0' }}>
            {CATEGORIES.map(cat => (
              <Link
                key={cat.slug}
                href={`/post-ad/${cat.slug}`}
                className="flex items-center gap-4 px-5 py-4 hover:bg-gray-50 transition-colors group"
              >
                <span className="text-2xl flex-shrink-0 w-9 text-center">{cat.emoji}</span>
                <span className="text-sm font-medium text-gray-800 flex-1 group-hover:text-gray-900">
                  {cat.name}
                </span>
                <ChevronRight size={16} className="text-gray-300 group-hover:text-gray-500" />
              </Link>
            ))}
          </div>
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">
          By posting an ad you agree to our{' '}
          <Link href="#" className="underline">Terms and Conditions</Link>
        </p>
      </div>
    </div>
  )
}
