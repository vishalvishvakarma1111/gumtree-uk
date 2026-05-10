import Link from 'next/link'
import { FileCheck, Flag, ShoppingBag, Users } from 'lucide-react'
import { createServiceClient } from '@/lib/supabase/service'

export const dynamic = 'force-dynamic'

interface StatCardProps {
  label: string
  value: number | string
  href: string
  Icon: React.ComponentType<{ size?: number }>
  accent: string
}

function StatCard({ label, value, href, Icon, accent }: StatCardProps) {
  return (
    <Link
      href={href}
      className="bg-white rounded-xl border p-5 hover:shadow-md transition-shadow"
      style={{ borderColor: '#dbdadb' }}
    >
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">{label}</p>
        <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: accent + '20', color: accent }}>
          <Icon size={16} />
        </div>
      </div>
      <p className="text-2xl font-extrabold mt-2" style={{ color: '#0D475C' }}>{value}</p>
    </Link>
  )
}

export default async function AdminDashboard() {
  const supabase = createServiceClient()

  const [
    { count: pendingCount },
    { count: openReportsCount },
    { count: activeCount },
    { count: usersCount },
  ] = await Promise.all([
    supabase.from('listings').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
    supabase.from('reports').select('id', { count: 'exact', head: true }).eq('status', 'open'),
    supabase.from('listings').select('id', { count: 'exact', head: true }).eq('status', 'active'),
    supabase.from('user_profiles').select('id', { count: 'exact', head: true }),
  ])

  return (
    <div>
      <h1 className="text-xl font-extrabold mb-5" style={{ color: '#0D475C' }}>Dashboard</h1>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard label="Pending review" value={pendingCount ?? 0} href="/admin/listings" Icon={FileCheck} accent="#a16207" />
        <StatCard label="Open reports"   value={openReportsCount ?? 0} href="/admin/reports" Icon={Flag} accent="#b91c1c" />
        <StatCard label="Active ads"     value={activeCount ?? 0}  href="/admin/listings?status=active" Icon={ShoppingBag} accent="#15803d" />
        <StatCard label="Users"          value={usersCount ?? 0}   href="/admin"             Icon={Users} accent="#0D475C" />
      </div>

      <div className="bg-white rounded-xl border mt-6 p-5" style={{ borderColor: '#dbdadb' }}>
        <h2 className="font-bold text-sm mb-2" style={{ color: '#0D475C' }}>Quick actions</h2>
        <div className="flex flex-wrap gap-2 mt-3">
          <Link
            href="/admin/listings"
            className="text-xs font-semibold px-3 py-2 rounded text-white"
            style={{ backgroundColor: '#0D475C' }}
          >
            Review pending listings
          </Link>
          <Link
            href="/admin/reports"
            className="text-xs font-semibold px-3 py-2 rounded text-white"
            style={{ backgroundColor: '#e75462' }}
          >
            Triage open reports
          </Link>
        </div>
      </div>
    </div>
  )
}
