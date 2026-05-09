'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function MessagesRefresher({ userId }: { userId: string }) {
  const router = useRouter()

  useEffect(() => {
    const supabase = createClient()
    const channel = supabase
      .channel(`messages-list:${userId}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, () => router.refresh())
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'messages' }, () => router.refresh())
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'conversations' }, () => router.refresh())
      .subscribe()

    function onVisible() {
      if (document.visibilityState === 'visible') router.refresh()
    }
    document.addEventListener('visibilitychange', onVisible)

    return () => {
      supabase.removeChannel(channel)
      document.removeEventListener('visibilitychange', onVisible)
    }
  }, [userId, router])

  return null
}
