'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Eye, EyeOff, Check } from 'lucide-react'

const PASSWORD_RULES = [
  { label: 'At least 8 characters', test: (p: string) => p.length >= 8 },
  { label: 'At least one number', test: (p: string) => /\d/.test(p) },
]

export default function RegisterPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (!name || !email || !password) {
      setError('Please fill in all fields.')
      return
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }
    setLoading(true)
    // Stub: connect to Supabase Auth in production
    await new Promise(r => setTimeout(r, 1200))
    setLoading(false)
    setError('Account creation disabled in demo mode — connect Supabase to enable.')
  }

  return (
    <div className="w-full max-w-sm">
      <div className="bg-white rounded-xl border p-8 shadow-sm" style={{ borderColor: '#dbdadb' }}>
        {/* Logo */}
        <div className="text-center mb-7">
          <div
            className="inline-flex items-center justify-center w-10 h-10 rounded-full text-white font-extrabold text-xl mb-3"
            style={{ backgroundColor: '#e75462' }}
          >
            G
          </div>
          <h1 className="text-xl font-extrabold" style={{ color: '#0D475C' }}>
            Create your account
          </h1>
          <p className="text-xs text-gray-400 mt-1">Free to join — post your first ad today.</p>
        </div>

        {/* Social register */}
        <div className="space-y-2.5 mb-5">
          <button className="w-full flex items-center justify-center gap-3 border py-2.5 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors" style={{ borderColor: '#dbdadb' }}>
            <span className="text-lg">G</span>
            Continue with Google
          </button>
          <button className="w-full flex items-center justify-center gap-3 border py-2.5 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors" style={{ borderColor: '#dbdadb' }}>
            <span className="text-lg">f</span>
            Continue with Facebook
          </button>
        </div>

        {/* Divider */}
        <div className="flex items-center gap-3 mb-5">
          <div className="flex-1 h-px" style={{ backgroundColor: '#e8e8e8' }} />
          <span className="text-xs text-gray-400">or register with email</span>
          <div className="flex-1 h-px" style={{ backgroundColor: '#e8e8e8' }} />
        </div>

        {/* Error */}
        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">Full name</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Your name"
              className="w-full border rounded-lg px-3 py-2.5 text-sm outline-none"
              style={{ borderColor: '#dbdadb' }}
              onFocus={e => (e.currentTarget.style.borderColor = '#0D475C')}
              onBlur={e => (e.currentTarget.style.borderColor = '#dbdadb')}
              autoComplete="name"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">Email address</label>
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
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">Password</label>
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
                    <Check
                      size={11}
                      className={r.test(password) ? 'text-green-500' : 'text-gray-300'}
                    />
                    <span className={r.test(password) ? 'text-green-600' : 'text-gray-400'}>
                      {r.label}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-lg text-white text-sm font-bold transition-opacity hover:opacity-90 disabled:opacity-60"
            style={{ backgroundColor: '#e75462' }}
          >
            {loading ? 'Creating account…' : 'Create free account'}
          </button>
        </form>

        <p className="text-center text-xs text-gray-400 mt-5">
          Already have an account?{' '}
          <Link href="/login" className="font-semibold hover:underline" style={{ color: '#0D475C' }}>
            Log in
          </Link>
        </p>
      </div>

      <p className="text-center text-xs text-gray-400 mt-4 px-4">
        By registering you agree to our{' '}
        <Link href="#" className="underline">Terms of Use</Link>
        {' '}and{' '}
        <Link href="#" className="underline">Privacy Policy</Link>.
      </p>
    </div>
  )
}
