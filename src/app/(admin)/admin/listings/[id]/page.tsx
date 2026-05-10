import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { createServiceClient } from '@/lib/supabase/service'
import { formatPrice, timeAgo } from '@/lib/utils'
import ListingActions from './listing-actions'

export const dynamic = 'force-dynamic'

interface ListingFull {
  id: string
  title: string
  description: string
  price: number | null
  price_type: string
  condition: string
  images: string[]
  location: string
  status: string
  rejection_reason: string | null
  views_count: number
  created_at: string
  is_urgent: boolean
  user_profiles: { id: string; name: string; created_at: string } | null
  categories: { name: string; slug: string } | null
}

interface ReportRow {
  id: string
  reason: string
  status: string
  created_at: string
  reporter: { id: string; name: string } | null
}

export default async function AdminListingDetail({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = createServiceClient()

  const { data: listing } = await supabase
    .from('listings')
    .select('*, user_profiles(id, name, created_at), categories(name, slug)')
    .eq('id', id)
    .maybeSingle()

  if (!listing) notFound()

  const { data: reportsRaw } = await supabase
    .from('reports')
    .select('id, reason, status, created_at, reporter:user_profiles!reports_reporter_id_fkey(id, name)')
    .eq('listing_id', id)
    .order('created_at', { ascending: false })

  const reports = (reportsRaw ?? []) as unknown as ReportRow[]
  const l = listing as unknown as ListingFull

  return (
    <div>
      <Link href="/admin/listings" className="text-xs font-semibold mb-3 inline-block hover:underline" style={{ color: '#0D475C' }}>
        ← Back to listings
      </Link>

      <div className="bg-white rounded-xl border overflow-hidden" style={{ borderColor: '#dbdadb' }}>
        <div className="p-5">
          <div className="flex items-start justify-between gap-3 mb-4">
            <div>
              <h1 className="text-lg font-extrabold" style={{ color: '#0D475C' }}>{l.title}</h1>
              <p className="text-2xl font-extrabold mt-1" style={{ color: '#e75462' }}>
                {formatPrice(l.price, l.price_type)}
              </p>
            </div>
            <span className="text-xs font-bold uppercase tracking-wide px-2 py-0.5 rounded-full"
              style={{
                backgroundColor: l.status === 'pending' ? '#fef3c7' : l.status === 'rejected' ? '#fee2e2' : '#dcfce7',
                color: l.status === 'pending' ? '#a16207' : l.status === 'rejected' ? '#b91c1c' : '#15803d',
              }}>
              {l.status}
            </span>
          </div>

          {l.images.length > 0 ? (
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 mb-4">
              {l.images.map((url, i) => (
                <div key={i} className="relative aspect-square rounded overflow-hidden bg-gray-100">
                  <Image src={url} alt={`Photo ${i + 1}`} fill className="object-cover" sizes="120px" />
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-gray-400 italic mb-4">No photos uploaded.</p>
          )}

          <p className="text-sm whitespace-pre-wrap text-gray-700 mb-4">{l.description || <span className="italic text-gray-400">No description</span>}</p>

          <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs mb-4">
            <Detail label="Seller" value={l.user_profiles?.name ?? 'Unknown'} />
            <Detail label="Category" value={l.categories?.name ?? '—'} />
            <Detail label="Condition" value={l.condition} />
            <Detail label="Location" value={l.location || '—'} />
            <Detail label="Posted" value={timeAgo(l.created_at)} />
            <Detail label="Views" value={String(l.views_count)} />
          </dl>

          {l.rejection_reason && (
            <div className="p-3 rounded-lg border text-xs mb-4" style={{ backgroundColor: '#fef2f2', borderColor: '#fecaca', color: '#b91c1c' }}>
              <p className="font-semibold">Previous rejection reason:</p>
              <p>{l.rejection_reason}</p>
            </div>
          )}

          <ListingActions listingId={l.id} currentStatus={l.status} />
        </div>
      </div>

      {reports.length > 0 && (
        <div className="bg-white rounded-xl border mt-5 overflow-hidden" style={{ borderColor: '#dbdadb' }}>
          <div className="px-5 py-3 border-b" style={{ borderColor: '#f0f0f0' }}>
            <h2 className="font-bold text-sm" style={{ color: '#b91c1c' }}>Reports ({reports.length})</h2>
          </div>
          <ul className="divide-y" style={{ borderColor: '#f0f0f0' }}>
            {reports.map(r => (
              <li key={r.id} className="px-5 py-3 text-sm">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold text-gray-700">{r.reporter?.name ?? 'Anonymous'}</span>
                  <span className="text-xs text-gray-400">{timeAgo(r.created_at)}</span>
                </div>
                <p className="text-gray-600">{r.reason}</p>
                <span className="text-[10px] font-bold uppercase tracking-wide mt-1 inline-block"
                  style={{ color: r.status === 'open' ? '#b91c1c' : '#15803d' }}>
                  {r.status}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-gray-400">{label}</dt>
      <dd className="text-gray-900 font-medium">{value}</dd>
    </div>
  )
}
