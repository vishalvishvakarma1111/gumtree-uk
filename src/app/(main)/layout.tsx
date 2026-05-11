import Header from '@/components/layout/header'
import Footer from '@/components/layout/footer'
import { createClient } from '@/lib/supabase/server'
import { isAdminUser } from '@/lib/admin'

export default async function MainLayout({ children }: { children: React.ReactNode }) {
  let user: { id: string; email: string; name: string; isAdmin: boolean } | null = null
  let unreadMessages = 0

  try {
    const supabase = await createClient()
    const { data: { user: u } } = await supabase.auth.getUser()
    if (u) {
      user = {
        id: u.id,
        email: u.email ?? '',
        name: (u.user_metadata?.name as string) || u.email?.split('@')[0] || 'You',
        isAdmin: await isAdminUser(supabase, u.id),
      }

      const { data: convos } = await supabase
        .from('conversations')
        .select('id')
        .or(`buyer_id.eq.${u.id},seller_id.eq.${u.id}`)

      const convoIds = (convos ?? []).map(c => c.id)
      if (convoIds.length > 0) {
        const { count } = await supabase
          .from('messages')
          .select('id', { count: 'exact', head: true })
          .in('conversation_id', convoIds)
          .neq('sender_id', u.id)
          .is('read_at', null)
        unreadMessages = count ?? 0
      }
    }
  } catch {
    // Supabase not configured — guest mode
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#f1f1f1' }}>
      <Header user={user} unreadMessages={unreadMessages} />
      <main className="flex-1 w-full">{children}</main>
      <Footer />
    </div>
  )
}
