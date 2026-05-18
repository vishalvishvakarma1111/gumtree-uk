import Link from 'next/link'
import { createServiceClient } from '@/lib/supabase/service'
import { timeAgo } from '@/lib/utils'
import UserActions from './user-actions'

export const dynamic = 'force-dynamic'

const TABS = [
  { value: 'all',    label: 'All' },
  { value: 'admins', label: 'Admins' },
  { value: 'banned', label: 'Banned' },
] as const
type TabValue = typeof TABS[number]['value']

interface UserRow {
  id: string
  name: string
  location: string
  is_admin: boolean
  banned_until: string | null
  banned_reason: string | null
  created_at: string
}

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string; q?: string }>
}) {
  const sp = await searchParams
  const filter: TabValue = (TABS.find(t => t.value === sp.filter)?.value ?? 'all') as TabValue
  const q = (sp.q ?? '').trim()

  const supabase = createServiceClient()
  let query = supabase
    .from('user_profiles')
    .select('id, name, location, is_admin, banned_until, banned_reason, created_at')
    .order('created_at', { ascending: false })
    .limit(100)
  if (q) query = query.ilike('name', `%${q}%`)
  if (filter === 'admins') query = query.eq('is_admin', true)
  if (filter === 'banned') query = query.gt('banned_until', new Date().toISOString())

  const { data } = await query
  const users = (data ?? []) as UserRow[]
  const nowIso = new Date().toISOString()

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-xl font-extrabold" style={{ color: '#0D475C' }}>Users</h1>
      </div>

      <div className="flex gap-1 border-b mb-4" style={{ borderColor: '#dbdadb' }}>
        {TABS.map(t => {
          const active = t.value === filter
          return (
            <Link
              key={t.value}
              href={`/admin/users?filter=${t.value}${q ? `&q=${encodeURIComponent(q)}` : ''}`}
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

      <form className="mb-4" action="/admin/users">
        <input type="hidden" name="filter" value={filter} />
        <input
          type="search"
          name="q"
          placeholder="Search by name…"
          defaultValue={q}
          className="border rounded px-3 py-2 text-sm w-full max-w-sm"
        />
      </form>

      {users.length === 0 ? (
        <div className="bg-white rounded-xl border py-16 text-center" style={{ borderColor: '#dbdadb' }}>
          <p className="text-5xl mb-3">👤</p>
          <p className="font-semibold text-gray-700">No users</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border overflow-hidden" style={{ borderColor: '#dbdadb' }}>
          <ul className="divide-y" style={{ borderColor: '#f0f0f0' }}>
            {users.map(u => {
              const isBanned = !!u.banned_until && u.banned_until > nowIso
              return (
                <li key={u.id} className="px-4 py-3 flex items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-2 flex-wrap">
                      <Link
                        href={`/seller/${u.id}`}
                        className="font-semibold text-sm text-gray-900 hover:underline truncate"
                      >
                        {u.name || 'Unnamed'}
                      </Link>
                      {u.is_admin && (
                        <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded" style={{ backgroundColor: '#fef3c7', color: '#a16207' }}>
                          Admin
                        </span>
                      )}
                      {isBanned && (
                        <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-red-100 text-red-700">
                          Banned · until {new Date(u.banned_until!).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-gray-400 mt-0.5">
                      {u.location || '—'} · joined {timeAgo(u.created_at)}
                    </div>
                    {isBanned && u.banned_reason && (
                      <p className="text-xs text-red-600 mt-1">Reason: {u.banned_reason}</p>
                    )}
                  </div>
                  <UserActions
                    userId={u.id}
                    isAdmin={u.is_admin}
                    isBanned={isBanned}
                  />
                </li>
              )
            })}
          </ul>
        </div>
      )}
    </div>
  )
}
