# Gumtree UK Clone — Project Overview

> Captured 2026-05-12. Living document — update as features ship.

---

## 1. Purpose

Classified-ads marketplace web portal modelled on `gumtree.com.au` / `gumtree.com`.
Buyers and sellers post free ads across categories (vehicles, property, electronics,
home & garden, services, fashion, etc.), browse by location/category, message each
other, save favourites, and rate transactions. Includes a built-in Anthropic Claude
AI layer (description generation, smart-search, message safety check) and a staff
admin panel for moderation.

---

## 2. Tech Stack

| Layer        | Technology                                    |
| ------------ | --------------------------------------------- |
| Framework    | Next.js 16 (App Router, React 19)             |
| Language     | TypeScript (strict)                           |
| Styling      | Tailwind CSS v4                               |
| Database     | Supabase Postgres                             |
| Auth         | Supabase Auth (SSR cookies)                   |
| Storage      | Supabase Storage (`ad-images` bucket)         |
| Realtime     | Supabase Realtime (messaging, unread badge)   |
| AI           | Anthropic Claude API (`claude-sonnet-4`)      |
| Testing      | Vitest                                        |
| Deployment   | Vercel                                        |

---

## 3. High-level Architecture

```
src/
  app/
    (auth)/           # login, register — minimal layout
    (admin)/admin/    # staff panel (RLS + middleware gated)
    (main)/           # public + authed user pages
      browse/
      listings/[id]/
      post-ad/
      account/{my-ads,watchlist,profile}
      messages/[conversationId]/
    api/              # server-only routes (Claude, uploads, admin ops, cron)
  components/
    ui/               # base primitives
    listings/         # ListingCard, WatchlistButton…
    layout/           # Header, Footer
    forms/
  lib/
    supabase/         # client, server, middleware
    admin.ts          # isAdminUser()
    claude.ts         # Claude SDK wrapper
    categories.ts
    utils.ts
  types/index.ts
supabase/migrations/  # 008 SQL files, RLS-first
```

Middleware (`src/middleware.ts` → `lib/supabase/middleware.ts`) handles:
- Session refresh on every request.
- Admin route guard (`/admin`, `/api/admin/*`).
- Admin auto-redirect: logged-in admins on any non-admin HTML route bounce to `/admin`.

---

## 4. Database (Supabase Postgres)

8 migrations applied:

| #   | Migration                  | Adds                                                     |
| --- | -------------------------- | -------------------------------------------------------- |
| 001 | initial_schema             | user_profiles, categories, listings, conversations, messages, reviews, watchlist, RLS |
| 002 | realtime_messages          | Realtime publication for messages + unread tracking      |
| 003 | view_count                 | listing view counter                                     |
| 004 | admin_and_reports          | reports table + admin moderation columns                 |
| 005 | listing_expiry             | `expires_at` + cron expiry                               |
| 006 | email_notifications        | notification triggers                                    |
| 007 | admin_user_flag            | `user_profiles.is_admin` (UPDATE revoked)                |
| 008 | subcategories              | `parent_id` populated, subcategory tree                  |

RLS enabled on every table. `is_admin` column has UPDATE revoked from authenticated
and anon — promotion is DB-only.

---

## 5. Environment Variables

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY   # server only
ANTHROPIC_API_KEY           # server only
```

---

## 6. Brand Tokens

| Token            | Hex       | Use                            |
| ---------------- | --------- | ------------------------------ |
| Primary teal     | `#0D475C` | Header bg, headings, buttons   |
| Brand red        | `#e75462` | CTA buttons, saved heart fill  |
| Tree green       | `#72EF36` | Logo SVG fill, accent          |
| Cream            | `#F0ECE6` | Wordmark on teal               |
| Price green      | `#15803d` | Price text                     |
| Surface grey     | `#f1f1f1` | Page bg                        |
| Border grey      | `#dbdadb` | Card / input borders           |

Header now consistent across main / auth / admin — same teal bg + tree SVG + cream wordmark.

---

## 7. Claude AI Integration

Server-only (never invoked from browser):

| Endpoint                              | Purpose                                     |
| ------------------------------------- | ------------------------------------------- |
| `/api/ai/generate-description`        | Post-ad assist: generate listing copy       |
| Message safety check                  | Flags unsafe chat content                   |
| Smart search NL parser                | Free-text → structured search query         |
| Title improver / price suggester      | Post-ad assists                             |

---

## 8. Admin Panel

Routes under `(admin)/admin`:

- Dashboard
- Pending listings (approve / reject)
- Reports triage
- Listing detail with takedown actions

Auth: middleware + layout double-guard via `isAdminUser()`.
Sign-out clears Supabase cookies → middleware sees no user → admin can reach `/login`.

---

## 9. Testing

- Vitest unit tests under `src/lib/*.test.ts` (e.g. `admin.test.ts`).
- TypeScript `strict` — `npx tsc --noEmit` is the canonical gate.
- No `any` types allowed.

---

## 10. Deployment

Vercel. Cron route `/api/cron/expire-listings` runs daily via Vercel Cron config in
`vercel.json`.

---

## 11. Open Backlog

See `docs/gumtree-feature-audit.md` for full Gumtree-vs-ours gap list and prioritised
backlog (P0 → P3). High-impact items still pending:

- Cookie consent + privacy settings (UK GDPR).
- Saved-search UI + email alerts (schema present, no UI/cron).
- Category-specific listing fields (cars, property).
- Promoted / featured paid listings (Stripe).
- Pets / Jobs / Community verticals.

See `docs/tasks-done.xlsx` for everything shipped so far.
