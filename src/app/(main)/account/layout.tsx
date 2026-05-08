import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { FileText, Heart, MessageCircle, User } from 'lucide-react'

const NAV = [
  { label: 'My Ads',    href: '/account/my-ads',   Icon: FileText },
  { label: 'Watchlist', href: '/account/watchlist', Icon: Heart },
  { label: 'Messages',  href: '/messages',          Icon: MessageCircle },
  { label: 'Profile',   href: '/account/profile',   Icon: User },
]

export default async function AccountLayout({ children }: { children: React.ReactNode }) {
  let userName = ''

  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/login?next=/account/my-ads')
    userName = (user.user_metadata?.name as string) || user.email?.split('@')[0] || 'My Account'
  } catch {
    redirect('/login?next=/account/my-ads')
  }

  return (
    <div style={{ backgroundColor: '#f1f1f1', minHeight: '100vh' }}>
      <div className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-xl font-extrabold mb-6" style={{ color: '#0D475C' }}>
          {userName}&apos;s account
        </h1>
        <div className="flex gap-6 items-start">
          {/* Sidebar */}
          <aside className="hidden md:block w-52 flex-shrink-0">
            <nav className="bg-white rounded-lg border overflow-hidden" style={{ borderColor: '#dbdadb' }}>
              {NAV.map(({ label, href, Icon }) => (
                <Link
                  key={href}
                  href={href}
                  className="flex items-center gap-3 px-4 py-3.5 text-sm font-medium border-b hover:bg-gray-50 transition-colors"
                  style={{ color: '#0D475C', borderColor: '#f0f0f0' }}
                >
                  <Icon size={15} className="text-gray-400" />
                  {label}
                </Link>
              ))}
            </nav>
          </aside>
          <div className="flex-1 min-w-0">{children}</div>
        </div>
      </div>
    </div>
  )
}
