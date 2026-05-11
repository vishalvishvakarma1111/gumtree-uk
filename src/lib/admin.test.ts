import { describe, it, expect, vi } from 'vitest'
import { isAdminUser } from './admin'
import type { SupabaseClient } from '@supabase/supabase-js'

type MaybeSingleResult = { data: { is_admin: boolean } | null; error: unknown }

function mockClient(result: MaybeSingleResult): SupabaseClient {
  const maybeSingle = vi.fn().mockResolvedValue(result)
  const eq = vi.fn().mockReturnValue({ maybeSingle })
  const select = vi.fn().mockReturnValue({ eq })
  const from = vi.fn().mockReturnValue({ select })
  return { from } as unknown as SupabaseClient
}

describe('isAdminUser', () => {
  it('returns false when userId is null or undefined', async () => {
    const supabase = mockClient({ data: null, error: null })
    expect(await isAdminUser(supabase, null)).toBe(false)
    expect(await isAdminUser(supabase, undefined)).toBe(false)
    // Short-circuits before hitting the DB
    expect(supabase.from).not.toHaveBeenCalled()
  })

  it('returns true when is_admin flag is true', async () => {
    const supabase = mockClient({ data: { is_admin: true }, error: null })
    expect(await isAdminUser(supabase, 'user-1')).toBe(true)
    expect(supabase.from).toHaveBeenCalledWith('user_profiles')
  })

  it('returns false when is_admin flag is false', async () => {
    const supabase = mockClient({ data: { is_admin: false }, error: null })
    expect(await isAdminUser(supabase, 'user-1')).toBe(false)
  })

  it('returns false when profile row is missing', async () => {
    const supabase = mockClient({ data: null, error: null })
    expect(await isAdminUser(supabase, 'user-1')).toBe(false)
  })

  it('returns false when the query errors', async () => {
    const supabase = mockClient({ data: null, error: { message: 'boom' } })
    expect(await isAdminUser(supabase, 'user-1')).toBe(false)
  })
})
