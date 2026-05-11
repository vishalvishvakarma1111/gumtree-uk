-- Email notification preference. Default ON. Read by API routes when
-- deciding whether to send transactional emails (new message, report
-- outcome, listing moderation).

ALTER TABLE user_profiles
  ADD COLUMN IF NOT EXISTS email_notifications boolean NOT NULL DEFAULT true;
