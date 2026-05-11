-- Listing expiry lifecycle.
-- Listings auto-expire 30 days after creation. Users can "renew" an
-- expired listing, which resets expires_at and flips status back to active.
-- A Vercel Cron (see vercel.json) calls /api/cron/expire-listings daily
-- to flip ripe rows from active → expired.

ALTER TABLE listings
  ADD COLUMN IF NOT EXISTS expires_at timestamptz;

-- Backfill: existing active listings get 30 days from now.
UPDATE listings
  SET expires_at = now() + interval '30 days'
  WHERE expires_at IS NULL
    AND status = 'active';

-- Default for new rows: 30 days after creation. (Note: Postgres allows
-- a non-immutable default via a function, but `now()` works since the
-- value is captured at insert time.)
ALTER TABLE listings
  ALTER COLUMN expires_at SET DEFAULT (now() + interval '30 days');

CREATE INDEX IF NOT EXISTS idx_listings_expires_at
  ON listings(expires_at)
  WHERE status = 'active';
