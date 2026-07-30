# Member Gap Matrix

## Legend

- `Reusable`: exists with behavior/concepts worth adapting.
- `Unsafe`: exists but must not be ported as implemented.
- `Incomplete`: exists but lacks required data/workflow/security.
- `Missing canonical`: legacy evidence exists; current EDU Vault lacks it.
- `Missing entirely`: no verified implementation.
- `Decision`: requires human product choice.
- `Credentials`: operation requires approved external credentials.

## Comparison

| Capability | Legacy member portal | Current canonical EDU Vault | Final canonical member app | Exact evidence | Target |
|---|---|---|---|---|---|
| One member shell | Reusable desktop/mobile shell | Academy-only chrome plus separate public nav | One shell for all member/Academy/admin routes | `BackofficeLayout.tsx`; `app/academy/AppChrome.tsx` | `apps/member` |
| Dashboard | Reusable/incomplete | Missing canonical | Member summary with real scoped data | `DashboardLanding.tsx` | `apps/member`, `/v1/me` repos |
| Authentication | Reusable Privy verification | Reusable newer Privy client | Privy -> internal UUID | `privy-auth.ts`; canonical `lib/auth/privy.ts` | `packages/auth`, `apps/api` |
| Paid access separation | Reusable | Unsafe: sign-in creates active membership | Explicit free/single/full/VIP/admin/revoked/expired | `member-access.ts`; canonical `syncAcademyUser()` | `packages/auth`, `packages/db` |
| Member profile | Reusable/incomplete | Academy user identity only | Platform profile | `backoffice-profile.ts`, profile API | `apps/member`, profile repo |
| Account | Reusable read-only | Basic account/wallet page | Profile/account actions | `AccountPanel.tsx`; canonical `/account` | `apps/member` |
| Wallet discovery | Incomplete recursive/fallback scan | Reusable embedded account sync | Explicit provider mapping | `ivt-solana-wallet.ts`; canonical auth/service | `packages/auth` |
| Wallet ownership | Missing legacy proof | Reusable challenge/signature verification | Required for external wallet | canonical wallet challenge routes/service | `packages/auth`, `apps/api` |
| Primary/reward wallet | Missing legacy selection | Reusable | Verified selections | canonical `wallets` schema/service | `apps/member`, wallet repo |
| Positions | Embedded in Vault, incomplete | Missing canonical | Dedicated authoritative list | `VaultPage.tsx`, positions API | `/positions`, positions repo |
| Token balance | Reusable display read | Missing canonical | Read-only snapshot/display | `ivt-solana-wallet.ts` | API adapter/cache optional |
| Royalty records | Incomplete flags | Missing canonical | Typed sourced records/history | `iv_user_positions` | positions tables |
| Dividends/portfolio | Mostly hard-coded `NO` | Missing canonical | Decision/source required | `VaultPage.tsx` | Decision; positions domain |
| Referrals | Reusable lead form/list | Missing canonical | Member-owned leads + optional GHL sync | `ReferralHub.tsx`, referrals API | `apps/member/api/worker`, referral repo |
| Referral commission | Explicitly pending | Missing entirely | Decision required | `ReferralHub.tsx` copy | Decision before schema/UI |
| Referral link | Incomplete origin-root URL | Missing canonical | Approved destination and attribution | `ReferralHub.tsx` | `apps/member/web`, payments/referral rules |
| Support tickets | Reusable member create/list | Missing canonical | Threaded member/admin workflow | `StatusDesk.tsx`, tickets API | ticket repos and routes |
| Admin support | Missing entirely | Missing canonical | Queue, response, status history | No legacy UI | `/admin/tickets`, API |
| Status page | Actually support desk | Missing canonical | Decision: alias/ops status/remove | `/status` | Product decision |
| Vault resources | Reusable/incomplete | Missing canonical | Curated member resources + records | `VaultPage.tsx` | `/vault` |
| VIP surface | Incomplete promotional page | Missing canonical | Approved content and authoritative grant | `VIPGate.tsx`, `VIPPartnerPage.tsx` | `/vip`, entitlement repo |
| VIP shared code | Unsafe | Missing canonical | Do not port | VIP API/env cookie | Replaced by grants |
| Academy overview | Reusable rich UI/content | Minimal overview | Scoped canonical overview in shell | legacy Academy; canonical `/academy` | `apps/member`, Academy API |
| Learning paths | Not explicitly modeled | One reusable path | Versioned paths from imported curriculum/product design | canonical `learning_paths` | Academy tables/package |
| Modules | 13 verified | One module | Import 0-12 | Academy component; canonical content | Academy tables/package |
| Lessons | 77 verified | Three short lessons | Import all with content blocks | Academy component | Academy tables/package |
| Lesson content | Rich source literals | Placeholder sentence per lesson | Exact import then legal review | Academy component | content block tables |
| Progress | Reusable concept, shadow identity | Reusable normalized progress | Canonical UUID and server transitions | `education-actions.ts`; canonical service | Academy repos |
| Sequential unlock | UI-only legacy | Reusable server transaction | Server-authoritative | `modStatus`; canonical `completeLesson()` | `packages/academy` |
| Assessments | 13/130 complete sets | Missing canonical | Server-authoritative attempts | Academy component | assessment tables/API |
| Answer-key security | Unsafe browser exposure | No assessments | Private server-only key | `correct` indexes in JSX | private repository query |
| Scoring | Critical unsafe browser score | Missing | API score from selections | education endpoint | assessment service |
| Retry semantics | Latest attempt can undo completion | Missing | Immutable earned completion policy | `module-completion.ts` | assessment/completion service |
| XP | Legacy module-derived mutable balance | Reusable canonical event ledger | Idempotent events/aggregate | reward milestones; canonical `xp_events` | Academy repo |
| Achievements | Missing entirely | Missing canonical | Decision required | No source | Do not create without purpose |
| Ranks | Missing entirely | Missing canonical | Decision required | No source | Do not create without purpose |
| Badges | Missing entirely | Missing canonical | Decision required | No source | Do not create without purpose |
| Credentials/certificates | Missing entirely | Missing canonical | Decision required | No source | Do not create without purpose |
| Rewards member status | Reusable concepts/unsafe model | Missing canonical | Eligibility/review/fulfillment history | rewards page/API | rewards package/API |
| Reward eligibility | Reusable milestone concept | Missing canonical | Verified completion evidence | reward milestones | reward eligibility repo |
| Automatic payout | Critical unsafe | Absent | Prohibited | signer/worker/cron/routes | No target |
| Human review | Missing | Missing canonical | Required | No legacy workflow | `/admin/rewards`, rewards package |
| Manual fulfillment | Missing | Docs only | External reference/audit | canonical manual ops doc | fulfillment tables/API |
| Reward history | Transfer transaction history | Missing canonical | Immutable eligibility/decision/fulfillment | payouts/transactions | reward audit |
| Invite redemption | Reusable/incomplete transaction | Missing canonical | Atomic redemption/grant | redeem page/API | entitlement API/repo |
| Grandfathered access | Reusable migration evidence | Missing canonical | Preserve as grant source | script/docs/entitlements | migration + entitlement events |
| Payment webhook | Reusable signed/idempotent concepts | Missing canonical | Railway provider adapter | Stripe webhook | payments package/API |
| Checkout | Historical deleted implementation | Missing canonical | Optional provider-neutral API | Git history checkout/stripe service | `apps/api`, payments package |
| Payment history | Historical `iv_payments` only | Missing canonical | Event/transaction/grant chain | deleted migration, webhook | payment tables/admin UI |
| Refund/dispute handling | Missing | Missing canonical | Required before payment cutover | no handled events beyond checkout complete | payments worker/rules |
| Notifications | Missing | Missing canonical | Decision required | No source | Do not create without domain |
| Settings | Missing | Missing canonical | Define approved user preferences | No source | `/settings` after decision |
| Data export | Missing | Missing canonical | Required async request/artifact | No source | member/API/worker |
| Daily DeFi news | Reusable optional | Missing canonical | Decision; API-cached if retained | news component/API | content API/member |
| Admin users | Missing UI | Limited Academy inspection | Complete member inspection | canonical `/admin/academy` | `/admin/users` |
| Admin entitlements | Missing UI | Missing canonical | Grant/revoke/search/audit | legacy APIs only | `/admin/entitlements` |
| Admin curriculum | Missing legacy | Minimal inspection only | Version/publish management | canonical admin page | `/admin/academy` |
| Admin rewards | Exists but transfer-oriented | Missing canonical | Manual review operations | AdminRewardsDashboard | `/admin/rewards` |
| Admin payments | Missing | Missing canonical | Event/transaction/grant inspection | historical/current webhook data | `/admin/payments` |
| Admin tickets | Missing | Missing canonical | Queue/reply/status | ticket data exists | `/admin/tickets` |
| Admin reports | Missing | Missing canonical | Approved reports/async runs | No source | `/admin/reports` |
| Audit history | Fragmented metadata/logs | Missing canonical | Append-only mutation audit | migrations and docs | shared audit repo |
| Loading states | Mixed/blank | Basic route behavior | Stable route/panel states | Providers/components | `apps/member` design system |
| Empty states | Present on several lists | Academy state only | Every list/table | referral/ticket/reward/admin components | `apps/member` |
| Mobile behavior | Reusable shell and responsive grids | Separate Academy chrome | One tested responsive shell | BackofficeLayout | `apps/member` |
| GHL qualification | Unsafe unauthenticated direct write | Docs/integration plan | Verified persisted event -> worker | orientation-qualified API | worker/GHL package |
| External credentials | Privy, Supabase, Stripe, GHL, Solana RPC/signers | Privy/database local | Approved Privy/Supabase/payment/GHL; read-only RPC optional | env references | config package; no signer secret |

## Highest-priority gaps

1. Fix canonical authentication/entitlement separation before member migration.
2. Establish PostgreSQL and Railway service boundaries.
3. Import complete curriculum, not the three canonical placeholder lessons.
4. Build server-authoritative assessments before accepting progress.
5. Build the complete member shell and backoffice domains.
6. Replace automatic payouts with manual review/fulfillment records.
7. Resolve Module 0, VIP, Status, positions, referrals, and content/legal product decisions.

## Visible restoration gap update - 2026-07-15

| Capability | Interface state | Remaining hookup |
|---|---|---|
| Unified member shell | Restored | Privy production-session QA |
| Dashboard | Restored | Dashboard API endpoint |
| Academy entry | Restored in shared shell | Academy summary API and canonical content |
| Rewards | Restored read-only | Eligibility/history API; manual operations remain external |
| Vault and positions | Restored | Position and wallet APIs |
| Referrals | Restored | Referral read/write API |
| VIP | Restored without shared code | Entitlement-backed VIP API |
| Status and support | Restored | Status and ticket APIs |
| Account | Restored | Profile/preferences API |
| Admin rewards | Restored review-only | Role enforcement and review-record API |

The incomplete backend no longer blocks interface review. Mock mode remains local-only and never claims production persistence.
