'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [sent, setSent] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (!email) {
      setError('Please enter your email.')
      return
    }
    setLoading(true)
    try {
      const supabase = createClient()
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/callback?next=/reset-password`,
      })
      if (resetError) {
        setError(resetError.message)
        return
      }
      setSent(true)
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (sent) {
    return (
      <div className="w-full max-w-sm">
        <div className="bg-white rounded-xl border p-10 shadow-sm text-center" style={{ borderColor: '#dbdadb' }}>
          <p className="text-5xl mb-4">✉️</p>
          <h2 className="text-lg font-extrabold mb-2" style={{ color: '#0D475C' }}>Check your email</h2>
          <p className="text-sm text-gray-500">
            If an account exists for <strong>{email}</strong>, we&apos;ve sent a password reset link.
          </p>
          <Link
            href="/login"
            className="inline-block mt-6 text-xs font-semibold hover:underline"
            style={{ color: '#0D475C' }}
          >
            Back to log in
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full max-w-sm">
      <div className="bg-white rounded-xl border p-8 shadow-sm" style={{ borderColor: '#dbdadb' }}>
        <div className="text-center mb-7">
          <h1 className="text-xl font-extrabold" style={{ color: '#0D475C' }}>
            Forgot your password?
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            Enter your email and we&apos;ll send you a reset link.
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">
              Email address
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full border rounded-lg px-3 py-2.5 text-sm outline-none"
              style={{ borderColor: '#dbdadb' }}
              onFocus={e => (e.currentTarget.style.borderColor = '#0D475C')}
              onBlur={e => (e.currentTarget.style.borderColor = '#dbdadb')}
              autoComplete="email"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-lg text-white text-sm font-bold transition-opacity hover:opacity-90 disabled:opacity-60"
            style={{ backgroundColor: '#e75462' }}
          >
            {loading ? 'Sending…' : 'Send reset link'}
          </button>
        </form>

        <p className="text-center text-xs text-gray-400 mt-5">
          Remembered your password?{' '}
          <Link href="/login" className="font-semibold hover:underline" style={{ color: '#0D475C' }}>
            Log in
          </Link>
        </p>
      </div>
    </div>
  )
}
