import Link from 'next/link'
import { Heart, Plus } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { ListingCard } from '@/components/listings/listing-card'
import type { Listing } from '@/types'

interface WatchlistRow {
  listing_id: string
  created_at: string
  listings: Listing | null
}

export default async function WatchlistPage() {
  let rows: WatchlistRow[] = []

  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      const { data } = await supabase
        .from('watchlist')
        .select('listing_id, created_at, listings(*, user_profiles(*), categories(*))')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
      rows = (data ?? []) as unknown as WatchlistRow[]
    }
  } catch { }

  const listings = rows.map(r => r.listings).filter((l): l is Listing => l !== null)

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-lg font-extrabold" style={{ color: '#0D475C' }}>
          Watchlist {listings.length > 0 && <span className="text-sm font-normal text-gray-400">({listings.length})</span>}
        </h2>
      </div>
      {listings.length === 0 ? (
        <div className="bg-white rounded-xl border py-16 text-center" style={{ borderColor: '#dbdadb' }}>
          <Heart size={40} className="mx-auto text-gray-200 mb-4" />
          <h3 className="font-bold text-gray-700 mb-2">No saved ads</h3>
          <p className="text-sm text-gray-400 mb-6">
            Tap the heart on any listing to save it here.
          </p>
          <Link
            href="/browse"
            className="inline-flex items-center gap-1.5 px-6 py-2.5 rounded text-white text-sm font-bold"
            style={{ backgroundColor: '#0D475C' }}
          >
            <Plus size={15} />
            Browse ads
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {listings.map(l => <ListingCard key={l.id} listing={l} />)}
        </div>
      )}
    </div>
  )
}
