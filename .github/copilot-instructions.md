# Copilot Instructions for EDU-Vault (Iron Vault / Vaulted Academy)

## What this repo actually is right now

This repo is a `vinext`/Next.js starter (`site-creator-vinext-starter`) hosting
the **Vaulted Academy** product (public landing page + authenticated learning
app under `app/`), plus a separate, mostly-standalone Next.js app in
`apps/member/` that is a UI-only mock of the future "Iron Vault Member Back
Office."

Read `docs/CANONICAL-ARCHITECTURE.md` and `DECISIONS.md` before making
structural changes — they describe a **target** multi-service platform
(`apps/web`, `apps/api`, `apps/worker`, `packages/db`, etc.) that does **not**
exist yet. Only `app/` (this Next.js app) and `apps/member/` (a separate,
independently-installed Next.js app) currently exist. Do not create
`apps/academy` or a second member portal — see D-005 in `DECISIONS.md`.

## Build, lint, test

Root app (`app/`, `db/`, `lib/`, `worker/`):
```bash
npm install
npm run dev             # vinext dev server
npm run build            # vinext build (also used as a build-verification test)
npm run lint             # eslint . --ignore-pattern dist --ignore-pattern .next
npm run typecheck        # tsc --noEmit
npm run test:unit        # tsx --test tests/academy-foundation.test.ts (single-file unit/integration suite)
npm test                 # test:unit && build && node --test tests/rendered-html.test.mjs
```
To run a single test case inside `tests/academy-foundation.test.ts`, use Node's
built-in test runner filtering, e.g.:
```bash
npx tsx --test --test-name-pattern="completeLesson" tests/academy-foundation.test.ts
```
Database (Drizzle + LibSQL, local file at `.data/academy.db` unless `DATABASE_URL` is set):
```bash
npm run db:generate   # drizzle-kit generate — regenerate migrations after editing db/schema.ts
npm run db:migrate    # tsx db/migrate.ts
npm run db:seed       # tsx db/seed.ts
```

`apps/member/` is a **separate npm project** with its own `package.json`,
`eslint.config.mjs`, `tsconfig.json`, and lockfile. Install and run it from
inside that directory, not from the repo root:
```bash
cd apps/member
npm install
npm run dev            # MEMBER_MOCK_MODE=true next dev -p 3011
npm run dev:api         # MEMBER_DATA_MODE=api next dev -p 3011
npm run lint
npm run typecheck
npm run test            # node --test tests/contracts.test.mjs
```

## Architecture (root app)

Request flow for authenticated Academy features:
`app/api/academy/**/route.ts` → `requireApiUser()` (`lib/auth/privy.ts`,
verifies the Privy session) → domain function in `lib/academy/service.ts`
(all business logic, transactions, XP/unlock rules) → Drizzle queries against
`db/schema.ts` tables via `getDb()` (`db/index.ts`).

- **`lib/http.ts`**'s `apiRoute()` wrapper is the standard pattern for every
  API route: it calls the handler, JSON-serializes the result, and maps
  `AcademyError` → `{error, code}` with the error's `status`, `ZodError` → 400,
  and anything else → generic 500. New API routes should follow the same
  `apiRoute(async () => { ... })` shape (see any file under `app/api/academy/`).
- **`lib/academy/service.ts`** is the single source of truth for Academy
  domain logic (identity sync, lesson start/complete, wallet
  challenge/verify/select, XP, unlocks, admin inspection). It throws
  `AcademyError(message, status, code)` for all expected failure cases —
  never return raw HTTP responses or throw generic `Error` from route
  handlers for expected/user-facing failures.
- **`lib/auth/privy.ts`** owns all Privy verification and identity-to-user
  sync; `db/schema.ts`'s `academyUsers.privyUserId` is the mapping from one
  Privy subject to one canonical internal user row. Do not add a second
  identity system (e.g. Supabase Auth) — see D-006 in `DECISIONS.md`.
- **Assessment/scoring is server-authoritative**: the client only ever submits
  selected option IDs; scoring and XP awarding happen inside
  `lib/academy/service.ts` in a single transaction. Never trust or accept a
  caller-supplied score.
- **`db/schema.ts`** uses Drizzle + SQLite/LibSQL (not PostgreSQL, despite
  `docs/` describing a future Postgres target). Tables use `text("id")` UUID
  primary keys, `timestamps` (createdAt/updatedAt in `unixepoch() * 1000`),
  and CHECK constraints mirroring the Drizzle `enum` unions — when adding an
  enum-like column, add both the `enum: [...]` and a matching `check(...)`.
- **Rewards are manual-only**: no code path may sign or send tokens/money
  automatically (no worker/cron/retry that transfers assets). See D-009.
- **`app/chatgpt-auth.ts`** implements optional "Sign in with ChatGPT"
  (SIWC) for OpenAI Sites hosting; it only establishes identity, not
  workspace membership. Reserved paths `/signin-with-chatgpt`,
  `/signout-with-chatgpt`, `/callback` are owned by the Dispatch platform —
  do not add app routes for those paths.
- **`vite.config.ts`** / `.openai/hosting.json` simulate declared Cloudflare
  D1/R2 bindings for local dev under vinext; `examples/d1/` is an optional
  reference surface, not part of the main app.

## Key conventions

- Brand colors are locked: Vault Purple `#760CBC`, Electric Green `#56E628`,
  White `#FFFFFF`. Gradients must derive from `#760CBC -> #56E628`. Do not
  introduce other accent colors (cyan, pink, blue, gold, orange).
- Path alias `@/*` maps to repo root (see `tsconfig.json`) — use `@/db`,
  `@/lib/academy/service`, etc., not relative paths across top-level dirs.
- `apps/member` is excluded from the root `tsconfig.json` (`exclude:
  ["node_modules", "apps/member"]`) because it is a fully separate TS project.
- Protected/identity-dependent pages must set
  `export const dynamic = "force-dynamic"`.
- `docs/*.md`, `STATE.md`, and `DECISIONS.md` are living design-authority
  documents for this consolidation effort — check them before large
  structural or product-scope changes, since they encode explicitly *rejected*
  approaches (e.g. automatic reward transfers, client-authoritative quiz
  scoring, a second member portal).
