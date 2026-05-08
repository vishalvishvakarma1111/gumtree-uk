import Link from 'next/link'
import { Heart, Plus } from 'lucide-react'

export default function WatchlistPage() {
  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-lg font-extrabold" style={{ color: '#0D475C' }}>Watchlist</h2>
      </div>
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
    </div>
  )
}
