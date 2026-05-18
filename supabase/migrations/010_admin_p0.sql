-- ============================================================
-- 010_admin_p0.sql
-- P0 admin features:
--   1. audit_log         — record of admin actions
--   2. banned_words      — moderation word list
--   3. user_profiles.banned_until / banned_reason
--      Allow admins to manage categories (RLS write policy).
-- ============================================================

-- 1. audit_log -----------------------------------------------
CREATE TABLE IF NOT EXISTS audit_log (
  id            uuid         PRIMARY KEY DEFAULT uuid_generate_v4(),
  actor_id      uuid         REFERENCES user_profiles(id) ON DELETE SET NULL,
  action        text         NOT NULL,
  entity_type   text         NOT NULL,
  entity_id     text,
  meta          jsonb        NOT NULL DEFAULT '{}',
  created_at    timestamptz  NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_audit_log_created_at ON audit_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_log_actor_id   ON audit_log(actor_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_entity     ON audit_log(entity_type, entity_id);

ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;
-- Writes only via service role; no policies needed for that path.
-- No public/auth read policy: audit data is admin-only via API.

-- 2. banned_words --------------------------------------------
CREATE TABLE IF NOT EXISTS banned_words (
  id          uuid         PRIMARY KEY DEFAULT uuid_generate_v4(),
  word        text         NOT NULL UNIQUE,
  severity    text         NOT NULL DEFAULT 'block'
                          CHECK (severity IN ('block', 'flag')),
  created_by  uuid         REFERENCES user_profiles(id) ON DELETE SET NULL,
  created_at  timestamptz  NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_banned_words_word ON banned_words(lower(word));

ALTER TABLE banned_words ENABLE ROW LEVEL SECURITY;
-- All access via service-role admin routes; no policies.

-- 3. user_profiles: ban fields -------------------------------
ALTER TABLE user_profiles
  ADD COLUMN IF NOT EXISTS banned_until  timestamptz,
  ADD COLUMN IF NOT EXISTS banned_reason text;

-- Lock down so users can't self-modify their ban state.
REVOKE UPDATE (banned_until, banned_reason) ON user_profiles FROM authenticated, anon;

CREATE INDEX IF NOT EXISTS idx_user_profiles_banned_until ON user_profiles(banned_until)
  WHERE banned_until IS NOT NULL;

-- 4. categories: extra columns + admin writes ---------------
ALTER TABLE categories
  ADD COLUMN IF NOT EXISTS created_at  timestamptz NOT NULL DEFAULT now(),
  ADD COLUMN IF NOT EXISTS updated_at  timestamptz NOT NULL DEFAULT now();

-- categories writes are performed via service-role client in /api/admin/categories.
-- No new RLS policies needed (service role bypasses RLS).
