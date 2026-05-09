'use client'

import Link from 'next/link'
import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronDown, User, LogOut, Heart, FileText, MessageCircle, Settings } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

const NAV_ITEMS = [
  { label: 'Cars & Vehicles', slug: 'cars-vehicles' },
  { label: 'For Sale',        slug: 'for-sale' },
  { label: 'Services',        slug: 'services' },
  { label: 'Property',        slug: 'property' },
  { label: 'Pets',            slug: 'pets' },
  { label: 'Jobs',            slug: 'jobs' },
  { label: 'Community',       slug: 'community' },
]

interface HeaderUser {
  id: string
  email: string
  name: string
}

interface HeaderProps {
  user: HeaderUser | null
  unreadMessages?: number
}

export default function Header({ user, unreadMessages = 0 }: HeaderProps) {
  const [query, setQuery] = useState('')
  const [location, setLocation] = useState('')
  const [menuOpen, setMenuOpen] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    const params = new URLSearchParams()
    if (query) params.set('q', query)
    if (location) params.set('location', location)
    router.push(`/browse?${params.toString()}`)
  }

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    setDropdownOpen(false)
    router.push('/')
    router.refresh()
  }

  // For protected actions: redirects guest to login
  function guardedHref(path: string) {
    if (user) return path
    return `/login?next=${encodeURIComponent(path)}`
  }

  const initials = user?.name?.slice(0, 2).toUpperCase() ?? ''

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      {/* ── Main row ── */}
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center gap-4">
        {/* Logo */}
        <Link href="/" className="flex-shrink-0 mr-2">
          <span className="text-2xl font-extrabold tracking-tight" style={{ color: '#0D475C' }}>
            Gumtree
          </span>
        </Link>

        {/* Search */}
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
            className="px-5 py-2 text-sm font-semibold text-white rounded-r-md transition-colors hover:opacity-90"
            style={{ backgroundColor: '#0D475C' }}
          >
            Search
          </button>
        </form>

        {/* Right nav */}
        <nav className="flex items-center gap-2 flex-shrink-0 ml-auto">
          {/* Post an ad — requires auth */}
          <Link
            href={guardedHref('/post-ad')}
            className="text-sm font-semibold px-4 py-2 rounded text-white transition-opacity hover:opacity-90 whitespace-nowrap"
            style={{ backgroundColor: '#e75462' }}
          >
            Post an ad
          </Link>

          {user ? (
            /* ── Logged-in user dropdown ── */
            <div className="relative hidden sm:block" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen(o => !o)}
                className="flex items-center gap-1.5 px-2 py-1.5 rounded hover:bg-gray-100 transition-colors"
              >
                <div className="relative flex-shrink-0">
                  <div
                    className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold"
                    style={{ backgroundColor: '#0D475C' }}
                  >
                    {initials}
                  </div>
                  {unreadMessages > 0 && (
                    <span
                      className="absolute -top-1 -right-1 text-[10px] font-bold text-white rounded-full min-w-4 h-4 px-1 flex items-center justify-center"
                      style={{ backgroundColor: '#e75462' }}
                    >
                      {unreadMessages > 9 ? '9+' : unreadMessages}
                    </span>
                  )}
                </div>
                <span className="text-sm font-medium max-w-[80px] truncate" style={{ color: '#0D475C' }}>
                  {user.name}
                </span>
                <ChevronDown
                  size={14}
                  className="transition-transform"
                  style={{
                    color: '#0D475C',
                    transform: dropdownOpen ? 'rotate(180deg)' : 'rotate(0)',
                  }}
                />
              </button>

              {dropdownOpen && (
                <div
                  className="absolute right-0 top-full mt-1 w-48 bg-white rounded-lg border shadow-lg py-1 z-50"
                  style={{ borderColor: '#dbdadb' }}
                >
                  <div className="px-4 py-2.5 border-b" style={{ borderColor: '#f0f0f0' }}>
                    <p className="text-xs font-semibold text-gray-700 truncate">{user.name}</p>
                    <p className="text-xs text-gray-400 truncate">{user.email}</p>
                  </div>
                  {[
                    { label: 'My Ads',    href: '/account/my-ads',   Icon: FileText, badge: 0 },
                    { label: 'Watchlist', href: '/account/watchlist', Icon: Heart, badge: 0 },
                    { label: 'Messages',  href: '/messages',          Icon: MessageCircle, badge: unreadMessages },
                    { label: 'Profile',   href: '/account/profile',   Icon: Settings, badge: 0 },
                  ].map(({ label, href, Icon, badge }) => (
                    <Link
                      key={href}
                      href={href}
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <Icon size={14} className="text-gray-400" />
                      <span className="flex-1">{label}</span>
                      {badge > 0 && (
                        <span
                          className="text-[10px] font-bold text-white rounded-full px-1.5 py-0.5 min-w-5 text-center"
                          style={{ backgroundColor: '#e75462' }}
                        >
                          {badge > 9 ? '9+' : badge}
                        </span>
                      )}
                    </Link>
                  ))}
                  <div className="border-t mt-1" style={{ borderColor: '#f0f0f0' }}>
                    <button
                      onClick={handleSignOut}
                      className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <LogOut size={14} />
                      Sign out
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* ── Guest auth links ── */
            <>
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
            </>
          )}

          {/* Mobile hamburger */}
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

      {/* ── Category nav bar ── */}
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

      {/* ── Mobile menu ── */}
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

          {user ? (
            <div className="pt-2 space-y-2">
              <p className="text-xs text-gray-400">Signed in as <strong>{user.name}</strong></p>
              <Link href="/account/my-ads"    className="block text-sm py-1.5 font-medium" style={{ color: '#0D475C' }} onClick={() => setMenuOpen(false)}>My Ads</Link>
              <Link href="/account/watchlist" className="block text-sm py-1.5 font-medium" style={{ color: '#0D475C' }} onClick={() => setMenuOpen(false)}>Watchlist</Link>
              <Link href="/messages"          className="block text-sm py-1.5 font-medium" style={{ color: '#0D475C' }} onClick={() => setMenuOpen(false)}>Messages</Link>
              <button onClick={() => { handleSignOut(); setMenuOpen(false) }} className="block text-sm py-1.5 font-medium text-red-600">
                Sign out
              </button>
            </div>
          ) : (
            <div className="flex gap-2 pt-2">
              <Link href="/login"    className="flex-1 text-center text-sm py-2 border rounded" style={{ color: '#0D475C', borderColor: '#0D475C' }}>Login</Link>
              <Link href="/register" className="flex-1 text-center text-sm py-2 border rounded" style={{ color: '#0D475C', borderColor: '#0D475C' }}>Sign up</Link>
            </div>
          )}
        </div>
      )}
    </header>
  )
}
