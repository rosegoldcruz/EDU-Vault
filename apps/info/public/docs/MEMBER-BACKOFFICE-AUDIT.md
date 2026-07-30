# Member Back Office Audit

## Result

The legacy repository is a real but uneven member back office, not merely an Academy. It contains a shared authenticated shell, eight member navigation destinations, one administrator UI, 22 API route files, entitlement and invite handling, Stripe webhook fulfillment, wallet/balance inspection, referrals, support tickets, positions, VIP material, curriculum/progress, and an unsafe automatic reward-transfer system.

The canonical target is one `apps/member` application. Academy is a product area inside that application. No `apps/academy` and no second portal should be created.

## Provenance

| Item | Value |
|---|---|
| Legacy repository | `/home/vupi-projects/member.ironvaulttoken.com` |
| Branch | `academy-free-course-modules-7-12` |
| Committed baseline | `29f622310c82640d8b89e2643f644cf593e19979` |
| Canonical repository | `/srv/EDU Vault` |
| Canonical branch | `consolidation/iron-vault-platform` |
| Canonical baseline before this audit | `d9c55ae7b810d2233622d0620380181ad8c09181` |

The legacy worktree is dirty. Findings use these labels:

- `HEAD`: committed behavior at `29f6223`.
- `WORKTREE`: uncommitted behavior found on disk.
- `HISTORY`: deleted or replaced behavior found in the 96-commit, all-branch Git history.

Worktree changes observed without modification:

| Path | Provenance | Meaning |
|---|---|---|
| `.gitignore` | Modified | Ignore-list cleanup only |
| `app/api/access/redeem-invite/route.ts` | Modified | Development-only diagnostic log; no business-rule change |
| `tsconfig.tsbuildinfo` | Modified/generated | Build metadata; no product authority |
| `app/academy/module-0/page.tsx` | Untracked | Redirect to worktree `/learn/module-0` |
| `app/learn/**` | Untracked | Public preview, Module 0 placeholder, payment-safe page, redirects |
| `lib/academy-routes.ts` | Untracked | Route constants and payment feature flag |

Local environment files and backups were excluded from analysis. No secret values were read or recorded.

## Audit coverage

Audited: `app`, `components`, `lib`, `hooks`, `types`, `scripts`, `supabase`, `public`, configuration, documentation, generated `repomix-output.xml`, untracked source, and Git history. The repository has no project-owned `contexts`, `providers`, `data`, `content`, `styles`, `middleware`, or `tests` directories. Provider behavior lives in `app/providers.tsx`; styling lives in `app/globals.css`.

## Counts

| Measure | Count | Counting rule |
|---|---:|---|
| Current committed page routes | 12 | `page.tsx` at HEAD |
| Current worktree page routes | 17 | HEAD plus five untracked page routes |
| Current API route files | 22 | `app/api/**/route.ts` |
| Current route files total | 39 | 17 pages plus 22 API routes |
| Historical deleted route/service surfaces | 7 | Former shell Academy, two loaders, checkout, check-payment, Stripe service, payment migration/check script grouped in route map |
| Member product areas found | 12 | Entry/access, dashboard, Academy, account/wallet, positions/vault, referrals, tickets/status, rewards, VIP, news, invite redemption, purchase preview |
| Administrator UIs found | 1 | `/admin/rewards` only |
| Administrator API endpoints found | 8 | Reward health/status/summary/jobs/transactions/worker/retry/cancel |
| Modules | 13 | Module 0 plus Modules 1-12 |
| Lessons | 77 | Source literals in the Academy component |
| Assessments | 13 | One quiz per module |
| Questions | 130 | Ten per assessment |

## Product surfaces

| Surface | Source evidence | State | Decision | `apps/member` target |
|---|---|---|---|---|
| Authentication entry/session bridge | `app/page.tsx`, `app/root-entry-page.tsx`, `components/auth/PrivyTokenCookieBridge.tsx` | Working but coupled to Vercel routes | Adapt to member UI plus Railway API session verification | `/login`, shell auth boundary |
| Dashboard | `components/backoffice/DashboardLanding.tsx` | Working; news dependency is public and unauthenticated | Retain layout intent; rebuild data cards | `/dashboard` |
| Academy | `app/academy/page.tsx`, `iron-vault-academy-unlocked.jsx` | Content-rich, route/shell mismatch, insecure scoring | Rebuild inside shared shell | `/academy/**` |
| Account/profile | `AccountPanel.tsx`, profile API | Read-only and useful | Retain/adapt | `/account` |
| Wallets/balance | profile API, `ivt-solana-wallet.ts`, Vault/Account UI | Useful discovery/balance behavior; weak fallback ownership inference | Use canonical challenge verification and explicit primary/reward wallet selection | `/account/wallets` |
| Positions/token/royalty records | `VaultPage.tsx`, positions API | Working defaults but mixed real and hard-coded `NO` values | Split authoritative records from explanatory UI | `/positions`, `/vault` |
| Referrals | `ReferralHub.tsx`, referrals API | Working lead capture; commission tracking explicitly pending | Retain lead flow; rebuild referral URL and status ownership | `/referrals` |
| Support/status | `StatusDesk.tsx`, tickets API | Working member create/list; no admin ticket UI | Retain and add admin operations | `/tickets`, `/status` redirect or summary |
| Rewards | member and admin reward pages | Working automatic payout pipeline but prohibited | Retain eligibility concepts; rebuild manual review/fulfillment ledger | `/rewards`, `/admin/rewards` |
| VIP | `VIPGate.tsx`, `VIPPartnerPage.tsx` | Shared code gate, not role/tier authority; large promotional surface | Product/legal review; replace code gate with entitlement/role authorization if retained | `/vip` |
| Daily DeFi news | `DailyDefiNewsModal.tsx`, crypto-news API | Working best-effort RSS aggregator | Optional retain; move external fetch/cache to API | Dashboard section or remove by product decision |
| Data export/settings/notifications | No implementation | Missing | Design only after verified purpose | `/data-export`, `/settings`; notifications remain undecided |
| Admin users/entitlements/payments/curriculum/tickets/reports | No rendered UI | Missing | Required canonical admin surfaces | `/admin/**` |

## Shell findings

- Desktop sidebar and mobile drawer share one `NAV_ITEMS` definition.
- Header displays email on desktop, role, and XP. Sidebar displays tier.
- No notification center, account menu, wallet summary, membership status explanation, or route-level loading transitions exist.
- Logout calls Privy `logout()` but does not explicitly clear the server cookie; the access-required reset path does clear both cookie names.
- The dashboard route group is entitlement-protected server-side.
- Current committed `/academy` sits outside the dashboard route group, so entering Academy drops the shared member shell. A historical deleted `app/(dashboard)/academy/page.tsx` proves the Academy previously rendered inside it.
- The target must preserve one shell and nest Academy beneath it.

## Authentication and authorization findings

- Privy proves identity; `privy_user_id` is the stable external subject.
- `requireMemberAccess()` correctly separates authentication from paid entitlement.
- `MEMBER` role alone does not grant paid access. `ADMIN` bypasses ordinary entitlement checks.
- Active entitlement matching uses Privy subject, email, or wallet and checks expiry.
- Single-module access is limited to Modules 1-6. Full access grants Modules 1-12.
- Backoffice profile/positions/referrals/tickets APIs require only Privy authentication, while their pages are enclosed by the entitlement-gated dashboard layout. This defense depends on the UI route; direct API callers can create/read those records without a paid entitlement.
- The current canonical target incorrectly creates each new Privy identity with `membershipStatus = ACTIVE` and `membershipSource = PRIVY_SIGN_IN`. This must be removed before migration.
- The legacy education layer creates synthetic Supabase Auth users. This is rejected; map Privy subject directly to one canonical internal UUID.

## Curriculum and assessment findings

- The authoritative legacy curriculum is source-code-only in `iron-vault-academy-unlocked.jsx`.
- The component contains Module 0, twelve paid modules, 77 lessons, and 130 questions.
- No module beyond 12 exists in current files, generated snapshots, branches, or history.
- Answer keys are shipped to the browser. The browser calculates `score` and `passed`, and the API stores both without verifying selections.
- A caller can submit an arbitrary passing result for an entitled reward module; the latest passed row can trigger verified completion, XP, milestone eligibility, payout job creation, and immediate processing.
- Canonical scoring must be server-authoritative and transactional. See `ASSESSMENT-SECURITY-AUDIT.md`.

## Data findings

Legacy migrations define profiles, positions, referral leads, tickets, entitlements, invites, module completions, milestones, payout jobs, and payout transactions. Code also references undocumented `profiles`, `progress`, `quiz_results`, and `iv_payments`. The `iv_payments` migration exists only in Git history. No RLS policies are defined; RLS is enabled while server-role code bypasses it.

The current canonical database is SQLite/LibSQL shaped and Academy-only. Its identity, linked account, wallet challenge, progression, unlock, and idempotent XP concepts are reusable, but the production target must be PostgreSQL in `packages/db` and must add the complete back office domain.

## Reusable backend behavior

- Privy access-token verification and external-subject mapping.
- Active entitlement lookup, expiry handling, admin bypass, full/single-module scopes.
- Invite validation concepts: normalized code, identity binding, expiry, use limits, idempotency.
- Signed Stripe webhook verification, live/test mode guard, server retrieval of paid Checkout Session, unique provider-session fulfillment.
- Profile/referral/ticket/position shapes and member-scoped queries.
- Canonical wallet challenge/signature verification and primary/reward selection from the current EDU Vault.
- Curriculum/progress concepts, sequential unlocks, latest-attempt semantics, and idempotent XP ledger concepts after security redesign.
- Reward milestones, wallet readiness, and audit concepts only.

## Unsafe or rejected behavior

- Client-authoritative quiz score and pass state.
- Browser-delivered answer keys.
- Synthetic Supabase Auth shadow users and service-role coupling.
- Automatic Solana transfer, signer secret use, token-account creation, worker retries, immediate payout, and cron/worker trigger routes.
- Unauthenticated orientation-qualified endpoint that forwards caller-controlled data to GHL.
- Shared VIP code as authorization.
- Privy sign-in automatically becoming paid membership in the current canonical target.
- Privileged mutations from the member-rendering app.
- Current wallet fallback that recursively scans arbitrary Privy user fields for Solana-shaped strings.

## Canonical gaps

The current canonical EDU Vault has one path, one module, three lessons, no assessments, no entitlements, no payments ledger, no backoffice profile/positions/referrals/tickets/rewards/VIP domain, no complete shell, and only one limited admin inspection page. It also uses a local SQLite/LibSQL schema and Vercel API routes that conflict with the locked Railway/Supabase architecture.

## Human product decisions

1. Module 0 account/lead-capture rule: sign-in before viewing, before assessment, or only before saving qualification.
2. Whether the worktree public `/learn` and `/learn/pay` pages belong later in `apps/web` or should be discarded.
3. Whether VIP promotional content is retained, rewritten, or removed, and what authoritative grant creates VIP access.
4. Whether `/status` is a support-ticket alias, a separate operational-status page, or removed.
5. Which position, royalty, dividend, token-balance, and portfolio fields are authoritative versus display placeholders.
6. Referral commission rules and referral-link destination.
7. Whether Daily DeFi news remains a product feature.
8. Curriculum legal/content review, especially financial, tax, regulatory, product, token, roadmap, and return-related claims.
9. Exact reward milestones/amount descriptions under the manual-only model.
10. Retention/export policy and administrator permission matrix.

## Stop condition

Phase 0.5 archaeology and migration design are complete in these documents. No workspace restructuring, application code transplant, deployment, database write, GHL write, production change, or legacy repository modification was performed.
