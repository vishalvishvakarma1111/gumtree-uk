import { redirect } from 'next/navigation'
import Link from 'next/link'
import { LayoutDashboard, FileCheck, Flag, Users, FolderTree, ShieldAlert, ScrollText } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { isAdminUser } from '@/lib/admin'
import AdminSignOut from './admin-signout'

const NAV = [
  { label: 'Dashboard',          href: '/admin',              Icon: LayoutDashboard },
  { label: 'Pending listings',   href: '/admin/listings',     Icon: FileCheck },
  { label: 'Reports',            href: '/admin/reports',      Icon: Flag },
  { label: 'Users',              href: '/admin/users',        Icon: Users },
  { label: 'Categories',         href: '/admin/categories',   Icon: FolderTree },
  { label: 'Banned words',       href: '/admin/banned-words', Icon: ShieldAlert },
  { label: 'Audit log',          href: '/admin/audit',        Icon: ScrollText },
]

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login?next=/admin')
  if (!(await isAdminUser(supabase, user.id))) redirect('/')

  return (
    <div style={{ backgroundColor: '#f1f1f1', minHeight: '100vh' }}>
      <header className="shadow-sm sticky top-0 z-40" style={{ backgroundColor: '#0D475C' }}>
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/admin" className="flex items-center gap-2" aria-label="Gumtree Admin home">
              <svg xmlns="http://www.w3.org/2000/svg" width="22" height="28" viewBox="27.74 5.25 19.52 24.298" aria-hidden="true">
                <path fill="#72EF36" d="M44.433 11.914a.707.707 0 0 1-.337-.606C43.76 7.942 40.933 5.25 37.5 5.25s-6.327 2.625-6.596 6.058a.806.806 0 0 1-.336.606c-1.683 1.211-2.827 3.164-2.827 5.384 0 3.029 2.087 5.654 4.914 6.395.471.135 1.01.202 1.144.067.337-.202.808-1.885.606-2.221-.135-.203-.539-.404-1.077-.539-1.683-.471-2.895-1.952-2.895-3.769 0-1.01.404-1.885 1.01-2.625a2.964 2.964 0 0 1 1.01-.808c.74-.404 1.144-1.144 1.144-1.952 0-.404.067-.808.202-1.211.539-1.548 1.952-2.692 3.702-2.692s3.164 1.144 3.702 2.692c.134.404.202.808.202 1.211 0 .808.403 1.548 1.144 1.952.404.202.673.471 1.01.808a3.967 3.967 0 0 1 1.01 2.625 3.907 3.907 0 0 1-3.903 3.904c-2.491 0-4.443 2.02-4.443 4.51v2.558c0 .471.067 1.009.202 1.144.27.27 2.02.27 2.288 0 .135-.135.203-.673.203-1.144v-2.625c0-.942.807-1.75 1.75-1.75 3.634 0 6.596-2.962 6.596-6.596-.002-2.155-1.147-4.107-2.829-5.318z"/>
              </svg>
              <span className="font-extrabold text-lg tracking-tight" style={{ color: '#F0ECE6' }}>
                Gumtree
              </span>
            </Link>
            <span className="text-xs font-semibold uppercase tracking-wide px-2 py-0.5 rounded" style={{ backgroundColor: '#fef3c7', color: '#a16207' }}>
              Staff
            </span>
          </div>
          <div className="flex items-center gap-3 text-xs">
            <span className="hidden sm:inline" style={{ color: '#F0ECE6', opacity: 0.8 }}>{user.email}</span>
            <AdminSignOut />
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
