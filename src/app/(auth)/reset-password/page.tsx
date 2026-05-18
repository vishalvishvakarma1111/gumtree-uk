'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, Check } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

const PASSWORD_RULES = [
  { label: 'At least 8 characters', test: (p: string) => p.length >= 8 },
  { label: 'At least one number', test: (p: string) => /\d/.test(p) },
]

export default function ResetPasswordPage() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [sessionChecked, setSessionChecked] = useState(false)
  const [hasSession, setHasSession] = useState(false)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getSession().then(({ data: { session } }) => {
      setHasSession(!!session)
      setSessionChecked(true)
    })
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (!password || !confirm) {
      setError('Please fill in both fields.')
      return
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }
    if (password !== confirm) {
      setError('Passwords do not match.')
      return
    }
    setLoading(true)
    try {
      const supabase = createClient()
      const { error: updateError } = await supabase.auth.updateUser({ password })
      if (updateError) {
        setError(updateError.message)
        return
      }
      setSuccess(true)
      setTimeout(() => {
        router.push('/')
        router.refresh()
      }, 2000)
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (!sessionChecked) {
    return <div className="w-full max-w-sm h-96 bg-white rounded-xl animate-pulse" />
  }

  if (!hasSession) {
    return (
      <div className="w-full max-w-sm">
        <div className="bg-white rounded-xl border p-10 shadow-sm text-center" style={{ borderColor: '#dbdadb' }}>
          <h2 className="text-lg font-extrabold mb-2" style={{ color: '#0D475C' }}>Invalid or expired link</h2>
          <p className="text-sm text-gray-500">
            This password reset link is invalid or has expired. Request a new one to continue.
          </p>
          <Link
            href="/forgot-password"
            className="inline-block mt-6 text-xs font-semibold hover:underline"
            style={{ color: '#0D475C' }}
          >
            Request new link
          </Link>
        </div>
      </div>
    )
  }

  if (success) {
    return (
      <div className="w-full max-w-sm">
        <div className="bg-white rounded-xl border p-10 shadow-sm text-center" style={{ borderColor: '#dbdadb' }}>
          <p className="text-5xl mb-4">✅</p>
          <h2 className="text-lg font-extrabold mb-2" style={{ color: '#0D475C' }}>Password updated</h2>
          <p className="text-sm text-gray-500">You&apos;re now signed in. Redirecting…</p>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full max-w-sm">
      <div className="bg-white rounded-xl border p-8 shadow-sm" style={{ borderColor: '#dbdadb' }}>
        <div className="text-center mb-7">
          <h1 className="text-xl font-extrabold" style={{ color: '#0D475C' }}>
            Set a new password
          </h1>
          <p className="text-xs text-gray-400 mt-1">Choose a strong password you haven&apos;t used before.</p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">New password</label>
            <div className="relative">
              <input
                type={showPw ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Create a password"
                className="w-full border rounded-lg px-3 py-2.5 pr-10 text-sm outline-none"
                style={{ borderColor: '#dbdadb' }}
                onFocus={e => (e.currentTarget.style.borderColor = '#0D475C')}
                onBlur={e => (e.currentTarget.style.borderColor = '#dbdadb')}
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowPw(s => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {password.length > 0 && (
              <ul className="mt-2 space-y-1">
                {PASSWORD_RULES.map(r => (
                  <li key={r.label} className="flex items-center gap-1.5 text-xs">
                    <Check size={11} className={r.test(password) ? 'text-green-500' : 'text-gray-300'} />
                    <span className={r.test(password) ? 'text-green-600' : 'text-gray-400'}>
                      {r.label}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">Confirm password</label>
            <input
              type={showPw ? 'text' : 'password'}
              value={confirm}
              onChange={e => setConfirm(e.target.value)}
              placeholder="Repeat password"
              className="w-full border rounded-lg px-3 py-2.5 text-sm outline-none"
              style={{ borderColor: '#dbdadb' }}
              onFocus={e => (e.currentTarget.style.borderColor = '#0D475C')}
              onBlur={e => (e.currentTarget.style.borderColor = '#dbdadb')}
              autoComplete="new-password"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-lg text-white text-sm font-bold transition-opacity hover:opacity-90 disabled:opacity-60"
            style={{ backgroundColor: '#e75462' }}
          >
            {loading ? 'Updating…' : 'Update password'}
          </button>
        </form>
      </div>
    </div>
  )
}
