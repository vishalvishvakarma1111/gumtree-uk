# Gumtree UK — Build Status

Last updated: 2026-05-09

---

## ✅ Done

### Infrastructure
- [x] `src/lib/supabase/client.ts` — browser client
- [x] `src/lib/supabase/server.ts` — async server client (Next.js 16)
- [x] `src/lib/supabase/middleware.ts` — updateSession helper
- [x] `src/middleware.ts` — Next.js middleware entry
- [x] `src/types/index.ts` — all TypeScript interfaces
- [x] `src/lib/utils.ts` — timeAgo, formatPrice, cn
- [x] `src/lib/data/mock-listings.ts` — 24 UK listings (mock fallback)
- [x] `supabase/migrations/001_initial_schema.sql` — full DB schema + RLS + storage + 13 categories
- [x] `next.config.ts` — image domains (picsum, pravatar)
- [x] `src/app/globals.css` — Gumtree brand tokens (#0D475C, #e75462)

### Pages
- [x] `/` — Homepage (hero, 12 categories, listings, how-it-works, locations)
- [x] `/browse` — Browse with filters, sort, grid (server-rendered, URL-driven)
- [x] `/listings/[id]` — Detail (gallery, seller, message modal, similar)
- [x] `/post-ad` — Category picker with progress stepper
- [x] `/login` — Auth form UI (stub, not wired to Supabase)
- [x] `/register` — Auth form UI (stub, not wired to Supabase)

### Components
- [x] `components/layout/header.tsx` — sticky, search, mobile menu, category nav
- [x] `components/layout/footer.tsx` — 4-col links, social, legal
- [x] `components/listings/listing-card.tsx` — card with price, location, condition badge
- [x] `components/listings/listing-card-skeleton.tsx` — skeleton loader
- [x] `components/listing/image-gallery.tsx` — thumbnails + lightbox (client)
- [x] `components/listing/contact-panel.tsx` — message modal + save toggle (client)
- [x] `components/filters/filter-sidebar.tsx` — category/price/condition/urgent filters (client)
- [x] `components/browse/sort-dropdown.tsx` — URL-driven sort (client)

---

## 🔲 Remaining

### Priority 1 — Post Ad (core flow)
- [ ] `src/app/(main)/post-ad/[category]/page.tsx` — full multi-step ad form
  - Step 1: category (done — `/post-ad`)
  - Step 2: ad details (title, description, price, condition)
  - Step 3: photos (drag-drop, up to 10)
  - Step 4: location + options (shipping, urgent)
  - Step 5: preview + publish
- [ ] `src/app/api/upload/route.ts` — image upload → Supabase Storage `ad-images`
- [ ] `src/app/api/listings/route.ts` — POST create listing

### Priority 2 — Claude AI Integration
- [ ] `src/lib/claude.ts` — Anthropic SDK helper
- [ ] `src/app/api/ai/generate-description/route.ts` — AI description generator
- [ ] `src/lib/hooks/useGenerateDescription.ts` — client hook for AI button

### Priority 3 — Auth (wire Supabase)
- [ ] Wire `/login` → `supabase.auth.signInWithPassword()`
- [ ] Wire `/register` → `supabase.auth.signUp()`
- [ ] Add signout to header (if user session exists)
- [ ] Auth guard: redirect unauthenticated users from `/post-ad`, `/account`, `/messages`

### Priority 4 — Account Dashboard
- [ ] `src/app/(main)/account/my-ads/page.tsx` — user's listings (edit/delete/mark sold)
- [ ] `src/app/(main)/account/watchlist/page.tsx` — saved listings
- [ ] `src/app/(main)/account/profile/page.tsx` — edit profile (name, location, avatar, bio)
- [ ] Account layout with sidebar nav

### Priority 5 — Messaging
- [ ] `src/app/(main)/messages/page.tsx` — conversation inbox
- [ ] `src/app/(main)/messages/[conversationId]/page.tsx` — real-time chat
- [ ] Supabase Realtime subscription for new messages
- [ ] Unread message count badge in header

### Priority 6 — Listings API (server-side)
- [ ] `src/app/api/listings/route.ts` — GET (with filters), POST
- [ ] `src/app/api/listings/[id]/route.ts` — GET, PATCH (status), DELETE
- [ ] Replace mock data with live Supabase queries (env vars must be set)

---

## ⚙️ Environment Setup Required

Before auth/DB/AI features work, add to `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=<from Supabase dashboard>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<from Supabase dashboard>
SUPABASE_SERVICE_ROLE_KEY=<from Supabase dashboard>
ANTHROPIC_API_KEY=<from Anthropic console>
```

Then run migration in Supabase SQL editor:
```
supabase/migrations/001_initial_schema.sql
```

---

## 🔧 Known Issues / Notes

- `middleware.ts` deprecation warning in Next.js 16 (use "proxy" instead) — low priority, still works
- Mock data fallback active while Supabase env vars not set
- Auth forms are UI-only stubs — safe to demo, no real auth until Priority 3 wired
- `src/app/page.tsx` (default Next.js template) was deleted — `(main)/page.tsx` now owns `/`
