"use client"

import Link from 'next/link'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

const NAV_ITEMS = [
  { label: 'Cars & Vehicles', slug: 'cars-vehicles' },
  { label: 'For Sale', slug: 'for-sale' },
  { label: 'Services', slug: 'services' },
  { label: 'Property', slug: 'property' },
  { label: 'Pets', slug: 'pets' },
  { label: 'Jobs', slug: 'jobs' },
  { label: 'Community', slug: 'community' },
]

export default function Header() {
  const [query, setQuery] = useState('')
  const [location, setLocation] = useState('')
  const [menuOpen, setMenuOpen] = useState(false)
  const router = useRouter()

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    const params = new URLSearchParams()
    if (query) params.set('q', query)
    if (location) params.set('location', location)
    router.push(`/browse?${params.toString()}`)
  }

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      {/* Main header row */}
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center gap-4">
        {/* Logo */}
        <Link href="/" className="flex-shrink-0 mr-2">
          <span
            className="text-2xl font-bold tracking-tight"
            style={{ color: '#0D475C', fontFamily: "'Open Sans', sans-serif" }}
          >
            Gumtree
          </span>
        </Link>

        {/* Search bar */}
        <form onSubmit={handleSearch} className="flex flex-1 max-w-2xl">
          <div
            className="flex flex-1 border-2 rounded-l-md overflow-hidden"
            style={{ borderColor: '#0D475C' }}
          >
            <input
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="What are you looking for?"
              className="flex-1 px-3 py-2 text-sm outline-none text-gray-800"
            />
            <div className="hidden md:flex items-center">
              <div className="w-px h-5 bg-gray-300" />
              <input
                type="text"
                value={location}
                onChange={e => setLocation(e.target.value)}
                placeholder="Location"
                className="w-36 px-3 py-2 text-sm outline-none text-gray-800"
              />
            </div>
          </div>
          <button
            type="submit"
            className="px-5 py-2 text-sm font-semibold text-white rounded-r-md transition-colors"
            style={{ backgroundColor: '#0D475C' }}
          >
            Search
          </button>
        </form>

        {/* Auth + CTA */}
        <nav className="flex items-center gap-2 flex-shrink-0 ml-auto">
          <Link
            href="/login"
            className="hidden sm:block text-sm font-medium px-3 py-1.5 rounded transition-colors hover:bg-gray-100"
            style={{ color: '#0D475C' }}
          >
            Login
          </Link>
          <Link
            href="/register"
            className="hidden sm:block text-sm font-medium px-3 py-1.5 rounded border transition-colors hover:bg-gray-50"
            style={{ color: '#0D475C', borderColor: '#0D475C' }}
          >
            Sign up
          </Link>
          <Link
            href="/post-ad"
            className="text-sm font-semibold px-4 py-2 rounded text-white transition-opacity hover:opacity-90 whitespace-nowrap"
            style={{ backgroundColor: '#e75462' }}
          >
            Post an ad
          </Link>
          {/* Mobile menu toggle */}
          <button
            className="sm:hidden p-2 rounded hover:bg-gray-100"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Menu"
          >
            <div className="space-y-1">
              <span className="block w-5 h-0.5 bg-gray-600" />
              <span className="block w-5 h-0.5 bg-gray-600" />
              <span className="block w-5 h-0.5 bg-gray-600" />
            </div>
          </button>
        </nav>
      </div>

      {/* Category nav */}
      <div className="border-t border-gray-200" style={{ backgroundColor: '#0D475C' }}>
        <div className="max-w-7xl mx-auto px-4 overflow-x-auto">
          <div className="flex whitespace-nowrap">
            {NAV_ITEMS.map(item => (
              <Link
                key={item.slug}
                href={`/browse?category=${item.slug}`}
                className="text-xs font-semibold text-white px-4 py-3 hover:bg-white/10 transition-colors block"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="sm:hidden bg-white border-t border-gray-200 px-4 py-3 space-y-2">
          {NAV_ITEMS.map(item => (
            <Link
              key={item.slug}
              href={`/browse?category=${item.slug}`}
              className="block text-sm font-medium py-2 border-b border-gray-100"
              style={{ color: '#0D475C' }}
              onClick={() => setMenuOpen(false)}
            >
              {item.label}
            </Link>
          ))}
          <div className="flex gap-2 pt-2">
            <Link href="/login" className="flex-1 text-center text-sm py-2 border rounded" style={{ color: '#0D475C', borderColor: '#0D475C' }}>Login</Link>
            <Link href="/register" className="flex-1 text-center text-sm py-2 border rounded" style={{ color: '#0D475C', borderColor: '#0D475C' }}>Sign up</Link>
          </div>
        </div>
      )}
    </header>
  )
}
