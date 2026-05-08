import Header from '@/components/layout/header'
import Footer from '@/components/layout/footer'
import { createClient } from '@/lib/supabase/server'

export default async function MainLayout({ children }: { children: React.ReactNode }) {
  let user: { id: string; email: string; name: string } | null = null

  try {
    const supabase = await createClient()
    const { data: { user: u } } = await supabase.auth.getUser()
    if (u) {
      user = {
        id: u.id,
        email: u.email ?? '',
        name: (u.user_metadata?.name as string) || u.email?.split('@')[0] || 'You',
      }
    }
  } catch {
    // Supabase not configured — guest mode
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#f1f1f1' }}>
      <Header user={user} />
      <main className="flex-1 w-full">{children}</main>
      <Footer />
    </div>
  )
}
