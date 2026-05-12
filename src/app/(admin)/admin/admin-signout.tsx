'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { LogOut } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export default function AdminSignOut() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handleSignOut() {
    if (loading) return
    setLoading(true)
    try {
      const supabase = createClient()
      await supabase.auth.signOut()
      router.push('/login')
      router.refresh()
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      type="button"
      onClick={handleSignOut}
      disabled={loading}
      className="flex items-center gap-1 font-semibold hover:underline disabled:opacity-60"
      style={{ color: '#0D475C' }}
    >
      <LogOut size={12} />
      {loading ? 'Signing out…' : 'Sign out'}
    </button>
  )
}
