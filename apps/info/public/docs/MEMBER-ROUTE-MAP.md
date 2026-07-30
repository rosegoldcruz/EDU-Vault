# Member Route Map

## Counting and provenance

- `HEAD`: committed at legacy `29f6223`.
- `WORKTREE`: untracked on the inspected server.
- `HISTORY`: deleted from the current tree but relevant to product behavior.
- Current worktree totals: 17 rendered page routes and 22 API route files.
- Route status describes repository evidence, not live-production verification.

## Rendered routes

| Source | URL | Prov. | Auth / access / role | Primary component and dependencies | UI states and mobile | State / decision | `apps/member` target |
|---|---|---|---|---|---|---|---|
| `/home/vupi-projects/member.ironvaulttoken.com/app/page.tsx`, `/home/vupi-projects/member.ironvaulttoken.com/app/root-entry-page.tsx` | `/` | HEAD | Anonymous entry; entitled users redirect; Privy | Privy session bridge; `/api/auth/privy-session`, `/api/access/me`; Privy env | Blank while ready/checking; explicit sync error/retry; centered mobile panel | Working entry, adapt | `/login` then `/dashboard` |
| `/home/vupi-projects/member.ironvaulttoken.com/app/(dashboard)/dashboard/page.tsx` | `/dashboard` | HEAD | Privy + active entitlement; ADMIN bypass | `DashboardLanding`; profile context; `/api/crypto-news/daily` | Provider returns blank while loading; profile error retry; responsive cards/news states | Working | `/dashboard` |
| `/home/vupi-projects/member.ironvaulttoken.com/app/academy/page.tsx` | `/academy` | HEAD | Anonymous/free view allowed; paid modules need scope; admin full | `IronVaultAcademyUnlocked`; `/api/access/me`, `/api/education-progress`, orientation webhook | Full-page access loader; component has hub/lesson/quiz/results; custom responsive CSS | Working but outside shell and insecure | `/academy` inside member shell |
| `/home/vupi-projects/member.ironvaulttoken.com/app/(dashboard)/account/page.tsx` | `/account` | HEAD | Privy + active entitlement; ADMIN bypass | `AccountPanel`; profile API/context; Privy/Solana/RPC/Supabase | Provider loading/error; field fallbacks; 2-column to 1-column | Working, read-only | `/account` |
| none | `/account/wallets` | Missing | Expected authenticated member | Canonical `WalletManager` concepts | Current canonical has form/error states | Missing legacy, reusable canonical foundation | `/account/wallets` |
| `/home/vupi-projects/member.ironvaulttoken.com/app/(dashboard)/vault/page.tsx` | `/vault` | HEAD | Privy + active entitlement; ADMIN bypass | `VaultPage`; `/api/backoffice/positions`, profile wallet/balance | Position error and empty state; loading renders empty; responsive matrix | Partial, mixes records and placeholders | `/vault`; link authoritative records to `/positions` |
| none | `/positions` | Missing route | Expected authenticated member | Legacy data shown inside Vault | N/A | Rebuild dedicated surface | `/positions` |
| `/home/vupi-projects/member.ironvaulttoken.com/app/(dashboard)/referrals/page.tsx` | `/referrals` | HEAD | Privy + active entitlement; ADMIN bypass | `ReferralHub`; profile + referrals GET/POST | Form submit/error, empty leads, copy states; responsive columns | Working, commission pending | `/referrals` |
| `/home/vupi-projects/member.ironvaulttoken.com/app/(dashboard)/status/page.tsx` | `/status` | HEAD | Privy + active entitlement; ADMIN bypass | `StatusDesk`; tickets GET/POST | Submit/error, loading/empty/list; responsive columns | Working support desk; route name ambiguous | `/tickets`; `/status` decision pending |
| `/home/vupi-projects/member.ironvaulttoken.com/app/(dashboard)/rewards/page.tsx` | `/rewards` | HEAD | Privy + active entitlement; module scope | Reward status API; wallet RPC; completion/milestone/job/transaction tables | Error/empty states; loading produces mostly empty panels; responsive grids | Exists but unsafe model | `/rewards` manual status only |
| `/home/vupi-projects/member.ironvaulttoken.com/app/(dashboard)/vip/page.tsx` | `/vip` | HEAD | Member entitlement plus shared VIP code; no VIP role requirement | `VIPGate`, `VIPPartnerPage`; VIP API; video env/public media | Gate loading/error/configured/opening; responsive long-form page/table | Partial/unsafe authorization; legal review | `/vip` with authoritative VIP grant |
| `/home/vupi-projects/member.ironvaulttoken.com/app/(dashboard)/admin/rewards/page.tsx` | `/admin/rewards` | HEAD | Privy + ADMIN | `AdminRewardsDashboard`; eight admin reward APIs | Error, filters, empty jobs/transactions; responsive lists | UI works against prohibited transfer model | Rebuild manual review at `/admin/rewards` |
| `/home/vupi-projects/member.ironvaulttoken.com/app/access-required/page.tsx` | `/access-required` | HEAD | Auth optional; shown when entitlement absent | Privy logout, session DELETE, main-site link | Resetting state; responsive actions | Retain concept | `/access-required` or `/academy/access-required` |
| `/home/vupi-projects/member.ironvaulttoken.com/app/redeem-invite/page.tsx` | `/redeem-invite` | HEAD | Privy required; creates entitlement | Invite redemption API | Auto-login, idle/loading/success/error; mobile panel | Working concept, transactional rewrite | `/redeem-invite` |
| `/home/vupi-projects/member.ironvaulttoken.com/app/learn/page.tsx` | `/learn` | WORKTREE | Anonymous | Static preview; route constants | Static responsive preview | Unfinished; titles conflict with curriculum | Candidate `apps/web`, not `apps/member` |
| `/home/vupi-projects/member.ironvaulttoken.com/app/learn/module-0/page.tsx` | `/learn/module-0` | WORKTREE | Anonymous | Four static placeholder sections | Static responsive layout | Placeholder, not actual Module 0 | Remove after canonical Module 0 import |
| `/home/vupi-projects/member.ironvaulttoken.com/app/learn/free/page.tsx` | `/learn/free` | WORKTREE | Anonymous | Redirect | N/A | Duplicate alias | Remove or web redirect decision |
| `/home/vupi-projects/member.ironvaulttoken.com/app/academy/module-0/page.tsx` | `/academy/module-0` | WORKTREE | Anonymous | Redirect to `/learn/module-0` | N/A | Duplicate and bypasses real content | Remove |
| `/home/vupi-projects/member.ironvaulttoken.com/app/learn/pay/page.tsx` | `/learn/pay` | WORKTREE | Anonymous | Static safe-mode page; payment flags | Static responsive layout | No checkout; possible `apps/web` concept | Not in `apps/member` |

## Historical rendered routes

| Historical source | Last behavior | Finding | Decision |
|---|---|---|---|
| `/home/vupi-projects/member.ironvaulttoken.com/app/(dashboard)/academy/page.tsx` deleted by `784ca82` | Rendered Academy within `BackofficeLayout`, refreshed profile XP after completion | Best evidence for coherent shell; defaulted to Modules 1-6 when scope failed | Reuse shell placement only; do not reuse insecure/default access behavior |
| `/home/vupi-projects/member.ironvaulttoken.com/app/loading.tsx`, `/home/vupi-projects/member.ironvaulttoken.com/app/(dashboard)/loading.tsx` deleted by `ab06727` | Branded loaders | Deliberately removed; current loading often renders blank | Design canonical route skeletons explicitly |

## Current API routes

| Method and URL | Source | Authorization | Data/external dependencies | State | Canonical owner/contract |
|---|---|---|---|---|---|
| `POST /api/auth/privy-session` | `/home/vupi-projects/member.ironvaulttoken.com/app/api/auth/privy-session/route.ts` | Privy bearer | Privy env; HTTP-only cookie | Useful but Vercel-owned mutation | Member BFF/session only or Railway `/v1/me`; architecture decision |
| `DELETE /api/auth/privy-session` | same | None | Cookies | Working | Member logout/session cleanup |
| `GET /api/access/me` | `/home/vupi-projects/member.ironvaulttoken.com/app/api/access/me/route.ts` | Privy; entitlement result | profiles, entitlements | Working | `GET /v1/me/access` |
| `POST /api/access/redeem-invite` | `/home/vupi-projects/member.ironvaulttoken.com/app/api/access/redeem-invite/route.ts` | Privy | entitlements, invites, master-code env | Useful but compensating delete is not a transaction | `POST /v1/entitlements/invite-redemptions` |
| `POST /api/education-progress` | `/home/vupi-projects/member.ironvaulttoken.com/app/api/education-progress/route.ts` | Privy; module scope | shadow Auth, progress, quiz results, rewards | Unsafe client score and mixed actions | Split Academy endpoints |
| `POST /api/academy/orientation-qualified` | `/home/vupi-projects/member.ironvaulttoken.com/app/api/academy/orientation-qualified/route.ts` | None | caller body; GHL webhook env | Unsafe, caller-controlled GHL write | Do not port; verified event through worker only |
| `GET /api/backoffice/profile` | `/home/vupi-projects/member.ironvaulttoken.com/app/api/backoffice/profile/route.ts` | Privy only | profiles, Privy wallet, RPC | Useful; page gate stronger than API gate | `GET /v1/me/profile` |
| `GET /api/backoffice/positions` | `/home/vupi-projects/member.ironvaulttoken.com/app/api/backoffice/positions/route.ts` | Privy only | profiles, positions | Creates default row on GET | `GET /v1/me/positions`; no mutation on read |
| `GET, POST /api/backoffice/referrals` | `/home/vupi-projects/member.ironvaulttoken.com/app/api/backoffice/referrals/route.ts` | Privy only | profiles, referral leads | Working member scope | `GET/POST /v1/me/referrals` |
| `GET, POST /api/backoffice/tickets` | `/home/vupi-projects/member.ironvaulttoken.com/app/api/backoffice/tickets/route.ts` | Privy only | tickets | Working member scope | `GET/POST /v1/me/tickets` |
| `GET /api/rewards/status` | `/home/vupi-projects/member.ironvaulttoken.com/app/api/rewards/status/route.ts` | Privy + entitlement | profile, completions, milestones, jobs, transactions, RPC | Useful read shape, unsafe legacy statuses | `GET /v1/me/rewards` |
| `GET, POST /api/vip/access` | `/home/vupi-projects/member.ironvaulttoken.com/app/api/vip/access/route.ts` | Member + shared code | VIP code env/cookie | Unsafe authorization | Replace with VIP grant read; no shared code |
| `GET /api/crypto-news/daily` | `/home/vupi-projects/member.ironvaulttoken.com/app/api/crypto-news/daily/route.ts` | None | four external RSS feeds | Best effort, no auth | Optional `GET /v1/content/news` |
| `POST /api/stripe/webhook` | `/home/vupi-projects/member.ironvaulttoken.com/app/api/stripe/webhook/route.ts` | Stripe signature | Stripe, entitlements, optional payments | Reusable signed/idempotent concepts | `POST /v1/webhooks/payments/stripe` |
| `GET /api/stripe/webhook` | same | None | None | Returns 405 | No separate contract |
| `GET /api/admin/rewards/health` | admin route | ADMIN | reward tables/config | Transfer-oriented | Replace with manual reward operational health |
| `GET /api/admin/rewards/payout-status` | admin route | ADMIN | reward tables | Transfer-oriented | Do not port endpoint shape |
| `GET /api/admin/rewards/summary` | admin route | ADMIN | completion/milestone/job data | Partly reusable metrics | `GET /v1/admin/rewards/summary` |
| `GET /api/admin/rewards/payout-jobs` | admin route | ADMIN | payout jobs | Unsafe model | Replace with `GET /v1/admin/reward-reviews` |
| `GET /api/admin/rewards/transactions` | admin route | ADMIN | payout transactions | Historical read useful | Replace with fulfillment/audit reads |
| `POST /api/admin/rewards/payout-worker` | admin route | worker secret | transfer worker | Prohibited | Do not port |
| `POST /api/admin/rewards/payout-jobs/:id/retry` | admin route | ADMIN | can eventually send assets | Prohibited | Do not port |
| `POST /api/admin/rewards/payout-jobs/:id/cancel` | admin route | ADMIN | payout jobs | Cancellation concept reusable | `POST /v1/admin/reward-reviews/:id/cancel` with audit |
| `GET /api/cron/reward-payout-worker` | cron route | cron secret | automatic transfer worker | Prohibited | Do not port |

## Historical API/data surfaces

| Historical source | Deleted by | Behavior | Decision |
|---|---|---|---|
| `/home/vupi-projects/member.ironvaulttoken.com/app/api/stripe/checkout/route.ts` | `0c33635` | Authenticated Checkout Session creation for ENTRY/FOUNDATION/BUILDER_ACCELERATOR/FOUNDER_ELITE; server identity metadata | Retain concepts in `apps/api`, not member app |
| `/home/vupi-projects/member.ironvaulttoken.com/app/api/check-payment/route.ts` | `0c33635` | Alias over access scope | Do not restore duplicate endpoint |
| `lib/server/stripe.ts` | `0c33635` | Tier-to-price/access/reward mapping for Modules 1-6 | Preserve as historical product evidence; redesign provider-neutral catalog |
| `supabase/migrations/20260608000000_create_iv_payments.sql` | `0c33635` | `iv_payments` audit table | Map to canonical payment events/transactions/grants |

## Exact target page tree

```text
apps/member/app/
  login/
  dashboard/
  academy/
    page.tsx
    paths/[slug]/
    modules/[slug]/
    lessons/[slug]/
    assessments/[slug]/
  account/
    page.tsx
    wallets/
  positions/
  referrals/
  tickets/
  rewards/
  status/                 # only if product purpose is approved
  vault/
  vip/
  settings/
  data-export/
  redeem-invite/
  access-required/
  admin/
    page.tsx
    users/
    entitlements/
    academy/
    rewards/
    payments/
    tickets/
    reports/
```

No route in this tree authorizes creating empty pages. Each is implemented only when its contract and verified purpose are accepted.

## Restored target routes - 2026-07-15

| Route | Navigation | Rendered surface |
|---|---|---|
| `/dashboard` | Dashboard | Summary metrics, current path, activity, quick access |
| `/academy` | Academy | Progress metrics, learning path, module states |
| `/rewards` | Rewards | Read-only eligibility and manual review history |
| `/vault` | Vault | Membership, wallet readiness, participation matrix |
| `/positions` | Positions | Position totals, tabs, register |
| `/referrals` | Referrals | Share link, local-safe form, referral activity |
| `/vip` | VIP | Eligibility and member benefits without shared-code access |
| `/status` | Status | Service health and operational notices |
| `/support` | Support | Local-safe ticket form and ticket history |
| `/account` | Account | Privy identity display, membership, wallet, profile form |
| `/admin/rewards` | Admin Rewards | Administrator-only review UI without transfer controls |

All routes inherit the same desktop sidebar, mobile drawer, topbar, active-route behavior, typography, background, and spacing system.
