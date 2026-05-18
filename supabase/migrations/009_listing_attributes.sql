-- Add JSONB attributes column for category-specific fields
ALTER TABLE listings
  ADD COLUMN IF NOT EXISTS attributes jsonb NOT NULL DEFAULT '{}';

-- GIN index for efficient jsonb containment queries
CREATE INDEX IF NOT EXISTS idx_listings_attributes
  ON listings USING GIN (attributes);
