# Pre-Commit Code Review

Run this checklist on every diff before `git commit`. One line per finding. Format:
`path:line: <severity>: <problem>. <fix>.` Severities: 🔴 critical, 🟠 major, 🟡 minor.

Skip formatting nits unless they change meaning. No praise. No scope creep.

---

## How to invoke

```
review my staged changes against .agent/skills/pre-commit-review.md
```

or load skill manually then run the steps below.

---

## Step 0 — Gather diff

```bash
git status
git diff --staged                # if staged
git diff                         # if not yet staged
git diff main...HEAD             # branch diff before PR
```

If nothing staged AND nothing modified → stop, nothing to review.

---

## Step 1 — Security

- 🔴 `ANTHROPIC_API_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `STRIPE_*` referenced in any file under `src/app/(main)/**`, `src/components/**`, or any file with `'use client'`. Move to `src/app/api/*/route.ts`.
- 🔴 `.env`, `.env.local`, `*.pem`, `*.key`, `credentials.json` staged. Unstage + add to `.gitignore`.
- 🔴 SQL string concatenation with user input. Use `.eq()`, `.ilike()` etc. — Supabase parameterizes.
- 🔴 `dangerouslySetInnerHTML` on user-controlled string. Sanitize or remove.
- 🟠 New table created without `ENABLE ROW LEVEL SECURITY` + at least one policy. Add RLS.
- 🟠 Server route doesn't check `supabase.auth.getUser()` before mutating data. Add auth gate.
- 🟠 Image/file upload missing MIME allowlist or size cap (compare to `src/app/api/upload/route.ts`).
- 🟠 `redirect()` target built from unvalidated query param (open redirect). Allowlist or relative-only.
- 🟡 `console.log` of user data, tokens, or full request body. Remove or scrub.

---

## Step 2 — Next.js 16 / App Router

- 🔴 Server Component imports browser-only API (`window`, `document`, `localStorage`, hooks). Mark `'use client'` or move logic.
- 🔴 `'use client'` file imports `@/lib/supabase/server` or `@/lib/claude` or any module that reads server env. Move call to API route.
- 🔴 `params` / `searchParams` used without `await`. In Next 16 they're Promises: `const { id } = await params`.
- 🟠 New `middleware.ts` added. Codebase already has one — should be `proxy.ts` per Next 16 deprecation notice (or extend existing `src/middleware.ts`).
- 🟠 `next/image` skipped in favor of `<img>` in non-chat code. Use `<Image>` for listing photos and avatars (perf + LCP).
- 🟡 Page exports `export const dynamic = 'force-static'` but reads cookies / auth. Will break — remove.

---

## Step 3 — Supabase / DB

- 🔴 Service-role client used outside `src/app/api/*` (look for `createClient(url, SERVICE_ROLE_KEY)` patterns). Replace with regular server client.
- 🟠 `.select('*')` joined to a table with sensitive columns (e.g. `auth.users`). Pin columns.
- 🟠 Missing `.maybeSingle()` where row may not exist. `.single()` throws on 0 rows.
- 🟠 New listing/watchlist/conversation insert without `user_id: user.id`. RLS will reject — confirm user_id wired.
- 🟠 Slug used directly as `category_id`. Resolve via `categories` table first (see `src/app/api/listings/route.ts`).
- 🟡 Migration adds index but no `IF NOT EXISTS`. Re-running breaks.
- 🟡 New table column added without default. Existing rows break NOT NULL — add default or backfill.

---

## Step 4 — Type Safety

- 🔴 `any` introduced. Replace with concrete type from `src/types/index.ts` or define new interface there.
- 🟠 `as Foo` cast skips a type error rather than fixes the shape. Fix source.
- 🟠 Supabase relation that joins same table twice (e.g. `buyer:user_profiles!fk1, seller:user_profiles!fk2`) typed as object instead of array. Cast via `as unknown as <Type>` and verify FK aliases match schema.
- 🟡 Function returns `Promise<any>` or untyped. Add return type.

---

## Step 5 — React / Component Quality

- 🟠 `useEffect` with empty deps that reads state from closure → stale closure. Add deps or use ref.
- 🟠 New realtime / websocket / interval subscription without cleanup. Return `() => supabase.removeChannel(channel)` from `useEffect`.
- 🟠 Form submits without `e.preventDefault()`. Will full-page-reload.
- 🟠 `onClick={fn()}` instead of `onClick={fn}` — invokes on render.
- 🟡 Inline object/array prop on memoized child causes re-render. Extract or `useMemo`.
- 🟡 Key is array index where list reorders / deletes (e.g. photos array). Use stable id.

---

## Step 6 — Error / Loading States

- 🟠 `fetch` / Supabase call with no `try/catch` and no error UI. Wrap and surface message.
- 🟠 Async component does data fetch with no loading skeleton in caller. Add `Suspense` boundary or skeleton.
- 🟡 `catch` block swallows error silently with no `console.error`. Either log or comment why intentional.

---

## Step 7 — Style / Design Tokens

- 🟡 Hardcoded brand color other than `#0D475C` (teal) or `#e75462` (coral). Match palette.
- 🟡 New color or spacing introduced inline rather than via Tailwind class. Prefer class.
- 🟡 Emoji added to user-facing copy without product reason. Match existing voice.

---

## Step 8 — Dead Code / Scope Creep

- 🟠 New file unrelated to commit subject. Either tie to commit or split.
- 🟠 Unused import / variable. Remove.
- 🟠 Commented-out block left in. Remove.
- 🟡 `TODO` / `FIXME` added without ticket reference. Add or do now.

---

## Step 9 — Build Validation

Run before declaring review done:

```bash
npx tsc --noEmit             # must be clean
npx eslint src/              # warnings OK, errors block
npx next build               # only if routes / API / config changed
```

Block commit if `tsc --noEmit` fails. ESLint `error` (not `warning`) blocks. Pre-existing errors in untouched files don't block — note them separately.

---

## Step 10 — Commit Hygiene

- 🟠 Commit subject doesn't match Conventional Commits (`feat:`, `fix:`, `chore:`, `docs:`, `refactor:`, `test:`). Rename.
- 🟠 Subject > 50 chars. Trim.
- 🟠 Diff mixes feature + unrelated refactor. Split into 2 commits.
- 🟡 Body explains *what* not *why*. Re-word to motivation.
- 🔴 `--no-verify` / `--no-gpg-sign` in command. Don't bypass hooks.

---

## Output Format

```
## Review of <branch> @ <sha>

### 🔴 Critical (block commit)
src/app/api/foo/route.ts:42: 🔴 Service role key reachable from client. Move to API route.

### 🟠 Major
src/components/x.tsx:17: 🟠 useEffect missing cleanup for subscription. Return removeChannel.

### 🟡 Minor
src/app/page.tsx:88: 🟡 Hardcoded #00ff00 not in palette. Use #0D475C.

### Build
- tsc: ✅
- eslint: ✅ (3 pre-existing warnings, not introduced)
- next build: not run (no route/config changes)

### Verdict
HOLD — fix 1 critical, then commit.
```

Verdicts: `READY`, `HOLD` (fix criticals/majors first), `BLOCK` (build fails).
