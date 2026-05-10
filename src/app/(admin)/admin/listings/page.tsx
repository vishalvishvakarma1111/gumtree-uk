import Link from 'next/link'
import Image from 'next/image'
import { Clock } from 'lucide-react'
import { createServiceClient } from '@/lib/supabase/service'
import { formatPrice, timeAgo } from '@/lib/utils'

export const dynamic = 'force-dynamic'

const TABS = [
  { value: 'pending',  label: 'Pending' },
  { value: 'active',   label: 'Active' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'sold',     label: 'Sold' },
] as const

type TabValue = typeof TABS[number]['value']

interface ListingRow {
  id: string
  title: string
  price: number | null
  price_type: string
  images: string[]
  location: string
  created_at: string
  status: string
  rejection_reason: string | null
  user_profiles: { id: string; name: string } | null
  categories: { name: string } | null
}

export default async function AdminListingsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>
}) {
  const sp = await searchParams
  const status: TabValue = (TABS.find(t => t.value === sp.status)?.value ?? 'pending') as TabValue

  const supabase = createServiceClient()
  const { data } = await supabase
    .from('listings')
    .select('id, title, price, price_type, images, location, created_at, status, rejection_reason, user_profiles(id, name), categories(name)')
    .eq('status', status)
    .order('created_at', { ascending: false })
    .limit(100)

  const listings = (data ?? []) as unknown as ListingRow[]

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-xl font-extrabold" style={{ color: '#0D475C' }}>Listings</h1>
      </div>

      <div className="flex gap-1 border-b mb-5" style={{ borderColor: '#dbdadb' }}>
        {TABS.map(t => {
          const active = t.value === status
          return (
            <Link
              key={t.value}
              href={`/admin/listings?status=${t.value}`}
              className="px-4 py-2.5 text-sm font-semibold border-b-2 transition-colors"
              style={{
                color: active ? '#0D475C' : '#888',
                borderColor: active ? '#0D475C' : 'transparent',
              }}
            >
              {t.label}
            </Link>
          )
        })}
      </div>

      {listings.length === 0 ? (
        <div className="bg-white rounded-xl border py-16 text-center" style={{ borderColor: '#dbdadb' }}>
          <p className="text-5xl mb-3">✨</p>
          <p className="font-semibold text-gray-700">No {status} listings</p>
        </div>
      ) : (
        <div className="space-y-3">
          {listings.map(l => (
            <Link
              key={l.id}
              href={`/admin/listings/${l.id}`}
              className="bg-white rounded-xl border p-4 flex gap-4 hover:shadow-md transition-shadow"
              style={{ borderColor: '#dbdadb' }}
            >
              <div className="relative w-24 h-24 rounded overflow-hidden flex-shrink-0 bg-gray-100">
                {l.images?.[0] ? (
                  <Image src={l.images[0]} alt={l.title} fill className="object-cover" sizes="96px" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-300 text-xs">No photo</div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-sm text-gray-900 truncate">{l.title}</h3>
                <p className="text-base font-extrabold mt-0.5" style={{ color: '#0D475C' }}>
                  {formatPrice(l.price, l.price_type)}
                </p>
                <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
                  <span>By {l.user_profiles?.name ?? 'Unknown'}</span>
                  <span className="flex items-center gap-1"><Clock size={11} /> {timeAgo(l.created_at)}</span>
                  {l.categories?.name && <span>· {l.categories.name}</span>}
                </div>
                {l.rejection_reason && (
                  <p className="text-xs text-red-600 mt-1.5">Reject reason: {l.rejection_reason}</p>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
