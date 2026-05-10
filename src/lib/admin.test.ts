import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { isAdminUser } from './admin'
import type { User } from '@supabase/supabase-js'

function user(email: string | undefined): User {
  return { id: 'u1', email, app_metadata: {}, user_metadata: {}, aud: 'authenticated', created_at: '' } as unknown as User
}

describe('isAdminUser', () => {
  const PRIOR = process.env.ADMIN_EMAIL

  beforeEach(() => {
    process.env.ADMIN_EMAIL = 'admin@example.com'
  })

  afterEach(() => {
    process.env.ADMIN_EMAIL = PRIOR
  })

  it('returns false for null user', () => {
    expect(isAdminUser(null)).toBe(false)
    expect(isAdminUser(undefined)).toBe(false)
  })

  it('returns false when user has no email', () => {
    expect(isAdminUser(user(undefined))).toBe(false)
  })

  it('returns true on exact email match', () => {
    expect(isAdminUser(user('admin@example.com'))).toBe(true)
  })

  it('case- and whitespace-insensitive match', () => {
    expect(isAdminUser(user('  ADMIN@Example.COM  '))).toBe(true)
  })

  it('returns false for non-admin email', () => {
    expect(isAdminUser(user('someone-else@example.com'))).toBe(false)
  })

  it('returns false when ADMIN_EMAIL env var unset', () => {
    delete process.env.ADMIN_EMAIL
    expect(isAdminUser(user('admin@example.com'))).toBe(false)
  })

  it('returns false when ADMIN_EMAIL is empty string', () => {
    process.env.ADMIN_EMAIL = '   '
    expect(isAdminUser(user('admin@example.com'))).toBe(false)
  })
})
