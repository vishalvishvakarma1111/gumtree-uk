import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { MessageCircle } from 'lucide-react'
import Link from 'next/link'

export default async function MessagesPage() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/login?next=/messages')
  } catch {
    redirect('/login?next=/messages')
  }

  return (
    <div style={{ backgroundColor: '#f1f1f1', minHeight: '100vh' }}>
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-xl font-extrabold mb-6" style={{ color: '#0D475C' }}>Messages</h1>

        <div className="bg-white rounded-xl border py-20 text-center" style={{ borderColor: '#dbdadb' }}>
          <MessageCircle size={44} className="mx-auto text-gray-200 mb-4" />
          <h3 className="font-bold text-gray-700 mb-2">No messages yet</h3>
          <p className="text-sm text-gray-400 mb-6">
            When you reply to an ad or a seller contacts you, messages will appear here.
          </p>
          <Link
            href="/browse"
            className="inline-block px-6 py-2.5 rounded text-white text-sm font-bold"
            style={{ backgroundColor: '#0D475C' }}
          >
            Browse ads
          </Link>
        </div>
      </div>
    </div>
  )
}
