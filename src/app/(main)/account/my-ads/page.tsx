import Link from 'next/link'
import Image from 'next/image'
import { Plus, Eye, Clock } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { formatPrice, timeAgo } from '@/lib/utils'
import type { Listing } from '@/types'
import MyAdActions from './ad-actions'

export default async function MyAdsPage() {
  let listings: Listing[] = []

  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      const { data } = await supabase
        .from('listings')
        .select('*, categories(*)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
      listings = (data ?? []) as Listing[]
    }
  } catch { }

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-lg font-extrabold" style={{ color: '#0D475C' }}>
          My Ads {listings.length > 0 && <span className="text-sm font-normal text-gray-400">({listings.length})</span>}
        </h2>
        <Link
          href="/post-ad"
          className="flex items-center gap-1.5 text-sm font-bold text-white px-4 py-2 rounded transition-opacity hover:opacity-90"
          style={{ backgroundColor: '#e75462' }}
        >
          <Plus size={15} />
          Post new ad
        </Link>
      </div>

      {listings.length === 0 ? (
        <div className="bg-white rounded-xl border py-16 text-center" style={{ borderColor: '#dbdadb' }}>
          <p className="text-5xl mb-4">📋</p>
          <h3 className="font-bold text-gray-700 mb-2">No ads yet</h3>
          <p className="text-sm text-gray-400 mb-6">Your posted ads will appear here.</p>
          <Link
            href="/post-ad"
            className="inline-block px-6 py-2.5 rounded text-white text-sm font-bold"
            style={{ backgroundColor: '#e75462' }}
          >
            Post your first ad
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {listings.map(l => (
            <div
              key={l.id}
              className="bg-white rounded-xl border p-4 flex gap-4"
              style={{ borderColor: '#dbdadb' }}
            >
              <Link
                href={`/listings/${l.id}`}
                className="relative w-24 h-24 rounded overflow-hidden flex-shrink-0 bg-gray-100"
              >
                {l.images?.[0] ? (
                  <Image src={l.images[0]} alt={l.title} fill className="object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-300 text-xs">No photo</div>
                )}
              </Link>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <Link href={`/listings/${l.id}`}>
                      <h3 className="font-bold text-sm text-gray-900 truncate hover:underline">{l.title}</h3>
                    </Link>
                    <p className="text-base font-extrabold mt-0.5" style={{ color: '#0D475C' }}>
                      {formatPrice(l.price, l.price_type)}
                    </p>
                  </div>
                  <StatusBadge status={l.status} />
                </div>
                <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                  <span className="flex items-center gap-1"><Eye size={11} /> {l.views_count} views</span>
                  <span className="flex items-center gap-1"><Clock size={11} /> {timeAgo(l.created_at)}</span>
                </div>
                <MyAdActions listingId={l.id} status={l.status} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, { bg: string; color: string; label: string }> = {
    active: { bg: '#dcfce7', color: '#15803d', label: 'Active' },
    sold: { bg: '#e5e7eb', color: '#4b5563', label: 'Sold' },
    expired: { bg: '#fee2e2', color: '#b91c1c', label: 'Expired' },
    draft: { bg: '#fef3c7', color: '#a16207', label: 'Draft' },
  }
  const s = styles[status] ?? styles.active
  return (
    <span
      className="text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full flex-shrink-0"
      style={{ backgroundColor: s.bg, color: s.color }}
    >
      {s.label}
    </span>
  )
}
