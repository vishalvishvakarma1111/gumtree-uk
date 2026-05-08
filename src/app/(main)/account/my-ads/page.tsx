import Link from 'next/link'
import { Plus } from 'lucide-react'

export default function MyAdsPage() {
  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-lg font-extrabold" style={{ color: '#0D475C' }}>My Ads</h2>
        <Link
          href="/post-ad"
          className="flex items-center gap-1.5 text-sm font-bold text-white px-4 py-2 rounded transition-opacity hover:opacity-90"
          style={{ backgroundColor: '#e75462' }}
        >
          <Plus size={15} />
          Post new ad
        </Link>
      </div>
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
    </div>
  )
}
