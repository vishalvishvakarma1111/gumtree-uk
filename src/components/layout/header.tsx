'use client'

import Link from 'next/link'
import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { User, LogOut, Heart, FileText, MessageCircle, Settings, Shield, Search, MapPin, Menu as MenuIcon, Plus, Mail, LogIn, UserPlus } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

const NAV_ITEMS: { label: string; slug: string; sub: { label: string; slug: string }[] }[] = [
  {
    label: 'Cars & Vehicles', slug: 'cars-vehicles',
    sub: [
      { label: 'Cars', slug: 'cars' },
      { label: 'Vans', slug: 'vans' },
      { label: 'Motorbikes', slug: 'motorbikes' },
      { label: 'Caravans', slug: 'caravans' },
      { label: 'Parts & Accessories', slug: 'parts-accessories' },
    ],
  },
  {
    label: 'For Sale', slug: 'for-sale',
    sub: [
      { label: 'Electronics', slug: 'electronics' },
      { label: 'Home & Garden', slug: 'home-garden' },
      { label: 'Clothing', slug: 'clothing' },
      { label: 'Baby & Kids', slug: 'baby-kids' },
      { label: 'Sports & Leisure', slug: 'sports-leisure' },
    ],
  },
  {
    label: 'Services', slug: 'services',
    sub: [
      { label: 'Trades', slug: 'trades' },
      { label: 'Tutoring', slug: 'tutoring' },
      { label: 'Childcare', slug: 'childcare' },
      { label: 'Health & Beauty', slug: 'health-beauty' },
    ],
  },
  {
    label: 'Property', slug: 'property',
    sub: [
      { label: 'Flats to rent', slug: 'flats-rent' },
      { label: 'Houses to rent', slug: 'houses-rent' },
      { label: 'For sale', slug: 'property-sale' },
      { label: 'Rooms', slug: 'rooms' },
    ],
  },
  {
    label: 'Pets', slug: 'pets',
    sub: [
      { label: 'Dogs', slug: 'dogs' },
      { label: 'Cats', slug: 'cats' },
      { label: 'Other pets', slug: 'other-pets' },
      { label: 'Accessories', slug: 'pet-accessories' },
    ],
  },
  {
    label: 'Jobs', slug: 'jobs',
    sub: [
      { label: 'Full-time', slug: 'full-time' },
      { label: 'Part-time', slug: 'part-time' },
      { label: 'Temporary', slug: 'temporary' },
      { label: 'Voluntary', slug: 'voluntary' },
    ],
  },
  {
    label: 'Community', slug: 'community',
    sub: [
      { label: 'Events', slug: 'events' },
      { label: 'Lost & Found', slug: 'lost-found' },
      { label: 'Free stuff', slug: 'free-stuff' },
      { label: 'Volunteers', slug: 'volunteers' },
    ],
  },
]

interface HeaderUser {
  id: string
  email: string
  name: string
  isAdmin?: boolean
}

interface HeaderProps {
  user: HeaderUser | null
  unreadMessages?: number
}

export default function Header({ user, unreadMessages = 0 }: HeaderProps) {
  const [query, setQuery] = useState('')
  const [location, setLocation] = useState('')
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [unread, setUnread] = useState(unreadMessages)
  const [smartSearch, setSmartSearchState] = useState(false)
  const [smartSearching, setSmartSearching] = useState(false)
  const [smartError, setSmartError] = useState('')

  useEffect(() => {
    try {
      if (localStorage.getItem('smartSearch') === '1') setSmartSearchState(true)
    } catch { /* ignore */ }
  }, [])

  function setSmartSearch(updater: (prev: boolean) => boolean) {
    setSmartSearchState(prev => {
      const next = updater(prev)
      try { localStorage.setItem('smartSearch', next ? '1' : '0') } catch { /* ignore */ }
      return next
    })
  }
  const dropdownRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  useEffect(() => {
    setUnread(unreadMessages)
  }, [unreadMessages])

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

  // Realtime unread badge — refetch count on any message INSERT/UPDATE.
  useEffect(() => {
    if (!user) return
    const supabase = createClient()

    async function refresh() {
      try {
        const res = await fetch('/api/messages/unread-count', { cache: 'no-store' })
        if (!res.ok) return
        const data = await res.json()
        setUnread(data.count ?? 0)
      } catch {
        // ignore
      }
    }

    const channel = supabase
      .channel(`unread:${user.id}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, refresh)
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'messages' }, refresh)
      .subscribe()

    function onVisible() {
      if (document.visibilityState === 'visible') refresh()
    }
    document.addEventListener('visibilitychange', onVisible)

    return () => {
      supabase.removeChannel(channel)
      document.removeEventListener('visibilitychange', onVisible)
    }
  }, [user])

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    setSmartError('')
    if (smartSearch && query.trim()) {
      setSmartSearching(true)
      try {
        const res = await fetch('/api/ai/parse-search', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query }),
        })
        if (res.ok) {
          const data = await res.json()
          const params = new URLSearchParams()
          if (data.keyword) params.set('q', data.keyword)
          if (data.location) params.set('location', data.location)
          else if (location) params.set('location', location)
          if (data.min_price !== null) params.set('min_price', String(data.min_price))
          if (data.max_price !== null) params.set('max_price', String(data.max_price))
          if (data.category) params.set('category', data.category)
          setSmartSearching(false)
          router.push(`/browse?${params.toString()}`)
          return
        }
        const errBody = await res.json().catch(() => ({}))
        setSmartError(errBody.error || `AI search failed (HTTP ${res.status})`)
      } catch (err: unknown) {
        setSmartError(err instanceof Error ? err.message : 'AI search failed — check server logs')
      }
      setSmartSearching(false)
      return
    }
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
    <header className="shadow-sm sticky top-0 z-50" style={{ backgroundColor: '#0D475C' }}>
      {/* ── Main row ── */}
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center gap-4">
        {/* Logo — real Gumtree tree SVG + wordmark */}
        <Link href="/" className="flex-shrink-0 mr-2 flex items-center gap-2" aria-label="Gumtree home">
          <svg xmlns="http://www.w3.org/2000/svg" width="26" height="32" viewBox="27.74 5.25 19.52 24.298" aria-hidden="true">
            <path fill="#72EF36" d="M44.433 11.914a.707.707 0 0 1-.337-.606C43.76 7.942 40.933 5.25 37.5 5.25s-6.327 2.625-6.596 6.058a.806.806 0 0 1-.336.606c-1.683 1.211-2.827 3.164-2.827 5.384 0 3.029 2.087 5.654 4.914 6.395.471.135 1.01.202 1.144.067.337-.202.808-1.885.606-2.221-.135-.203-.539-.404-1.077-.539-1.683-.471-2.895-1.952-2.895-3.769 0-1.01.404-1.885 1.01-2.625a2.964 2.964 0 0 1 1.01-.808c.74-.404 1.144-1.144 1.144-1.952 0-.404.067-.808.202-1.211.539-1.548 1.952-2.692 3.702-2.692s3.164 1.144 3.702 2.692c.134.404.202.808.202 1.211 0 .808.403 1.548 1.144 1.952.404.202.673.471 1.01.808a3.967 3.967 0 0 1 1.01 2.625 3.907 3.907 0 0 1-3.903 3.904c-2.491 0-4.443 2.02-4.443 4.51v2.558c0 .471.067 1.009.202 1.144.27.27 2.02.27 2.288 0 .135-.135.203-.673.203-1.144v-2.625c0-.942.807-1.75 1.75-1.75 3.634 0 6.596-2.962 6.596-6.596-.002-2.155-1.147-4.107-2.829-5.318z"/>
          </svg>
          <span className="text-2xl font-bold tracking-tight hidden sm:inline" style={{ color: '#F0ECE6' }}>
            Gumtree
          </span>
        </Link>

        {/* Search — two separate white pills + small green icon button */}
        <form onSubmit={handleSearch} className="flex flex-1 max-w-3xl items-center gap-2">
          <div className="flex flex-1 items-center bg-white rounded-md px-3 h-10">
            <Search size={16} className="text-gray-400 flex-shrink-0" />
            <input
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search Gumtree"
              className="flex-1 px-2 text-sm outline-none text-gray-800 min-w-0 bg-transparent"
            />
          </div>
          <div className="hidden md:flex items-center bg-white rounded-md px-3 h-10 w-56">
            <MapPin size={16} className="text-gray-400 flex-shrink-0" />
            <input
              type="text"
              value={location}
              onChange={e => setLocation(e.target.value)}
              placeholder="UK"
              className="flex-1 px-2 text-sm outline-none text-gray-800 min-w-0 bg-transparent"
            />
          </div>
          <button
            type="submit"
            aria-label="Search"
            className="flex items-center justify-center h-10 w-10 rounded-md transition-opacity hover:opacity-90 flex-shrink-0"
            style={{ backgroundColor: '#72ef36', color: '#0D475C' }}
          >
            <Search size={18} strokeWidth={2.5} />
          </button>
        </form>
        {smartError && (
          <p className="text-xs text-yellow-200 ml-2 hidden md:block max-w-xs truncate" title={smartError}>
            {smartError}
          </p>
        )}

        {/* Right nav — icon over label, all white. Post an ad always visible. */}
        <nav className="flex items-start gap-1 flex-shrink-0 ml-auto">
          <Link
            href={guardedHref('/post-ad')}
            className="flex flex-col items-center gap-0.5 px-3 py-1.5 rounded text-white hover:bg-white/10 transition-colors"
          >
            <Plus size={20} strokeWidth={2.5} />
            <span className="text-[11px] font-medium whitespace-nowrap">Post an ad</span>
          </Link>

          {user ? (
            <Link
              href="/messages"
              className="relative flex flex-col items-center gap-0.5 px-3 py-1.5 rounded text-white hover:bg-white/10 transition-colors"
            >
              <Mail size={20} strokeWidth={2.5} />
              <span className="text-[11px] font-medium whitespace-nowrap">Messages</span>
              {unread > 0 && (
                <span
                  className="absolute top-0.5 right-1 text-[10px] font-bold text-[#0D475C] rounded-full min-w-4 h-4 px-1 flex items-center justify-center"
                  style={{ backgroundColor: '#72ef36' }}
                >
                  {unread > 9 ? '9+' : unread}
                </span>
              )}
            </Link>
          ) : (
            <>
              <Link
                href="/register"
                className="flex flex-col items-center gap-0.5 px-3 py-1.5 rounded text-white hover:bg-white/10 transition-colors"
              >
                <UserPlus size={20} strokeWidth={2.5} />
                <span className="text-[11px] font-medium whitespace-nowrap">Sign up</span>
              </Link>
              <Link
                href="/login"
                className="flex flex-col items-center gap-0.5 px-3 py-1.5 rounded text-white hover:bg-white/10 transition-colors"
              >
                <LogIn size={20} strokeWidth={2.5} />
                <span className="text-[11px] font-medium whitespace-nowrap">Login</span>
              </Link>
            </>
          )}

          {/* Menu button — only when logged in */}
          <div className={`relative ${user ? '' : 'hidden'}`} ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen(o => !o)}
              className="flex flex-col items-center gap-0.5 px-3 py-1.5 rounded text-white hover:bg-white/10 transition-colors"
            >
              <MenuIcon size={20} strokeWidth={2.5} />
              <span className="text-[11px] font-medium whitespace-nowrap">Menu</span>
            </button>

            {dropdownOpen && (
              <div
                className="absolute right-0 top-full mt-1 w-56 bg-white rounded-lg border shadow-lg py-1 z-50"
                style={{ borderColor: '#dbdadb' }}
              >
                {user ? (
                  <>
                    <div className="px-4 py-2.5 border-b flex items-center gap-2.5" style={{ borderColor: '#f0f0f0' }}>
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                        style={{ backgroundColor: '#0D475C' }}
                      >
                        {initials}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-gray-700 truncate">{user.name}</p>
                        <p className="text-xs text-gray-400 truncate">{user.email}</p>
                      </div>
                    </div>
                    {[
                      { label: 'My Ads',    href: '/account/my-ads',    Icon: FileText, badge: 0 },
                      { label: 'Watchlist', href: '/account/watchlist', Icon: Heart, badge: 0 },
                      { label: 'Messages',  href: '/messages',          Icon: MessageCircle, badge: unread },
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
                    {user.isAdmin && (
                      <Link
                        href="/admin"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-sm border-t hover:bg-amber-50 transition-colors"
                        style={{ color: '#a16207', borderColor: '#f0f0f0' }}
                      >
                        <Shield size={14} />
                        <span className="flex-1 font-semibold">Admin panel</span>
                      </Link>
                    )}
                    <div className="border-t mt-1" style={{ borderColor: '#f0f0f0' }}>
                      <button
                        onClick={handleSignOut}
                        className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <LogOut size={14} />
                        Sign out
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <Link
                      href="/login"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <User size={14} className="text-gray-400" />
                      <span>Login</span>
                    </Link>
                    <Link
                      href="/register"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-sm font-semibold hover:bg-gray-50 transition-colors"
                      style={{ color: '#0D475C' }}
                    >
                      <Plus size={14} />
                      <span>Sign up</span>
                    </Link>
                  </>
                )}
              </div>
            )}
          </div>
        </nav>
      </div>

      {/* ── Category nav bar — equal-width, dividers, compact ── */}
      <div className="bg-white border-b" style={{ borderColor: '#dbdadb' }}>
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex divide-x divide-gray-200">
            {NAV_ITEMS.map(item => (
              <div key={item.slug} className="group relative flex-1">
                <Link
                  href={`/browse?category=${item.slug}`}
                  className="block text-center text-sm font-bold text-gray-900 px-3 py-2.5 border-b-[3px] border-transparent group-hover:border-[#0D475C] group-hover:text-[#0D475C] transition-colors"
                >
                  {item.label}
                </Link>
                <div
                  className="absolute left-0 top-full hidden group-hover:block bg-white shadow-lg rounded-b-lg z-50 min-w-[240px] py-2 border"
                  style={{ borderColor: '#dbdadb' }}
                >
                  {item.sub.map(s => (
                    <Link
                      key={s.slug}
                      href={`/browse?category=${item.slug}&q=${encodeURIComponent(s.label)}`}
                      className="block px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 hover:text-[#0D475C] transition-colors"
                    >
                      {s.label}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

    </header>
  )
}
