# Database & Supabase

## Table Reference

### `user_profiles`
| column | type | notes |
|--------|------|-------|
| id | uuid PK | references auth.users(id) |
| name | text | display name |
| avatar_url | text | nullable |
| bio | text | nullable |
| location | text | suburb/city |
| phone | text | nullable, shown only if user opts in |
| reply_rate | int | 0-100, computed |
| avg_reply_hours | int | computed |
| created_at | timestamptz | |

### `categories`
| column | type | notes |
|--------|------|-------|
| id | uuid PK | |
| name | text | e.g. "Electronics" |
| slug | text | e.g. "electronics" |
| icon | text | emoji or icon name |
| parent_id | uuid | nullable FK → categories(id) |

### `listings`
| column | type | notes |
|--------|------|-------|
| id | uuid PK | |
| user_id | uuid FK | → user_profiles(id) |
| category_id | uuid FK | → categories(id) |
| title | text | |
| description | text | |
| price | numeric | nullable (free items) |
| price_type | text | 'fixed' / 'negotiable' / 'free' |
| condition | text | 'new' / 'like_new' / 'good' / 'fair' / 'parts_only' |
| images | text[] | array of public URLs |
| location | text | suburb/city |
| latitude | float | nullable |
| longitude | float | nullable |
| status | text | 'active' / 'sold' / 'expired' / 'draft' |
| offers_shipping | boolean | default false |
| is_urgent | boolean | default false |
| views_count | int | default 0 |
| created_at | timestamptz | |
| expires_at | timestamptz | |

### `watchlist`
| column | type | notes |
|--------|------|-------|
| id | uuid PK | |
| user_id | uuid FK | |
| listing_id | uuid FK | |
| created_at | timestamptz | |
| UNIQUE (user_id, listing_id) | | |

### `conversations`
| column | type | notes |
|--------|------|-------|
| id | uuid PK | |
| listing_id | uuid FK | |
| buyer_id | uuid FK | |
| seller_id | uuid FK | |
| created_at | timestamptz | |
| UNIQUE (listing_id, buyer_id) | | |

### `messages`
| column | type | notes |
|--------|------|-------|
| id | uuid PK | |
| conversation_id | uuid FK | |
| sender_id | uuid FK | |
| content | text | |
| image_url | text | nullable |
| read_at | timestamptz | nullable |
| created_at | timestamptz | |

### `reviews`
| column | type | notes |
|--------|------|-------|
| id | uuid PK | |
| reviewer_id | uuid FK | |
| reviewee_id | uuid FK | |
| listing_id | uuid FK | |
| overall | int | 1-5 |
| communication | int | 1-5 |
| reliability | int | 1-5 |
| as_described | int | 1-5 |
| comment | text | nullable |
| created_at | timestamptz | |

### `saved_searches`
| column | type | notes |
|--------|------|-------|
| id | uuid PK | |
| user_id | uuid FK | |
| query | text | search keyword |
| filters | jsonb | category, price range, location |
| email_alerts | boolean | default true |
| created_at | timestamptz | |

---

## TypeScript Types

```ts
// src/types/index.ts

export interface UserProfile {
  id: string
  name: string
  avatar_url: string | null
  bio: string | null
  location: string
  reply_rate: number
  avg_reply_hours: number
  created_at: string
}

export interface Category {
  id: string
  name: string
  slug: string
  icon: string
  parent_id: string | null
}

export interface Listing {
  id: string
  user_id: string
  category_id: string
  title: string
  description: string
  price: number | null
  price_type: 'fixed' | 'negotiable' | 'free'
  condition: 'new' | 'like_new' | 'good' | 'fair' | 'parts_only'
  images: string[]
  location: string
  status: 'active' | 'sold' | 'expired' | 'draft'
  offers_shipping: boolean
  is_urgent: boolean
  views_count: number
  created_at: string
  expires_at: string
  user_profiles?: UserProfile
  categories?: Category
}

export interface Conversation {
  id: string
  listing_id: string
  buyer_id: string
  seller_id: string
  created_at: string
  listings?: Listing
  buyer?: UserProfile
  seller?: UserProfile
  messages?: Message[]
}

export interface Message {
  id: string
  conversation_id: string
  sender_id: string
  content: string
  image_url: string | null
  read_at: string | null
  created_at: string
}
```

---

## Common Queries

### Get active listings with filters
```ts
let query = supabase
  .from('listings')
  .select('*, user_profiles(name, avatar_url, location), categories(name, slug)')
  .eq('status', 'active')

if (category) query = query.eq('category_id', category)
if (q) query = query.ilike('title', `%${q}%`)
if (minPrice) query = query.gte('price', minPrice)
if (maxPrice) query = query.lte('price', maxPrice)

query = query.order('created_at', { ascending: false }).range(offset, offset + limit - 1)
```

### Toggle watchlist
```ts
const { data: existing } = await supabase
  .from('watchlist')
  .select('id')
  .eq('user_id', userId)
  .eq('listing_id', listingId)
  .single()

if (existing) {
  await supabase.from('watchlist').delete().eq('id', existing.id)
} else {
  await supabase.from('watchlist').insert({ user_id: userId, listing_id: listingId })
}
```

### Get or create conversation
```ts
const { data: conv } = await supabase
  .from('conversations')
  .select('id')
  .eq('listing_id', listingId)
  .eq('buyer_id', userId)
  .single()

if (conv) return conv.id

const { data: newConv } = await supabase
  .from('conversations')
  .insert({ listing_id: listingId, buyer_id: userId, seller_id: sellerId })
  .select('id')
  .single()

return newConv?.id
```

---

## RLS Policies Summary

- `listings`: Anyone can read active listings. Only owner can insert/update/delete.
- `user_profiles`: Anyone can read. Only owner can update.
- `watchlist`: Only owner can read/write their own.
- `conversations`: Only buyer or seller can read.
- `messages`: Only conversation participants can read/insert.
- `reviews`: Anyone can read. Authenticated users can insert once per listing.
- `saved_searches`: Only owner can read/write.
