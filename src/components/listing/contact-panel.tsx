'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { MessageCircle, Heart, Lock, Loader2, Share2, Flag, Check } from 'lucide-react'

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
  const [shared, setShared] = useState(false)
  const [reported, setReported] = useState(false)
  const [reportOpen, setReportOpen] = useState(false)
  const [reportReason, setReportReason] = useState('')
  const [reportError, setReportError] = useState('')
  const [reportSubmitting, setReportSubmitting] = useState(false)

  async function handleShare() {
    const url = typeof window !== 'undefined' ? window.location.href : ''
    if (typeof navigator !== 'undefined' && 'share' in navigator) {
      try {
        await (navigator as Navigator & { share: (data: ShareData) => Promise<void> }).share({ url, title: sellerName })
        return
      } catch {
        // fall through to copy
      }
    }
    try {
      await navigator.clipboard.writeText(url)
      setShared(true)
      setTimeout(() => setShared(false), 2000)
    } catch {
      // ignore
    }
  }

  async function submitReport() {
    if (!reportReason.trim() || reportSubmitting) return
    setReportSubmitting(true)
    setReportError('')
    try {
      const res = await fetch(`/api/listings/${listingId}/report`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: reportReason }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.error || 'Failed to submit report')
      setReported(true)
      setReportOpen(false)
      setReportReason('')
      setTimeout(() => setReported(false), 4000)
    } catch (err: unknown) {
      setReportError(err instanceof Error ? err.message : 'Failed to submit report')
    } finally {
      setReportSubmitting(false)
    }
  }

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

      <div className="flex gap-2 mt-3">
        <button
          onClick={handleShare}
          className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded text-xs font-semibold border hover:bg-gray-50 transition-colors"
          style={{ borderColor: '#dbdadb', color: '#0D475C' }}
        >
          {shared ? <Check size={13} /> : <Share2 size={13} />}
          {shared ? 'Link copied' : 'Share'}
        </button>
        <button
          onClick={() => requireAuth(() => setReportOpen(true))}
          className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded text-xs font-semibold border hover:bg-gray-50 transition-colors"
          style={{ borderColor: '#dbdadb', color: '#b91c1c' }}
        >
          <Flag size={13} />
          {reported ? 'Reported' : 'Report'}
        </button>
      </div>

      {reported && (
        <p className="text-xs text-center text-green-600 mt-2">Thanks — our team will review.</p>
      )}

      {reportOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-xl w-full max-w-md p-6 shadow-xl">
            <h3 className="font-bold text-base mb-3" style={{ color: '#0D475C' }}>Report this ad</h3>
            <textarea
              rows={4}
              value={reportReason}
              onChange={e => setReportReason(e.target.value)}
              placeholder="Tell us what's wrong (scam, prohibited item, miscategorised, etc.)"
              className="w-full border rounded-lg px-3 py-2.5 text-sm outline-none resize-none mb-3"
              style={{ borderColor: '#dbdadb' }}
            />
            {reportError && <p className="text-xs text-red-500 mb-2">{reportError}</p>}
            <div className="flex gap-3">
              <button
                onClick={() => { setReportOpen(false); setReportError('') }}
                className="flex-1 py-2.5 rounded border text-sm font-medium text-gray-600 hover:bg-gray-50"
                style={{ borderColor: '#dbdadb' }}
              >
                Cancel
              </button>
              <button
                onClick={submitReport}
                disabled={!reportReason.trim() || reportSubmitting}
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded text-white text-sm font-bold disabled:opacity-60"
                style={{ backgroundColor: '#e75462' }}
              >
                {reportSubmitting && <Loader2 size={14} className="animate-spin" />}
                {reportSubmitting ? 'Submitting…' : 'Submit report'}
              </button>
            </div>
          </div>
        </div>
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
