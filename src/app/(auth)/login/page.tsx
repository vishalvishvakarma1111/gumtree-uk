'use client'

import { useState, Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Eye, EyeOff } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const next = searchParams.get('next') || '/'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (!email || !password) {
      setError('Please fill in all fields.')
      return
    }
    setLoading(true)
    try {
      const supabase = createClient()
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      if (authError) {
        setError(authError.message)
        return
      }

      let destination = next
      const userId = authData.user?.id
      if (userId) {
        const { data: profile } = await supabase
          .from('user_profiles')
          .select('is_admin')
          .eq('id', userId)
          .maybeSingle<{ is_admin: boolean }>()
        if (profile?.is_admin === true) destination = '/admin'
      }

      router.push(destination)
      router.refresh()
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full max-w-sm">
      <div className="bg-white rounded-xl border p-8 shadow-sm" style={{ borderColor: '#dbdadb' }}>
        <div className="text-center mb-7">
          <div
            className="inline-flex items-center justify-center w-10 h-10 rounded-full text-white font-extrabold text-xl mb-3"
            style={{ backgroundColor: '#e75462' }}
          >
            G
          </div>
          <h1 className="text-xl font-extrabold" style={{ color: '#0D475C' }}>
            Log in to Gumtree
          </h1>
          <p className="text-xs text-gray-400 mt-1">Welcome back!</p>
        </div>

        {/* Social login (UI only) */}
        <div className="space-y-2.5 mb-5">
          <button
            type="button"
            className="w-full flex items-center justify-center gap-3 border py-2.5 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            style={{ borderColor: '#dbdadb' }}
          >
            <span className="font-bold text-base" style={{ color: '#4285F4' }}>G</span>
            Continue with Google
          </button>
          <button
            type="button"
            className="w-full flex items-center justify-center gap-3 border py-2.5 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            style={{ borderColor: '#dbdadb' }}
          >
            <span className="font-bold text-base" style={{ color: '#1877F2' }}>f</span>
            Continue with Facebook
          </button>
        </div>

        <div className="flex items-center gap-3 mb-5">
          <div className="flex-1 h-px" style={{ backgroundColor: '#e8e8e8' }} />
          <span className="text-xs text-gray-400">or sign in with email</span>
          <div className="flex-1 h-px" style={{ backgroundColor: '#e8e8e8' }} />
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
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-gray-700">Password</label>
              <Link href="/forgot-password" className="text-xs hover:underline" style={{ color: '#0D475C' }}>
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <input
                type={showPw ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full border rounded-lg px-3 py-2.5 pr-10 text-sm outline-none"
                style={{ borderColor: '#dbdadb' }}
                onFocus={e => (e.currentTarget.style.borderColor = '#0D475C')}
                onBlur={e => (e.currentTarget.style.borderColor = '#dbdadb')}
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPw(s => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-lg text-white text-sm font-bold transition-opacity hover:opacity-90 disabled:opacity-60"
            style={{ backgroundColor: '#e75462' }}
          >
            {loading ? 'Signing in…' : 'Log in'}
          </button>
        </form>

        <p className="text-center text-xs text-gray-400 mt-5">
          Don&apos;t have an account?{' '}
          <Link
            href={`/register${next !== '/' ? `?next=${encodeURIComponent(next)}` : ''}`}
            className="font-semibold hover:underline"
            style={{ color: '#0D475C' }}
          >
            Register for free
          </Link>
        </p>
      </div>

      <p className="text-center text-xs text-gray-400 mt-4 px-4">
        By logging in you agree to our{' '}
        <Link href="#" className="underline">Terms of Use</Link>
        {' '}and{' '}
        <Link href="#" className="underline">Privacy Policy</Link>.
      </p>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="w-full max-w-sm h-96 bg-white rounded-xl animate-pulse" />}>
      <LoginForm />
    </Suspense>
  )
}
