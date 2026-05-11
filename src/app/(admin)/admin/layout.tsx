import { redirect } from 'next/navigation'
import Link from 'next/link'
import { LayoutDashboard, FileCheck, Flag, LogOut } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { isAdminUser } from '@/lib/admin'

const NAV = [
  { label: 'Dashboard',          href: '/admin',          Icon: LayoutDashboard },
  { label: 'Pending listings',   href: '/admin/listings', Icon: FileCheck },
  { label: 'Reports',            href: '/admin/reports',  Icon: Flag },
]

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login?next=/admin')
  if (!(await isAdminUser(supabase, user.id))) redirect('/')

  return (
    <div style={{ backgroundColor: '#f1f1f1', minHeight: '100vh' }}>
      <header className="bg-white border-b sticky top-0 z-40" style={{ borderColor: '#dbdadb' }}>
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/admin" className="font-extrabold text-lg" style={{ color: '#0D475C' }}>
              Gumtree Admin
            </Link>
            <span className="text-xs font-semibold uppercase tracking-wide px-2 py-0.5 rounded" style={{ backgroundColor: '#fef3c7', color: '#a16207' }}>
              Staff
            </span>
          </div>
          <div className="flex items-center gap-3 text-xs">
            <span className="text-gray-500 hidden sm:inline">{user.email}</span>
            <Link href="/" className="flex items-center gap-1 font-semibold hover:underline" style={{ color: '#0D475C' }}>
              <LogOut size={12} />
              Exit admin
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6 flex gap-5 items-start">
        <aside className="hidden md:block w-56 flex-shrink-0">
          <nav className="bg-white rounded-lg border overflow-hidden" style={{ borderColor: '#dbdadb' }}>
            {NAV.map(({ label, href, Icon }) => (
              <Link
                key={href}
                href={href}
                className="flex items-center gap-3 px-4 py-3 text-sm font-medium border-b hover:bg-gray-50 transition-colors"
                style={{ color: '#0D475C', borderColor: '#f0f0f0' }}
              >
                <Icon size={14} className="text-gray-400" />
                {label}
              </Link>
            ))}
          </nav>
        </aside>
        <div className="flex-1 min-w-0">{children}</div>
      </div>
    </div>
  )
}
