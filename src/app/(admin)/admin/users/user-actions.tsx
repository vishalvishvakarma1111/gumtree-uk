'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { ShieldCheck, ShieldOff, Ban, CircleCheck } from 'lucide-react'

export default function UserActions({
  userId,
  isAdmin,
  isBanned,
}: {
  userId: string
  isAdmin: boolean
  isBanned: boolean
}) {
  const router = useRouter()
  const [, startTransition] = useTransition()
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState<string | null>(null)

  async function patch(body: unknown, confirmMsg?: string) {
    if (confirmMsg && !confirm(confirmMsg)) return
    setBusy(true); setErr(null)
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Update failed')
      startTransition(() => router.refresh())
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Update failed')
    } finally {
      setBusy(false)
    }
  }

  async function handleBan() {
    const days = prompt('Ban duration in days?', '30')
    if (!days) return
    const reason = prompt('Reason (visible only to admins)?') ?? ''
    await patch({ ban: true, ban_days: Number(days), ban_reason: reason })
  }

  const btn = 'inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded border disabled:opacity-50'

  return (
    <div className="flex items-center gap-1.5">
      {err && <span className="text-xs text-red-600 mr-2">{err}</span>}
      {isAdmin ? (
        <button
          type="button"
          className={`${btn} border-gray-300 text-gray-700 hover:bg-gray-50`}
          onClick={() => patch({ is_admin: false }, 'Demote this admin?')}
          disabled={busy}
        >
          <ShieldOff size={12} /> Demote
        </button>
      ) : (
        <button
          type="button"
          className={`${btn} border-amber-300 text-amber-700 hover:bg-amber-50`}
          onClick={() => patch({ is_admin: true }, 'Promote this user to admin?')}
          disabled={busy}
        >
          <ShieldCheck size={12} /> Make admin
        </button>
      )}
      {isBanned ? (
        <button
          type="button"
          className={`${btn} border-green-300 text-green-700 hover:bg-green-50`}
          onClick={() => patch({ ban: false }, 'Unban this user?')}
          disabled={busy}
        >
          <CircleCheck size={12} /> Unban
        </button>
      ) : (
        <button
          type="button"
          className={`${btn} border-red-300 text-red-700 hover:bg-red-50`}
          onClick={handleBan}
          disabled={busy}
        >
          <Ban size={12} /> Ban
        </button>
      )}
    </div>
  )
}
