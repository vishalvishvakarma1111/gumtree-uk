'use client'

import { useEffect, useRef, useState } from 'react'
import { Send, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import type { Message } from '@/types'

interface ChatThreadProps {
  conversationId: string
  currentUserId: string
  initialMessages: Message[]
}

export default function ChatThread({ conversationId, currentUserId, initialMessages }: ChatThreadProps) {
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [draft, setDraft] = useState('')
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    const supabase = createClient()
    const channel = supabase
      .channel(`messages:${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`,
        },
        payload => {
          const incoming = payload.new as Message
          setMessages(prev => {
            if (prev.some(m => m.id === incoming.id)) return prev
            return [...prev, incoming]
          })
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [conversationId])

  async function handleSend(e: React.FormEvent) {
    e.preventDefault()
    if (!draft.trim() || sending) return
    setSending(true)
    setError('')
    const content = draft
    setDraft('')
    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ conversation_id: conversationId, content }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to send')
      if (data.message) {
        setMessages(prev => {
          if (prev.some(m => m.id === data.message.id)) return prev
          return [...prev, data.message]
        })
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to send')
      setDraft(content)
    } finally {
      setSending(false)
    }
  }

  return (
    <>
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-6 space-y-3">
        {messages.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-sm text-gray-400">Start the conversation</p>
          </div>
        ) : (
          messages.map(m => {
            const mine = m.sender_id === currentUserId
            return (
              <div key={m.id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                <div
                  className="max-w-[75%] px-4 py-2 rounded-2xl text-sm"
                  style={
                    mine
                      ? { backgroundColor: '#0D475C', color: '#fff', borderBottomRightRadius: 4 }
                      : { backgroundColor: '#fff', color: '#1f2937', borderBottomLeftRadius: 4, border: '1px solid #dbdadb' }
                  }
                >
                  <p className="whitespace-pre-wrap break-words">{m.content}</p>
                  <p
                    className="text-[10px] mt-1 opacity-70"
                    style={{ color: mine ? 'rgba(255,255,255,0.8)' : '#9ca3af' }}
                  >
                    {new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            )
          })
        )}
      </div>

      <form
        onSubmit={handleSend}
        className="bg-white border-t p-3 flex items-end gap-2"
        style={{ borderColor: '#dbdadb' }}
      >
        <textarea
          value={draft}
          onChange={e => setDraft(e.target.value)}
          onKeyDown={e => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault()
              handleSend(e)
            }
          }}
          placeholder="Type a message…"
          rows={1}
          className="flex-1 border rounded-2xl px-4 py-2.5 text-sm outline-none resize-none max-h-32"
          style={{ borderColor: '#dbdadb' }}
        />
        <button
          type="submit"
          disabled={sending || !draft.trim()}
          className="w-10 h-10 rounded-full flex items-center justify-center text-white transition-opacity hover:opacity-90 disabled:opacity-40 flex-shrink-0"
          style={{ backgroundColor: '#e75462' }}
        >
          {sending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
        </button>
      </form>
      {error && <p className="text-xs text-red-500 px-4 pb-2">{error}</p>}
    </>
  )
}
