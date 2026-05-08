-- ============================================================
-- 001_initial_schema.sql
-- Gumtree UK clone — initial database schema
-- ============================================================

-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";


-- ============================================================
-- TABLES
-- ============================================================

-- 1. categories
CREATE TABLE categories (
  id         uuid    PRIMARY KEY DEFAULT uuid_generate_v4(),
  name       text    NOT NULL,
  slug       text    NOT NULL UNIQUE,
  icon       text    NOT NULL DEFAULT '',
  parent_id  uuid    REFERENCES categories(id) ON DELETE SET NULL,
  sort_order int     NOT NULL DEFAULT 0
);

-- 2. user_profiles (mirrors auth.users 1-to-1)
CREATE TABLE user_profiles (
  id               uuid         PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name             text         NOT NULL DEFAULT '',
  avatar_url       text,
  bio              text,
  location         text         NOT NULL DEFAULT '',
  phone            text,
  reply_rate       int          NOT NULL DEFAULT 0 CHECK (reply_rate BETWEEN 0 AND 100),
  avg_reply_hours  int          NOT NULL DEFAULT 0,
  created_at       timestamptz  NOT NULL DEFAULT now()
);

-- 3. listings
CREATE TABLE listings (
  id              uuid         PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         uuid         NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  category_id     uuid         NOT NULL REFERENCES categories(id),
  title           text         NOT NULL,
  description     text         NOT NULL DEFAULT '',
  price           numeric      CHECK (price >= 0),
  price_type      text         NOT NULL DEFAULT 'fixed'
                               CHECK (price_type IN ('fixed', 'negotiable', 'free')),
  condition       text         NOT NULL DEFAULT 'good'
                               CHECK (condition IN ('new', 'like_new', 'good', 'fair', 'parts_only')),
  images          text[]       NOT NULL DEFAULT '{}',
  location        text         NOT NULL DEFAULT '',
  latitude        float,
  longitude       float,
  status          text         NOT NULL DEFAULT 'active'
                               CHECK (status IN ('active', 'sold', 'expired', 'draft')),
  offers_shipping boolean      NOT NULL DEFAULT false,
  is_urgent       boolean      NOT NULL DEFAULT false,
  views_count     int          NOT NULL DEFAULT 0,
  created_at      timestamptz  NOT NULL DEFAULT now(),
  expires_at      timestamptz  NOT NULL DEFAULT now() + interval '60 days'
);

-- 4. watchlist
CREATE TABLE watchlist (
  id          uuid         PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     uuid         NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  listing_id  uuid         NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  created_at  timestamptz  NOT NULL DEFAULT now(),
  UNIQUE (user_id, listing_id)
);

-- 5. conversations
CREATE TABLE conversations (
  id          uuid         PRIMARY KEY DEFAULT uuid_generate_v4(),
  listing_id  uuid         NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  buyer_id    uuid         NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  seller_id   uuid         NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  created_at  timestamptz  NOT NULL DEFAULT now(),
  UNIQUE (listing_id, buyer_id)
);

-- 6. messages
CREATE TABLE messages (
  id               uuid         PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id  uuid         NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id        uuid         NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  content          text         NOT NULL,
  image_url        text,
  read_at          timestamptz,
  created_at       timestamptz  NOT NULL DEFAULT now()
);

-- 7. reviews
CREATE TABLE reviews (
  id            uuid         PRIMARY KEY DEFAULT uuid_generate_v4(),
  reviewer_id   uuid         NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  reviewee_id   uuid         NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  listing_id    uuid         NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  overall       int          NOT NULL CHECK (overall BETWEEN 1 AND 5),
  communication int          NOT NULL CHECK (communication BETWEEN 1 AND 5),
  reliability   int          NOT NULL CHECK (reliability BETWEEN 1 AND 5),
  as_described  int          NOT NULL CHECK (as_described BETWEEN 1 AND 5),
  comment       text,
  created_at    timestamptz  NOT NULL DEFAULT now(),
  UNIQUE (reviewer_id, listing_id)
);

-- 8. saved_searches
CREATE TABLE saved_searches (
  id            uuid         PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id       uuid         NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  query         text         NOT NULL DEFAULT '',
  filters       jsonb        NOT NULL DEFAULT '{}',
  email_alerts  boolean      NOT NULL DEFAULT true,
  created_at    timestamptz  NOT NULL DEFAULT now()
);


-- ============================================================
-- AUTO-CREATE USER PROFILE TRIGGER
-- ============================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_profiles (id, name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- ============================================================
-- INDEXES
-- ============================================================

CREATE INDEX idx_listings_status      ON listings(status);
CREATE INDEX idx_listings_category_id ON listings(category_id);
CREATE INDEX idx_listings_user_id     ON listings(user_id);
CREATE INDEX idx_listings_created_at  ON listings(created_at DESC);
CREATE INDEX idx_listings_price       ON listings(price);
CREATE INDEX idx_listings_location    ON listings(location);

-- Full-text search: title + description
CREATE INDEX idx_listings_fts ON listings USING gin(
  to_tsvector('english', coalesce(title, '') || ' ' || coalesce(description, ''))
);

-- Supporting indexes
CREATE INDEX idx_watchlist_user_id        ON watchlist(user_id);
CREATE INDEX idx_conversations_buyer_id   ON conversations(buyer_id);
CREATE INDEX idx_conversations_seller_id  ON conversations(seller_id);
CREATE INDEX idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX idx_reviews_reviewee_id      ON reviews(reviewee_id);
CREATE INDEX idx_saved_searches_user_id   ON saved_searches(user_id);


-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE categories      ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles   ENABLE ROW LEVEL SECURITY;
ALTER TABLE listings        ENABLE ROW LEVEL SECURITY;
ALTER TABLE watchlist       ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations   ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages        ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews         ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_searches  ENABLE ROW LEVEL SECURITY;

-- categories: public read only
CREATE POLICY "categories_select_public"
  ON categories FOR SELECT TO public USING (true);

-- user_profiles: public read, owner write
CREATE POLICY "profiles_select_public"
  ON user_profiles FOR SELECT TO public USING (true);

CREATE POLICY "profiles_insert_own"
  ON user_profiles FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles_update_own"
  ON user_profiles FOR UPDATE TO authenticated
  USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- listings: active = public; draft/sold/expired = owner only
CREATE POLICY "listings_select_public"
  ON listings FOR SELECT TO public
  USING (status = 'active' OR auth.uid() = user_id);

CREATE POLICY "listings_insert_own"
  ON listings FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "listings_update_own"
  ON listings FOR UPDATE TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "listings_delete_own"
  ON listings FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- watchlist: owner only
CREATE POLICY "watchlist_select_own"
  ON watchlist FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "watchlist_insert_own"
  ON watchlist FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "watchlist_delete_own"
  ON watchlist FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- conversations: buyer or seller only
CREATE POLICY "conversations_select_participant"
  ON conversations FOR SELECT TO authenticated
  USING (auth.uid() = buyer_id OR auth.uid() = seller_id);

CREATE POLICY "conversations_insert_buyer"
  ON conversations FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = buyer_id);

-- messages: conversation participants only
CREATE POLICY "messages_select_participant"
  ON messages FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM conversations c
      WHERE c.id = conversation_id
        AND (c.buyer_id = auth.uid() OR c.seller_id = auth.uid())
    )
  );

CREATE POLICY "messages_insert_participant"
  ON messages FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = sender_id AND
    EXISTS (
      SELECT 1 FROM conversations c
      WHERE c.id = conversation_id
        AND (c.buyer_id = auth.uid() OR c.seller_id = auth.uid())
    )
  );

CREATE POLICY "messages_update_participant"
  ON messages FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM conversations c
      WHERE c.id = conversation_id
        AND (c.buyer_id = auth.uid() OR c.seller_id = auth.uid())
    )
  );

-- reviews: public read, authenticated insert once per listing
CREATE POLICY "reviews_select_public"
  ON reviews FOR SELECT TO public USING (true);

CREATE POLICY "reviews_insert_authenticated"
  ON reviews FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = reviewer_id);

-- saved_searches: owner only (all operations)
CREATE POLICY "saved_searches_all_own"
  ON saved_searches FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);


-- ============================================================
-- STORAGE BUCKET: ad-images
-- ============================================================

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'ad-images',
  'ad-images',
  true,
  5242880,  -- 5 MB
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO NOTHING;

-- View: anyone
CREATE POLICY "ad_images_select_public"
  ON storage.objects FOR SELECT TO public
  USING (bucket_id = 'ad-images');

-- Upload: authenticated, own folder (ad-images/{user_id}/filename)
CREATE POLICY "ad_images_insert_own"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'ad-images' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Update: own files only
CREATE POLICY "ad_images_update_own"
  ON storage.objects FOR UPDATE TO authenticated
  USING (
    bucket_id = 'ad-images' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Delete: own files only
CREATE POLICY "ad_images_delete_own"
  ON storage.objects FOR DELETE TO authenticated
  USING (
    bucket_id = 'ad-images' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );


-- ============================================================
-- SEED: UK categories
-- ============================================================

INSERT INTO categories (name, slug, icon, sort_order) VALUES
  ('Cars & Vehicles',       'cars-vehicles',       '🚗', 1),
  ('Property',              'property',            '🏠', 2),
  ('Jobs',                  'jobs',                '💼', 3),
  ('Electronics',           'electronics',         '📱', 4),
  ('Home & Garden',         'home-garden',         '🌿', 5),
  ('Pets',                  'pets',                '🐾', 6),
  ('Fashion',               'fashion',             '👗', 7),
  ('Sport & Leisure',       'sport-leisure',       '⚽', 8),
  ('Kids & Baby',           'kids-baby',           '🧸', 9),
  ('Community',             'community',           '🤝', 10),
  ('Services',              'services',            '🔧', 11),
  ('Business & Industrial', 'business-industrial', '🏭', 12),
  ('Other',                 'other',               '📦', 13);
