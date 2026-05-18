import Link from 'next/link'
import { createServiceClient } from '@/lib/supabase/service'
import { timeAgo } from '@/lib/utils'

export const dynamic = 'force-dynamic'

interface AuditRow {
  id: string
  actor_id: string | null
  action: string
  entity_type: string
  entity_id: string | null
  meta: Record<string, unknown>
  created_at: string
  actor: { id: string; name: string } | null
}

const ACTION_COLORS: Record<string, string> = {
  'listing.approve':   '#15803d',
  'listing.reject':    '#b91c1c',
  'listing.update':    '#0D475C',
  'report.resolve':    '#15803d',
  'report.dismiss':    '#6b7280',
  'user.ban':          '#b91c1c',
  'user.unban':        '#15803d',
  'user.update':       '#0D475C',
  'category.create':   '#15803d',
  'category.update':   '#0D475C',
  'category.delete':   '#b91c1c',
  'banned_word.create':'#a16207',
  'banned_word.delete':'#6b7280',
}

export default async function AdminAuditPage({
  searchParams,
}: {
  searchParams: Promise<{ action?: string; entity?: string }>
}) {
  const sp = await searchParams
  const supabase = createServiceClient()

  let query = supabase
    .from('audit_log')
    .select(`
      id, actor_id, action, entity_type, entity_id, meta, created_at,
      actor:user_profiles!audit_log_actor_id_fkey ( id, name )
    `)
    .order('created_at', { ascending: false })
    .limit(200)

  if (sp.action) query = query.eq('action', sp.action)
  if (sp.entity) query = query.eq('entity_type', sp.entity)

  const { data } = await query
  const rows = (data ?? []) as unknown as AuditRow[]

  return (
    <div>
      <h1 className="text-xl font-extrabold mb-1" style={{ color: '#0D475C' }}>Audit log</h1>
      <p className="text-sm text-gray-500 mb-5">Latest 200 admin actions.</p>

      <div className="flex flex-wrap gap-2 mb-4">
        <Link
          href="/admin/audit"
          className="text-xs font-semibold px-2.5 py-1.5 rounded border border-gray-300 hover:bg-gray-50"
        >
          All
        </Link>
        {['listing', 'report', 'user', 'category', 'banned_word'].map(e => (
          <Link
            key={e}
            href={`/admin/audit?entity=${e}`}
            className="text-xs font-semibold px-2.5 py-1.5 rounded border"
            style={{
              borderColor: sp.entity === e ? '#0D475C' : '#d1d5db',
              color: sp.entity === e ? '#0D475C' : '#374151',
              backgroundColor: sp.entity === e ? '#e6f2f7' : 'white',
            }}
          >
            {e}
          </Link>
        ))}
      </div>

      {rows.length === 0 ? (
        <div className="bg-white rounded-xl border py-16 text-center" style={{ borderColor: '#dbdadb' }}>
          <p className="text-5xl mb-3">📜</p>
          <p className="font-semibold text-gray-700">No audit entries</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border overflow-hidden" style={{ borderColor: '#dbdadb' }}>
          <ul className="divide-y" style={{ borderColor: '#f0f0f0' }}>
            {rows.map(r => (
              <li key={r.id} className="px-4 py-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded text-white"
                        style={{ backgroundColor: ACTION_COLORS[r.action] ?? '#374151' }}
                      >
                        {r.action}
                      </span>
                      <span className="text-xs text-gray-500">
                        by <span className="font-semibold">{r.actor?.name ?? 'system'}</span>
                      </span>
                      {r.entity_id && (
                        <span className="text-xs text-gray-400 font-mono">{r.entity_type}:{r.entity_id.slice(0, 8)}</span>
                      )}
                    </div>
                    {Object.keys(r.meta).length > 0 && (
                      <pre className="text-[11px] mt-1.5 bg-gray-50 rounded px-2 py-1.5 overflow-x-auto text-gray-700 whitespace-pre-wrap break-all">
                        {JSON.stringify(r.meta, null, 0)}
                      </pre>
                    )}
                  </div>
                  <span className="text-xs text-gray-400 flex-shrink-0">{timeAgo(r.created_at)}</span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
