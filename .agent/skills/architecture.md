# Architecture & Patterns

## App Router Patterns

### Page (Server Component — default)
```tsx
// src/app/(main)/browse/page.tsx
import { createServerClient } from '@/lib/supabase/server'

export default async function BrowsePage({ searchParams }: { searchParams: { category?: string; q?: string } }) {
  const supabase = createServerClient()
  const { data: listings } = await supabase
    .from('listings')
    .select('*, user_profiles(name, avatar_url)')
    .eq('status', 'active')
    .limit(20)

  return <ListingsGrid listings={listings ?? []} />
}
```

### Client Component (only when needed)
```tsx
"use client"
import { useState } from 'react'

export default function SearchBar() {
  const [query, setQuery] = useState('')
  // ...
}
```

### API Route (server only)
```ts
// src/app/api/ai/generate-description/route.ts
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const { title, category } = await req.json()
  // call Claude API here
  return NextResponse.json({ description })
}
```

---

## Data Fetching Patterns

### Server-side (preferred)
```tsx
const supabase = createServerClient()
const { data, error } = await supabase.from('listings').select('*')
```

### Client-side (for real-time or user-triggered)
```tsx
const supabase = createBrowserClient()
const { data } = await supabase.from('listings').select('*')
```

### Optimistic updates (for watchlist toggle, etc.)
```tsx
const [saved, setSaved] = useState(initialSaved)
const toggleWatchlist = async () => {
  setSaved(!saved) // optimistic
  const { error } = await supabase.from('watchlist').upsert(...)
  if (error) setSaved(saved) // revert on error
}
```

---

## Component Patterns

### ListingCard (used everywhere)
Always receives full listing object typed from `types/index.ts`.
Shows: photo thumbnail, title, price, location, time ago, condition badge.

### Skeleton loading
```tsx
export function ListingCardSkeleton() {
  return <div className="animate-pulse bg-gray-200 rounded-lg h-64 w-full" />
}
```

### Error boundary
Wrap page-level data sections with Suspense + error.tsx fallback.

---

## Auth Patterns

### Protect a page (server)
```tsx
import { createServerClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function ProtectedPage() {
  const supabase = createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  // ...
}
```

### Auth middleware (already configured in middleware.ts)
Handles session refresh automatically on every request.

---

## File Upload Pattern

1. Client selects file → sends to `POST /api/upload`
2. API route validates (max 5MB, image types only)
3. Uploads to Supabase Storage `ad-images/{userId}/{uuid}.jpg`
4. Returns public URL
5. Store URL in `listings.images` array

---

## Search Pattern

URL-driven search state (not useState):
```
/browse?q=iphone&category=electronics&min_price=100&max_price=500&location=sydney&sort=newest
```

Read params in server component via `searchParams` prop.
Update via `router.push` with new URLSearchParams.
