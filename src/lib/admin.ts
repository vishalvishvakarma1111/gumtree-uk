import type { User } from '@supabase/supabase-js'

/**
 * Admin authorisation. The single hard-coded admin is identified by
 * the ADMIN_EMAIL environment variable. The check uses `auth.users.email`
 * which is signed into the Supabase JWT — no extra DB read required.
 *
 * Use server-side only. Never trust client-supplied "isAdmin" claims.
 */
export function isAdminUser(user: User | null | undefined): boolean {
  if (!user || !user.email) return false
  const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase()
  if (!adminEmail) return false
  return user.email.trim().toLowerCase() === adminEmail
}
