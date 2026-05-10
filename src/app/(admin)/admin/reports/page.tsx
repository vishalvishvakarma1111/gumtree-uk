import Link from 'next/link'
import { createServiceClient } from '@/lib/supabase/service'
import { timeAgo } from '@/lib/utils'
import ReportRow from './report-row'

export const dynamic = 'force-dynamic'

const TABS = [
  { value: 'open',      label: 'Open' },
  { value: 'resolved',  label: 'Resolved' },
  { value: 'dismissed', label: 'Dismissed' },
] as const

type TabValue = typeof TABS[number]['value']

interface Report {
  id: string
  reason: string
  status: string
  created_at: string
  resolved_at: string | null
  reporter: { id: string; name: string } | null
  listing: { id: string; title: string; status: string } | null
}

export default async function AdminReportsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>
}) {
  const sp = await searchParams
  const status: TabValue = (TABS.find(t => t.value === sp.status)?.value ?? 'open') as TabValue

  const supabase = createServiceClient()
  const { data } = await supabase
    .from('reports')
    .select(`
      id, reason, status, created_at, resolved_at,
      reporter:user_profiles!reports_reporter_id_fkey ( id, name ),
      listing:listings ( id, title, status )
    `)
    .eq('status', status)
    .order('created_at', { ascending: false })
    .limit(100)

  const reports = (data ?? []) as unknown as Report[]

  return (
    <div>
      <h1 className="text-xl font-extrabold mb-5" style={{ color: '#0D475C' }}>Reports</h1>

      <div className="flex gap-1 border-b mb-5" style={{ borderColor: '#dbdadb' }}>
        {TABS.map(t => {
          const active = t.value === status
          return (
            <Link
              key={t.value}
              href={`/admin/reports?status=${t.value}`}
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

      {reports.length === 0 ? (
        <div className="bg-white rounded-xl border py-16 text-center" style={{ borderColor: '#dbdadb' }}>
          <p className="text-5xl mb-3">🚩</p>
          <p className="font-semibold text-gray-700">No {status} reports</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border overflow-hidden" style={{ borderColor: '#dbdadb' }}>
          <ul className="divide-y" style={{ borderColor: '#f0f0f0' }}>
            {reports.map(r => (
              <li key={r.id} className="px-5 py-4">
                <div className="flex items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline justify-between gap-2 mb-1">
                      <p className="font-semibold text-sm text-gray-900">
                        {r.reporter?.name ?? 'Anonymous'} reported{' '}
                        <Link
                          href={r.listing ? `/admin/listings/${r.listing.id}` : '#'}
                          className="hover:underline"
                          style={{ color: '#0D475C' }}
                        >
                          {r.listing?.title ?? '(deleted listing)'}
                        </Link>
                      </p>
                      <span className="text-xs text-gray-400 flex-shrink-0">{timeAgo(r.created_at)}</span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{r.reason}</p>
                    {r.listing && (
                      <p className="text-xs text-gray-400 mb-2">
                        Listing status: <span className="font-semibold">{r.listing.status}</span>
                      </p>
                    )}
                    {status === 'open' && <ReportRow id={r.id} listingId={r.listing?.id} />}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
