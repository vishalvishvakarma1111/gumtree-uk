import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { isAdminUser } from '@/lib/admin'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  const path = request.nextUrl.pathname
  const isAdminRoute = path.startsWith('/admin') || path.startsWith('/api/admin')

  if (isAdminRoute) {
    if (!user) {
      if (path.startsWith('/api/')) {
        return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
      }
      const redirect = request.nextUrl.clone()
      redirect.pathname = '/login'
      redirect.searchParams.set('next', path)
      return NextResponse.redirect(redirect)
    }
    if (!isAdminUser(user)) {
      if (path.startsWith('/api/')) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
      }
      const redirect = request.nextUrl.clone()
      redirect.pathname = '/'
      return NextResponse.redirect(redirect)
    }
  }

  return supabaseResponse
}
