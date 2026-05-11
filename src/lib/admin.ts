import type { SupabaseClient } from '@supabase/supabase-js'

/**
 * Admin authorisation. Reads the `is_admin` flag from `user_profiles`.
 *
 * Promotion is DB-only (see migration 007). There is no application
 * code path that toggles `is_admin` — the column has UPDATE revoked
 * from the `authenticated` and `anon` roles, so even a user updating
 * their own profile row cannot self-elevate.
 *
 * Server-side only. Never trust client-supplied "isAdmin" claims.
 */
export async function isAdminUser(
  supabase: SupabaseClient,
  userId: string | null | undefined,
): Promise<boolean> {
  if (!userId) return false
  const { data, error } = await supabase
    .from('user_profiles')
    .select('is_admin')
    .eq('id', userId)
    .maybeSingle<{ is_admin: boolean }>()
  if (error || !data) return false
  return data.is_admin === true
}
