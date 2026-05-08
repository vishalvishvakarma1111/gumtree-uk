'use client'

import { useState } from 'react'
import { MessageCircle, Phone, Heart } from 'lucide-react'

interface ContactPanelProps {
  listingId: string
  sellerName: string
}

export default function ContactPanel({ listingId, sellerName }: ContactPanelProps) {
  const [saved, setSaved] = useState(false)
  const [messageOpen, setMessageOpen] = useState(false)
  const [message, setMessage] = useState(
    `Hi, I'm interested in this item. Is it still available?`
  )
  const [sent, setSent] = useState(false)

  function handleSend() {
    if (!message.trim()) return
    setSent(true)
    setTimeout(() => {
      setMessageOpen(false)
      setSent(false)
    }, 2000)
  }

  return (
    <div className="bg-white rounded-lg p-5 border" style={{ borderColor: '#dbdadb' }}>
      {/* Reply button */}
      <button
        onClick={() => setMessageOpen(true)}
        className="w-full flex items-center justify-center gap-2 py-3 rounded font-bold text-sm text-white mb-3 transition-opacity hover:opacity-90"
        style={{ backgroundColor: '#e75462' }}
      >
        <MessageCircle size={16} />
        Reply to ad
      </button>

      {/* Save button */}
      <button
        onClick={() => setSaved(s => !s)}
        className="w-full flex items-center justify-center gap-2 py-2.5 rounded font-semibold text-sm border transition-colors"
        style={
          saved
            ? { backgroundColor: '#e75462', color: '#fff', borderColor: '#e75462' }
            : { backgroundColor: '#fff', color: '#0D475C', borderColor: '#0D475C' }
        }
      >
        <Heart size={15} fill={saved ? 'white' : 'none'} />
        {saved ? 'Saved to watchlist' : 'Save to watchlist'}
      </button>

      {/* Message modal */}
      {messageOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-xl w-full max-w-md p-6 shadow-xl">
            <h3 className="font-bold text-base mb-1" style={{ color: '#0D475C' }}>
              Message {sellerName}
            </h3>
            <p className="text-xs text-gray-400 mb-4">
              Your message will be sent to the seller's inbox.
            </p>
            {sent ? (
              <div className="text-center py-8">
                <p className="text-4xl mb-3">✉️</p>
                <p className="font-semibold text-gray-700">Message sent!</p>
                <p className="text-sm text-gray-400 mt-1">The seller will be in touch soon.</p>
              </div>
            ) : (
              <>
                <textarea
                  rows={5}
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2.5 text-sm outline-none resize-none mb-4"
                  style={{ borderColor: '#dbdadb' }}
                  onFocus={e => (e.currentTarget.style.borderColor = '#0D475C')}
                  onBlur={e => (e.currentTarget.style.borderColor = '#dbdadb')}
                />
                <div className="flex gap-3">
                  <button
                    onClick={() => setMessageOpen(false)}
                    className="flex-1 py-2.5 rounded border text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
                    style={{ borderColor: '#dbdadb' }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSend}
                    className="flex-1 py-2.5 rounded text-white text-sm font-bold transition-opacity hover:opacity-90"
                    style={{ backgroundColor: '#e75462' }}
                  >
                    Send message
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
