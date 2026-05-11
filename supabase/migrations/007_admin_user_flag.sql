-- ============================================================
-- 007_admin_user_flag.sql
-- Replace ADMIN_EMAIL env var with a per-user `is_admin` flag on
-- user_profiles. Admin role now stored in the database.
--
-- Promotion is intentionally DB-only — there is no admin UI to grant
-- admin to other users. Promote via the SQL snippet at the bottom of
-- this file (run as a Supabase project owner / service-role).
-- ============================================================

-- 1. Column
ALTER TABLE user_profiles
  ADD COLUMN IF NOT EXISTS is_admin boolean NOT NULL DEFAULT false;

-- 2. Block self-promotion.
--    The existing `profiles_update_own` RLS policy lets a user update
--    their own row. Without this column-level grant they could call
--    `update({ is_admin: true })` and elevate themselves. Postgres
--    column grants are checked on top of RLS, so revoking UPDATE on
--    this single column locks it down without disturbing other
--    profile edits. Service role bypasses both.
REVOKE UPDATE (is_admin) ON user_profiles FROM authenticated, anon;

-- 3. Optional: surface admin status efficiently. Lookups are by `id`
--    (PK) so no extra index needed.

-- 4. Bootstrap. Uncomment and replace the email when applying:
--
-- UPDATE user_profiles
--   SET is_admin = true
--   WHERE id = (
--     SELECT id FROM auth.users
--     WHERE lower(email) = lower('you@example.com')
--   );
