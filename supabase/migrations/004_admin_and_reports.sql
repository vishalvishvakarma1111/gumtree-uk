-- Admin moderation: pending/rejected listing states + reports table.
-- Admin role is enforced application-side via the ADMIN_EMAIL env var.
-- Admin write operations bypass RLS by using the service-role Supabase
-- client in /api/admin/* route handlers.

-- 1. Listings: add pending + rejected statuses, default new ads to pending
ALTER TABLE listings DROP CONSTRAINT IF EXISTS listings_status_check;
ALTER TABLE listings
  ADD CONSTRAINT listings_status_check
  CHECK (status IN ('active', 'sold', 'expired', 'draft', 'pending', 'rejected'));

ALTER TABLE listings ALTER COLUMN status SET DEFAULT 'pending';
ALTER TABLE listings ADD COLUMN IF NOT EXISTS rejection_reason text;

-- 2. Reports table
CREATE TABLE IF NOT EXISTS reports (
  id           uuid         PRIMARY KEY DEFAULT uuid_generate_v4(),
  reporter_id  uuid         NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  listing_id   uuid         NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  reason       text         NOT NULL,
  status       text         NOT NULL DEFAULT 'open'
                           CHECK (status IN ('open', 'resolved', 'dismissed')),
  resolved_at  timestamptz,
  created_at   timestamptz  NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_reports_status      ON reports(status);
CREATE INDEX IF NOT EXISTS idx_reports_listing_id  ON reports(listing_id);
CREATE INDEX IF NOT EXISTS idx_reports_created_at  ON reports(created_at DESC);

ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

-- Authenticated users can file a report on any listing as long as the
-- reporter_id matches their own auth.uid().
DROP POLICY IF EXISTS "reports_insert_own" ON reports;
CREATE POLICY "reports_insert_own"
  ON reports FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = reporter_id);

-- Reporters can view their own reports (e.g. "report status").
DROP POLICY IF EXISTS "reports_select_own" ON reports;
CREATE POLICY "reports_select_own"
  ON reports FOR SELECT TO authenticated
  USING (auth.uid() = reporter_id);

-- Admin reads/updates go through the service-role client; no admin
-- policy needed here.
