'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { MessageCircle, Heart, Lock, Loader2 } from 'lucide-react'

interface ContactPanelProps {
  listingId: string
  sellerName: string
  isAuthenticated: boolean
  initialSaved?: boolean
}

export default function ContactPanel({ listingId, sellerName, isAuthenticated, initialSaved = false }: ContactPanelProps) {
  const router = useRouter()
  const [saved, setSaved] = useState(initialSaved)
  const [savingPending, setSavingPending] = useState(false)
  const [messageOpen, setMessageOpen] = useState(false)
  const [message, setMessage] = useState("Hi, I'm interested in this item. Is it still available?")
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)
  const [sendError, setSendError] = useState('')

  function requireAuth(action: () => void) {
    if (!isAuthenticated) {
      router.push(`/login?next=/listings/${listingId}`)
      return
    }
    action()
  }

  async function toggleSaved() {
    if (savingPending) return
    setSavingPending(true)
    const next = !saved
    setSaved(next)
    try {
      if (next) {
        const res = await fetch('/api/watchlist', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ listing_id: listingId }),
        })
        if (!res.ok) throw new Error()
      } else {
        const res = await fetch(`/api/watchlist?listing_id=${listingId}`, { method: 'DELETE' })
        if (!res.ok) throw new Error()
      }
    } catch {
      setSaved(!next)
    } finally {
      setSavingPending(false)
    }
  }

  async function handleSend() {
    if (!message.trim() || sending) return
    setSending(true)
    setSendError('')
    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ listing_id: listingId, content: message }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to send')
      setSent(true)
      setTimeout(() => {
        setMessageOpen(false)
        setSent(false)
        if (data.conversation_id) router.push(`/messages/${data.conversation_id}`)
      }, 1500)
    } catch (err: unknown) {
      setSendError(err instanceof Error ? err.message : 'Failed to send')
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="bg-white rounded-lg p-5 border" style={{ borderColor: '#dbdadb' }}>
      <button
        onClick={() => requireAuth(() => setMessageOpen(true))}
        className="w-full flex items-center justify-center gap-2 py-3 rounded font-bold text-sm text-white mb-3 transition-opacity hover:opacity-90"
        style={{ backgroundColor: '#e75462' }}
      >
        <MessageCircle size={16} />
        Reply to ad
      </button>

      <button
        onClick={() => requireAuth(toggleSaved)}
        disabled={savingPending}
        className="w-full flex items-center justify-center gap-2 py-2.5 rounded font-semibold text-sm border transition-colors disabled:opacity-60"
        style={
          saved
            ? { backgroundColor: '#e75462', color: '#fff', borderColor: '#e75462' }
            : { backgroundColor: '#fff', color: '#0D475C', borderColor: '#0D475C' }
        }
      >
        <Heart size={15} fill={saved ? 'white' : 'none'} />
        {saved ? 'Saved to watchlist' : 'Save to watchlist'}
      </button>

      {!isAuthenticated && (
        <p className="flex items-center justify-center gap-1.5 text-xs text-gray-400 mt-3">
          <Lock size={11} />
          <Link href="/login" className="hover:underline" style={{ color: '#0D475C' }}>
            Log in
          </Link>
          {' '}to reply or save
        </p>
      )}

      {messageOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-xl w-full max-w-md p-6 shadow-xl">
            <h3 className="font-bold text-base mb-1" style={{ color: '#0D475C' }}>
              Message {sellerName}
            </h3>
            <p className="text-xs text-gray-400 mb-4">
              Your message will be sent to the seller&apos;s inbox.
            </p>
            {sent ? (
              <div className="text-center py-8">
                <p className="text-4xl mb-3">✉️</p>
                <p className="font-semibold text-gray-700">Message sent!</p>
                <p className="text-sm text-gray-400 mt-1">Opening your conversation…</p>
              </div>
            ) : (
              <>
                <textarea
                  rows={5}
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2.5 text-sm outline-none resize-none mb-2"
                  style={{ borderColor: '#dbdadb' }}
                  onFocus={e => (e.currentTarget.style.borderColor = '#0D475C')}
                  onBlur={e => (e.currentTarget.style.borderColor = '#dbdadb')}
                />
                {sendError && <p className="text-xs text-red-500 mb-2">{sendError}</p>}
                <div className="flex gap-3 mt-2">
                  <button
                    onClick={() => setMessageOpen(false)}
                    className="flex-1 py-2.5 rounded border text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
                    style={{ borderColor: '#dbdadb' }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSend}
                    disabled={sending}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded text-white text-sm font-bold transition-opacity hover:opacity-90 disabled:opacity-60"
                    style={{ backgroundColor: '#e75462' }}
                  >
                    {sending && <Loader2 size={14} className="animate-spin" />}
                    {sending ? 'Sending…' : 'Send message'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
