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
- [x] `src/lib/claude.ts` — Anthropic SDK helper
- [x] `supabase/migrations/001_initial_schema.sql` — full DB schema + RLS + storage + 13 categories
- [x] `next.config.ts` — image domains (picsum, pravatar)
- [x] `src/app/globals.css` — Gumtree brand tokens (#0D475C, #e75462)

### Pages
- [x] `/` — Homepage (hero, 12 categories, listings, how-it-works, locations)
- [x] `/browse` — Browse with filters, sort, grid (live DB + mock fallback)
- [x] `/listings/[id]` — Detail (gallery, seller, message modal, similar) — wired to live DB
- [x] `/post-ad` — Category picker
- [x] `/post-ad/[category]` — Multi-step ad form (details / photos / location / review)
- [x] `/login` — Auth form (Supabase signInWithPassword)
- [x] `/register` — Auth form (Supabase signUp)
- [x] `/account/my-ads` — User listings (status badges, mark sold, relist, delete)
- [x] `/account/watchlist` — Saved listings (live DB)
- [x] `/account/profile` — Editable profile (name, location, bio, phone, avatar upload)
- [x] `/messages` — Conversation inbox (last message + unread counts)
- [x] `/messages/[conversationId]` — Realtime chat thread (Supabase Realtime subscription)

### API routes
- [x] `app/api/listings/route.ts` — GET (filters, sort) + POST (with slug→uuid)
- [x] `app/api/listings/[id]/route.ts` — GET, PATCH (status/edit), DELETE
- [x] `app/api/upload/route.ts` — image upload to Supabase Storage `ad-images`
- [x] `app/api/watchlist/route.ts` — GET, POST, DELETE
- [x] `app/api/messages/route.ts` — POST (creates conversation if needed)
- [x] `app/api/profile/route.ts` — PATCH
- [x] `app/api/ai/generate-description/route.ts` — Claude AI description generator

### Components
- [x] `components/layout/header.tsx` — sticky, search, mobile menu, category nav, **unread badge**, signout
- [x] `components/layout/footer.tsx` — 4-col links, social, legal
- [x] `components/listings/listing-card.tsx`
- [x] `components/listings/listing-card-skeleton.tsx`
- [x] `components/listing/image-gallery.tsx`
- [x] `components/listing/contact-panel.tsx` — message + save toggle wired to API
- [x] `components/filters/filter-sidebar.tsx`
- [x] `components/browse/sort-dropdown.tsx`
- [x] `components/forms/post-ad-form.tsx` — multi-step with AI description button
- [x] `account/my-ads/ad-actions.tsx` — mark sold/relist/delete client actions
- [x] `account/profile/profile-form.tsx` — editable profile client form
- [x] `messages/[conversationId]/chat-thread.tsx` — realtime chat client component

---

## 🔲 Remaining / Nice-to-have

- [ ] Listing edit form (PATCH wired in API but no UI yet)
- [ ] Saved searches CRUD
- [ ] Reviews UI (table + RLS exist, no UI)
- [ ] Conversation pagination + infinite scroll
- [ ] Image upload progress + drag-drop on post-ad photos step
- [ ] Image upload for chat (`messages.image_url` column exists)
- [ ] Category icon picker / browse-by-category landing pages
- [ ] Map view on browse / location autocomplete
- [ ] Pagination on `/browse` (currently capped at 60)

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

For realtime chat: enable Realtime on `messages` table in Supabase dashboard
(`Database → Replication → supabase_realtime` publication, add `messages`).

---

## 🔧 Known Issues / Notes

- `middleware.ts` deprecation warning in Next.js 16 (use "proxy" instead) — works fine
- Mock data fallback active when Supabase env vars unset
- ESLint warns on a few `&apos;` unescaped entities in pre-existing pages — non-blocking
- `formatPrice(price, priceType)` is the canonical signature; `priceType === 'free'` short-circuits inside it
