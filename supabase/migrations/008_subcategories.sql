-- ============================================================
-- 008_subcategories.sql
-- Populate the `categories.parent_id` tree. The column has existed
-- since 001 but the seed only inserted the 13 top-level categories.
-- This migration adds ~5 subcategories under each parent so the
-- browse filter sidebar can show a hierarchical category picker.
--
-- Idempotent: ON CONFLICT on the unique `slug` constraint.
-- ============================================================

INSERT INTO categories (name, slug, icon, parent_id, sort_order) VALUES
  -- Cars & Vehicles
  ('Cars',                  'cars',                 '🚙', (SELECT id FROM categories WHERE slug = 'cars-vehicles'), 1),
  ('Motorbikes & Scooters', 'motorbikes',           '🏍️', (SELECT id FROM categories WHERE slug = 'cars-vehicles'), 2),
  ('Vans',                  'vans',                 '🚐', (SELECT id FROM categories WHERE slug = 'cars-vehicles'), 3),
  ('Campervans & Motorhomes','campervans',          '🚍', (SELECT id FROM categories WHERE slug = 'cars-vehicles'), 4),
  ('Parts & Accessories',   'parts-accessories',    '🔩', (SELECT id FROM categories WHERE slug = 'cars-vehicles'), 5),

  -- Property
  ('For Sale',              'property-for-sale',    '🏡', (SELECT id FROM categories WHERE slug = 'property'), 1),
  ('To Rent',               'property-to-rent',     '🔑', (SELECT id FROM categories WHERE slug = 'property'), 2),
  ('To Share',              'property-to-share',    '👥', (SELECT id FROM categories WHERE slug = 'property'), 3),
  ('Holiday Lets',          'holiday-lets',         '🏖️', (SELECT id FROM categories WHERE slug = 'property'), 4),
  ('Commercial',            'property-commercial',  '🏢', (SELECT id FROM categories WHERE slug = 'property'), 5),

  -- Jobs
  ('IT & Tech',             'jobs-it',              '💻', (SELECT id FROM categories WHERE slug = 'jobs'), 1),
  ('Retail',                'jobs-retail',          '🛍️', (SELECT id FROM categories WHERE slug = 'jobs'), 2),
  ('Hospitality & Catering','jobs-hospitality',     '🍽️', (SELECT id FROM categories WHERE slug = 'jobs'), 3),
  ('Driving & Delivery',    'jobs-driving',         '🚚', (SELECT id FROM categories WHERE slug = 'jobs'), 4),
  ('Healthcare',            'jobs-healthcare',      '🩺', (SELECT id FROM categories WHERE slug = 'jobs'), 5),
  ('Admin & Office',        'jobs-admin',           '📋', (SELECT id FROM categories WHERE slug = 'jobs'), 6),

  -- Electronics
  ('Phones',                'phones',               '📱', (SELECT id FROM categories WHERE slug = 'electronics'), 1),
  ('Computers & Laptops',   'computers',            '💻', (SELECT id FROM categories WHERE slug = 'electronics'), 2),
  ('TVs',                   'tvs',                  '📺', (SELECT id FROM categories WHERE slug = 'electronics'), 3),
  ('Cameras',               'cameras',              '📷', (SELECT id FROM categories WHERE slug = 'electronics'), 4),
  ('Audio & Stereo',        'audio',                '🎧', (SELECT id FROM categories WHERE slug = 'electronics'), 5),
  ('Video Games',           'video-games',          '🎮', (SELECT id FROM categories WHERE slug = 'electronics'), 6),

  -- Home & Garden
  ('Furniture',             'furniture',            '🛋️', (SELECT id FROM categories WHERE slug = 'home-garden'), 1),
  ('Appliances',            'appliances',           '🧺', (SELECT id FROM categories WHERE slug = 'home-garden'), 2),
  ('DIY Tools',             'diy-tools',            '🔨', (SELECT id FROM categories WHERE slug = 'home-garden'), 3),
  ('Garden',                'garden',               '🌳', (SELECT id FROM categories WHERE slug = 'home-garden'), 4),
  ('Home Decor',            'home-decor',           '🖼️', (SELECT id FROM categories WHERE slug = 'home-garden'), 5),

  -- Pets
  ('Dogs',                  'dogs',                 '🐕', (SELECT id FROM categories WHERE slug = 'pets'), 1),
  ('Cats',                  'cats',                 '🐈', (SELECT id FROM categories WHERE slug = 'pets'), 2),
  ('Birds',                 'birds',                '🐦', (SELECT id FROM categories WHERE slug = 'pets'), 3),
  ('Fish & Aquatic',        'fish',                 '🐟', (SELECT id FROM categories WHERE slug = 'pets'), 4),
  ('Pet Equipment',         'pet-equipment',        '🦴', (SELECT id FROM categories WHERE slug = 'pets'), 5),

  -- Fashion
  ('Women''s',              'womens-fashion',       '👚', (SELECT id FROM categories WHERE slug = 'fashion'), 1),
  ('Men''s',                'mens-fashion',         '👔', (SELECT id FROM categories WHERE slug = 'fashion'), 2),
  ('Kids',                  'kids-fashion',         '👕', (SELECT id FROM categories WHERE slug = 'fashion'), 3),
  ('Shoes',                 'shoes',                '👟', (SELECT id FROM categories WHERE slug = 'fashion'), 4),
  ('Jewellery & Watches',   'jewellery-watches',    '⌚', (SELECT id FROM categories WHERE slug = 'fashion'), 5),

  -- Sport & Leisure
  ('Bikes',                 'bikes',                '🚲', (SELECT id FROM categories WHERE slug = 'sport-leisure'), 1),
  ('Fitness Equipment',     'fitness-equipment',    '🏋️', (SELECT id FROM categories WHERE slug = 'sport-leisure'), 2),
  ('Camping',               'camping',              '🏕️', (SELECT id FROM categories WHERE slug = 'sport-leisure'), 3),
  ('Sports Gear',           'sports-gear',          '⚾', (SELECT id FROM categories WHERE slug = 'sport-leisure'), 4),
  ('Tickets',               'tickets',              '🎟️', (SELECT id FROM categories WHERE slug = 'sport-leisure'), 5),

  -- Kids & Baby
  ('Baby Toys',             'baby-toys',            '🧸', (SELECT id FROM categories WHERE slug = 'kids-baby'), 1),
  ('Prams & Pushchairs',    'prams-pushchairs',     '🛒', (SELECT id FROM categories WHERE slug = 'kids-baby'), 2),
  ('Kids Clothes',          'kids-clothes',         '👶', (SELECT id FROM categories WHERE slug = 'kids-baby'), 3),
  ('Kids Equipment',        'kids-equipment',       '🍼', (SELECT id FROM categories WHERE slug = 'kids-baby'), 4),

  -- Community
  ('Events',                'events',               '🎉', (SELECT id FROM categories WHERE slug = 'community'), 1),
  ('Classes',               'classes',              '📚', (SELECT id FROM categories WHERE slug = 'community'), 2),
  ('Lost & Found',          'lost-found',           '🔍', (SELECT id FROM categories WHERE slug = 'community'), 3),
  ('Rideshare & Pooling',   'rideshare-pooling',    '🚙', (SELECT id FROM categories WHERE slug = 'community'), 4),

  -- Services
  ('Tradesmen',             'tradesmen',            '🔧', (SELECT id FROM categories WHERE slug = 'services'), 1),
  ('Tutors',                'tutors',               '🎓', (SELECT id FROM categories WHERE slug = 'services'), 2),
  ('Health & Beauty',       'health-beauty',        '💆', (SELECT id FROM categories WHERE slug = 'services'), 3),
  ('Transport',             'transport',            '🚛', (SELECT id FROM categories WHERE slug = 'services'), 4),
  ('Finance & Legal',       'finance-legal',        '💼', (SELECT id FROM categories WHERE slug = 'services'), 5),

  -- Business & Industrial
  ('Machinery',             'machinery',            '🏗️', (SELECT id FROM categories WHERE slug = 'business-industrial'), 1),
  ('Business Equipment',    'business-equipment',   '🖥️', (SELECT id FROM categories WHERE slug = 'business-industrial'), 2),
  ('Office Furniture',      'office-furniture',     '🪑', (SELECT id FROM categories WHERE slug = 'business-industrial'), 3),
  ('Supplies',              'business-supplies',    '📦', (SELECT id FROM categories WHERE slug = 'business-industrial'), 4)
ON CONFLICT (slug) DO NOTHING;

