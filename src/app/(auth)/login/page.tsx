'use client'

import { useState, useEffect, Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Eye, EyeOff } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const next = searchParams.get('next') || '/'
  const callbackError = searchParams.get('error')

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [oauthLoading, setOauthLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) router.replace(next)
    })
  }, [next, router])

  async function handleGoogleSignIn() {
    setError('')
    setOauthLoading(true)
    try {
      const supabase = createClient()
      const { error: oauthError } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      })
      if (oauthError) setError(oauthError.message)
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setOauthLoading(false)
    }
  }

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
          <div className="inline-flex items-center justify-center mb-3">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="40" viewBox="27.74 5.25 19.52 24.298" aria-hidden="true">
              <path fill="#72EF36" d="M44.433 11.914a.707.707 0 0 1-.337-.606C43.76 7.942 40.933 5.25 37.5 5.25s-6.327 2.625-6.596 6.058a.806.806 0 0 1-.336.606c-1.683 1.211-2.827 3.164-2.827 5.384 0 3.029 2.087 5.654 4.914 6.395.471.135 1.01.202 1.144.067.337-.202.808-1.885.606-2.221-.135-.203-.539-.404-1.077-.539-1.683-.471-2.895-1.952-2.895-3.769 0-1.01.404-1.885 1.01-2.625a2.964 2.964 0 0 1 1.01-.808c.74-.404 1.144-1.144 1.144-1.952 0-.404.067-.808.202-1.211.539-1.548 1.952-2.692 3.702-2.692s3.164 1.144 3.702 2.692c.134.404.202.808.202 1.211 0 .808.403 1.548 1.144 1.952.404.202.673.471 1.01.808a3.967 3.967 0 0 1 1.01 2.625 3.907 3.907 0 0 1-3.903 3.904c-2.491 0-4.443 2.02-4.443 4.51v2.558c0 .471.067 1.009.202 1.144.27.27 2.02.27 2.288 0 .135-.135.203-.673.203-1.144v-2.625c0-.942.807-1.75 1.75-1.75 3.634 0 6.596-2.962 6.596-6.596-.002-2.155-1.147-4.107-2.829-5.318z"/>
            </svg>
          </div>
          <h1 className="text-xl font-extrabold" style={{ color: '#0D475C' }}>
            Log in to Gumtree
          </h1>
          <p className="text-xs text-gray-400 mt-1">Welcome back!</p>
        </div>

        <div className="space-y-2.5 mb-5">
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={oauthLoading}
            className="w-full flex items-center justify-center gap-3 border py-2.5 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-60"
            style={{ borderColor: '#dbdadb' }}
          >
            <span className="font-bold text-base" style={{ color: '#4285F4' }}>G</span>
            {oauthLoading ? 'Redirecting…' : 'Continue with Google'}
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

        {(error || callbackError) && (
          <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700">
            {error || callbackError}
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
