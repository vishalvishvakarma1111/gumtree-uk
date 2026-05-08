@AGENTS.md
# Gumtree Clone — Claude Code Instructions

This is a classified ads marketplace web portal built with Next.js 14, Supabase, and Tailwind CSS.
It replicates core Gumtree Australia (gumtree.com.au) functionality with an integrated Claude AI feature.

## Read skills before starting any task

Before writing any code, always read the relevant skill files:
- Architecture & patterns → `.agent/skills/architecture.md`
- Database & Supabase → `.agent/skills/database.md`
- UI components & styling → `.agent/skills/ui.md`
- Claude AI integration → `.agent/skills/ai-integration.md`

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Database | Supabase (PostgreSQL) |
| Auth | Supabase Auth |
| Storage | Supabase Storage |
| AI | Anthropic Claude API (claude-sonnet-4-20250514) |
| Deployment | Vercel |

---

## Project Structure

```
src/
  app/                    # Next.js App Router pages
    (auth)/               # Auth group: login, register
    (main)/               # Main layout group
      page.tsx            # Homepage
      browse/             # Browse & search listings
      listings/[id]/      # Single listing detail
      post-ad/            # Post a new ad
      account/            # User dashboard
        my-ads/
        watchlist/
        profile/
      messages/           # Inbox & chat
        [conversationId]/
    api/                  # API routes (server-side only)
      ai/
        generate-description/ # Claude AI endpoint
      listings/
      upload/
  components/
    ui/                   # Reusable base components (Button, Input, Card…)
    listings/             # Listing-specific components
    layout/               # Header, Footer, Sidebar
    forms/                # Form components
  lib/
    supabase/
      client.ts           # Browser Supabase client
      server.ts           # Server Supabase client
      middleware.ts        # Auth middleware helper
    claude.ts             # Claude API helper
    utils.ts              # Shared utilities
  types/
    index.ts              # All TypeScript types/interfaces
```

---

## Environment Variables

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
ANTHROPIC_API_KEY=
```

Never expose SUPABASE_SERVICE_ROLE_KEY or ANTHROPIC_API_KEY to the browser.
Always use them only in API routes (server-side).

---

## Naming Conventions

- **Files**: `kebab-case.tsx` for components, `camelCase.ts` for utilities
- **Components**: `PascalCase` — e.g. `ListingCard`, `SearchBar`
- **Functions**: `camelCase` — e.g. `fetchListings`, `uploadImage`
- **Database tables**: `snake_case` — e.g. `listings`, `user_profiles`
- **Supabase queries**: always use typed client from `lib/supabase/`
- **API routes**: `app/api/[resource]/route.ts` pattern

---

## Key Rules

1. **TypeScript strict** — no `any` types, always define interfaces in `types/index.ts`
2. **Server components by default** — only add `"use client"` when truly needed (forms, hooks, interactivity)
3. **Supabase RLS** — every table must have Row Level Security enabled, never bypass with service role key in client code
4. **Image uploads** — always go through `app/api/upload/route.ts`, store in Supabase Storage `ad-images` bucket
5. **Claude API** — only called from `app/api/ai/generate-description/route.ts`, never from client
6. **Error handling** — every async function must have try/catch, show user-friendly error messages
7. **Loading states** — every data fetch must show a skeleton or spinner

---

## Git Commit Style

```
feat: add listing detail page
fix: correct image upload size limit
chore: update Supabase types
docs: add setup instructions to README
```

Keep commits small and focused. Commit after each working feature.