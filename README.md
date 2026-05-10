# Gumtree UK Clone

Classified ads marketplace web portal — Next.js 16 + Supabase + Claude AI.
Replicates core gumtree.com UK functionality with integrated Claude features for
description generation, title rewriting, price suggestion, and natural-language
search parsing.

> Live demo: _add Vercel URL once deployed_

---

## Tech Stack

| Layer        | Technology                                      |
| ------------ | ----------------------------------------------- |
| Framework    | Next.js 16 (App Router, Turbopack)              |
| Language     | TypeScript 5                                    |
| Styling      | Tailwind CSS 4                                  |
| Database     | Supabase (PostgreSQL) with RLS                  |
| Auth         | Supabase Auth (email + password)                |
| File storage | Supabase Storage (`ad-images` bucket)           |
| AI           | Anthropic Claude (`claude-sonnet-4-20250514`)   |
| Realtime     | Supabase Realtime (postgres_changes)            |
| Tests        | Vitest                                          |
| Deployment   | Vercel (auto-deploy from GitHub `main`)         |

---

## Features

**Core marketplace**

- Homepage with hero, latest listings, featured categories, mega dropdown nav
- Browse with keyword + location search, category filter, price/condition filters,
  sort (newest / oldest / price asc/desc), pagination (20/page), grid + list view
- Listing detail page: photo gallery, seller card, save to watchlist, reply to ad,
  share, report, similar ads, breadcrumbs
- Multi-step Post-an-Ad flow: category → details → photos (multi-upload, max 10) →
  location → review
- Account: My Ads (Pending / Active / Sold / Rejected / Drafts / Expired tabs),
  Edit listing, Watchlist, Reviews received, Public profile, Profile + password change
- Admin panel at `/admin` (single hardcoded admin via `ADMIN_EMAIL`):
  approve/reject pending listings, triage reports, take down ads
- Messaging: inbox, chat thread, real-time delivery, unread badge in header
- Public seller profile at `/users/[id]`

**AI features (Claude)**

| Feature              | Endpoint                            | Use                                      |
| -------------------- | ----------------------------------- | ---------------------------------------- |
| Description generator | `POST /api/ai/generate-description` | Writes 2-3 paragraph listing body        |
| Title improver       | `POST /api/ai/improve-title`        | Returns 3 alt titles                     |
| Price suggester      | `POST /api/ai/suggest-price`        | Suggests UK secondhand price range       |
| Smart search         | `POST /api/ai/parse-search`         | Parses NL query → structured filter      |
| Safety checker       | `POST /api/ai/check-message`        | Flags suspicious chat messages           |

All Claude calls run server-side; `ANTHROPIC_API_KEY` is never bundled into the
browser.

---

## Local Setup

### 1. Clone & install

```bash
git clone <repo-url> gumtree-uk
cd gumtree-uk
npm install
```

### 2. Supabase project

1. Create a new project at [supabase.com](https://supabase.com).
2. Run the SQL files in order:
   - `supabase/migrations/001_initial_schema.sql` — tables, RLS policies, storage bucket
   - `supabase/migrations/002_realtime_messages.sql` — realtime publication for chat
3. Storage → confirm `ad-images` bucket exists and is public read.

### 3. Environment variables

Copy `.env.example` to `.env.local` and fill in:

| Var                              | Source                                                |
| -------------------------------- | ----------------------------------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`       | Supabase project settings → API → URL                 |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY`  | Supabase project settings → API → `anon public` key   |
| `SUPABASE_SERVICE_ROLE_KEY`      | Supabase project settings → API → `service_role` key  |
| `ANTHROPIC_API_KEY`              | [console.anthropic.com](https://console.anthropic.com) |
| `ADMIN_EMAIL`                    | The single user email allowed to access `/admin`      |

### 4. Run

```bash
npm run dev          # http://localhost:3000
npm test             # Vitest unit tests
npx tsc --noEmit     # type check
```

---

## Project Structure

```
src/
  app/
    (auth)/          login, register
    (main)/          home, browse, listings/[id], post-ad, account, messages, users/[id]
    api/             ai/*, listings, upload, watchlist, profile, messages
  components/
    ui/              base components (Button, Input, Card)
    listings/        listing cards
    listing/         listing detail components
    layout/          Header, Footer
    forms/           post-ad form, edit form
    filters/         filter sidebar
    browse/          sort dropdown, view toggle
  lib/
    supabase/        browser + server clients
    claude.ts        Anthropic SDK helper
    utils.ts         timeAgo, formatPrice, cn
    data/            mock listings fallback
  types/             shared TS interfaces
supabase/migrations/ SQL migrations
.agent/skills/       Claude Code skill docs
```

---

## Deployment (Vercel)

1. Connect the GitHub repository to Vercel.
2. Add the four env vars from `.env.example` in Vercel project → Settings → Environment Variables.
3. Push to `main` — Vercel auto-deploys.
4. Update the live demo URL at the top of this README.

---

## Documentation

- `CLAUDE.md` — project conventions for Claude Code
- `AGENTS.md` — Next.js 16 deprecation notes
- `.agent/skills/architecture.md` — patterns and code examples
- `.agent/skills/database.md` — table schemas and TS types
- `.agent/skills/ui.md` — Tailwind design system
- `.agent/skills/ai-integration.md` — Claude API route patterns
- `.agent/skills/pre-commit-review.md` — pre-commit review checklist

---

## License

Educational project — Practical Vibe Coding Activity, AI Acceleration Month.
