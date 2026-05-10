'use client'

import { useEffect, useRef, useState } from 'react'
import { Send, Loader2, ShieldAlert } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import type { Message } from '@/types'

type RiskLevel = 'low' | 'medium' | 'high'
interface SafetyResult { risk: RiskLevel; reasons: string[]; advice: string }

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
  const [safety, setSafety] = useState<Record<string, SafetyResult>>({})
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const toCheck = messages.filter(
      m => m.sender_id !== currentUserId && !(m.id in safety) && m.content?.trim().length > 0
    )
    if (toCheck.length === 0) return
    let cancelled = false
    ;(async () => {
      for (const m of toCheck) {
        try {
          const res = await fetch('/api/ai/check-message', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ content: m.content }),
          })
          if (!res.ok) continue
          const data = (await res.json()) as SafetyResult
          if (cancelled) return
          setSafety(s => ({ ...s, [m.id]: data }))
        } catch {
          // ignore
        }
      }
    })()
    return () => { cancelled = true }
  }, [messages, currentUserId, safety])

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
            const risk = safety[m.id]
            const flagged = risk && risk.risk !== 'low'
            return (
              <div key={m.id} className={`flex flex-col ${mine ? 'items-end' : 'items-start'}`}>
                <div
                  className="max-w-[75%] px-4 py-2 rounded-2xl text-sm"
                  style={
                    mine
                      ? { backgroundColor: '#0D475C', color: '#fff', borderBottomRightRadius: 4 }
                      : flagged
                      ? { backgroundColor: '#fff7ed', color: '#1f2937', borderBottomLeftRadius: 4, border: '1px solid #fed7aa' }
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
                {flagged && (
                  <div
                    className="max-w-[75%] mt-1 px-3 py-1.5 rounded-lg text-[11px] flex items-start gap-1.5"
                    style={{
                      backgroundColor: risk!.risk === 'high' ? '#fef2f2' : '#fffbeb',
                      color: risk!.risk === 'high' ? '#b91c1c' : '#a16207',
                      border: `1px solid ${risk!.risk === 'high' ? '#fecaca' : '#fde68a'}`,
                    }}
                  >
                    <ShieldAlert size={12} className="flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold uppercase">AI safety warning · {risk!.risk}</p>
                      {risk!.reasons.length > 0 && <p>{risk!.reasons.join(' · ')}</p>}
                      {risk!.advice && <p className="italic mt-0.5">{risk!.advice}</p>}
                    </div>
                  </div>
                )}
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
