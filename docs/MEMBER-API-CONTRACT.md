# Member API Contract

## Boundary

The canonical API is a versioned Railway service under `/v1`. `apps/member` owns rendering and ephemeral UI state. It sends Privy bearer tokens to `apps/api`. `apps/api` verifies identity, resolves the canonical user UUID, authorizes access, and calls typed `packages/db` repositories inside transactions. Worker/scheduler processes consume persisted events/jobs; they do not accept browser-authoritative identity, score, payment, or reward state.

This document defines contracts and ownership only. No fake endpoints were implemented.

## Conventions

- JSON request/response; UTC timestamps in ISO 8601.
- Stable error envelope: `{ "error": { "code": "...", "message": "...", "requestId": "...", "details": {} } }`.
- Member endpoints derive user from verified token; no request body accepts authoritative `userId`.
- Mutations accept an idempotency key where duplicate external/browser delivery is possible.
- Cursor pagination for lists.
- ADMIN endpoints require explicit permission and create audit events.
- Correct assessment answers, payment secrets, wallet secrets, and privileged raw metadata are never returned.

## Identity and access

| Method/path | Purpose | Input | Output | Owner/dependencies |
|---|---|---|---|---|
| `GET /v1/me` | Current canonical identity | Privy bearer | user ID, profile summary, roles, safe linked-account summary | API; `packages/auth`, users/profile repos |
| `GET /v1/me/access` | Effective member access | bearer | free/single/full/VIP/admin capabilities, allowed module IDs, expiry summaries | API; entitlement repository |
| `GET /v1/me/profile` | Member profile | bearer | profile, referral code, XP aggregate, safe wallet summary | API; profile/XP/wallet repos |
| `PATCH /v1/me/profile` | Edit approved profile fields | validated patch + idempotency | updated profile | API transaction; audit sensitive changes |
| `POST /v1/entitlements/invite-redemptions` | Redeem invite | `{ code }`, idempotency | grant summary/effective access | API transaction; invite + entitlement + audit repos |

## Back office

| Method/path | Purpose | Input/output | Owner |
|---|---|---|---|
| `GET /v1/me/positions` | Authoritative position/token/royalty records | paginated typed records and as-of/source | API; positions repo |
| `GET /v1/me/referrals` | Member-owned lead list | cursor/filter -> leads | API; referral repo |
| `POST /v1/me/referrals` | Submit lead | validated contact/relationship/consent fields | API transaction; referral/outbox; worker may sync GHL |
| `GET /v1/me/tickets` | Member tickets | cursor/status -> tickets | API; support repo |
| `POST /v1/me/tickets` | Create ticket | subject/message/contact snapshot | API transaction; support/audit/outbox |
| `GET /v1/me/tickets/{id}` | Ticket and message timeline | owned ticket ID | API; ownership predicate |
| `POST /v1/me/tickets/{id}/messages` | Member reply | message/idempotency | API transaction |
| `POST /v1/me/data-exports` | Request export | scope/format | API persists request; worker builds artifact |
| `GET /v1/me/data-exports/{id}` | Export status | request ID | API; signed short-lived artifact reference when complete |

## Wallets

| Method/path | Purpose | Security |
|---|---|---|
| `GET /v1/me/wallets` | List embedded/external wallets and primary/reward selection | Safe wallet fields only |
| `POST /v1/me/wallet-challenges` | Create Solana ownership challenge | Valid address; rate limited; nonce hash and expiry persisted |
| `POST /v1/me/wallet-challenges/{id}/verify` | Verify signed challenge | Server verifies exact message/signature/address and single use |
| `POST /v1/me/wallet-selections` | Select verified primary/reward wallet | `{ walletId, selection }`; transaction enforces one of each |

Privy embedded wallets may be synchronized as provider-verified. Arbitrary external wallets require signature challenge. Balance reads are display-only external snapshots and do not prove ownership.

## Academy reads

| Method/path | Purpose | Output restrictions |
|---|---|---|
| `GET /v1/academy/state` | Dashboard/Academy summary | scoped paths, progress, XP, next action |
| `GET /v1/academy/paths` | Published visible learning paths | entitlement-filtered metadata |
| `GET /v1/academy/paths/{slug}` | Path and visible modules | no hidden content bodies |
| `GET /v1/academy/modules/{slug}` | Module metadata, lessons, assessment state | access/prerequisite status |
| `GET /v1/academy/lessons/{slug}` | Lesson content | requires publication, entitlement, unlock; structured blocks |
| `GET /v1/academy/assessments/{slug}` | Assessment public definition/current state | prompts/options only; never correctness |

## Academy mutations

| Method/path | Purpose | Transaction/invariants |
|---|---|---|
| `POST /v1/academy/lessons/{slug}/start` | Start accessible lesson | Resolve user/lesson; verify entitlement/unlock; idempotent progress |
| `POST /v1/academy/lessons/{slug}/complete` | Complete lesson | Verify transition; create progress/unlock/XP once |
| `POST /v1/academy/assessments/{slug}/attempts` | Start attempt | Verify access/prerequisites/retry; bind revision |
| `POST /v1/academy/assessment-attempts/{id}/submit` | Submit option selections | Server score, answers, completion, unlock, XP, reward eligibility in one transaction |
| `GET /v1/academy/assessment-attempts/{id}` | Attempt result | Owner only; score/pass and review, not answer key unless product explicitly allows post-attempt explanations |

## Entitlements and payments

| Method/path | Purpose | Owner |
|---|---|---|
| `GET /v1/me/entitlements` | Member-safe grant/history summary | API entitlement repo |
| `POST /v1/payment-checkouts` | Optional provider-neutral checkout start | API verifies identity and product; provider adapter |
| `POST /v1/webhooks/payments/stripe` | Signed Stripe events | API raw-body signature + event persistence; worker or transactional handler |
| `POST /v1/webhooks/payments/{provider}` | Future adapters only when real provider approved | Same event/idempotency contract |

Payment events are stored exactly once. Product rules create entitlement grants; refunds/disputes create reviewed revocation events. The member app never writes payment/entitlement rows directly.

## Rewards

| Method/path | Purpose | Prohibition |
|---|---|---|
| `GET /v1/me/rewards` | Eligibility, wallet readiness, review decision, fulfillment reference/history | Read only; no send action |
| `GET /v1/admin/reward-reviews` | Filtered review queue | ADMIN/reward-review permission |
| `GET /v1/admin/reward-reviews/{id}` | Evidence, member/wallet, immutable history | Audited inspection |
| `POST /v1/admin/reward-reviews/{id}/approve` | Human approval | Reviewer/reason; no transfer |
| `POST /v1/admin/reward-reviews/{id}/reject` | Human rejection | Required reason |
| `POST /v1/admin/reward-reviews/{id}/cancel` | Cancel pending/approved review under policy | Required reason |
| `POST /v1/admin/reward-reviews/{id}/fulfillments` | Record separate manual fulfillment | External reference, method, notes; cannot sign/send |

No route, worker, scheduler, retry, webhook, lesson, or assessment may create token accounts, load a signer secret, sign a transaction, or send tokens/money.

## Administrator contracts

| Method/path | Purpose |
|---|---|
| `GET /v1/admin/users` / `GET /v1/admin/users/{id}` | Member inspection with scoped related data |
| `GET /v1/admin/entitlements` | Search grants/status/scope |
| `POST /v1/admin/entitlements` | Audited manual grant with reason |
| `POST /v1/admin/entitlements/{id}/revoke` | Audited revocation; no deletion |
| `GET/POST/PATCH /v1/admin/academy/...` | Versioned curriculum management with publish workflow |
| `GET /v1/admin/payments` / `GET /v1/admin/payments/{id}` | Payment/event/grant chain inspection |
| `GET /v1/admin/tickets` | Ticket queue |
| `POST /v1/admin/tickets/{id}/messages` | Admin response |
| `POST /v1/admin/tickets/{id}/status` | Audited status transition |
| `GET /v1/admin/reports` | Approved report catalog/runs |
| `POST /v1/admin/reports` | Persist report request; worker execution |

Curriculum mutation endpoints are included only because administrator curriculum management is a verified target requirement. Their exact authoring/version/publish workflow needs product approval before implementation.

## Async ownership

- `apps/api`: verify, authorize, validate, transact, persist webhook/job/outbox, return response.
- `apps/worker`: GHL sync, export generation, webhook follow-up, reporting, retries/dead letters, reconciliation. Never asset transfer.
- `apps/scheduler`: enqueue due reconciliation/report/expiry checks. Never call transfer behavior.
- `packages/db`: schema, migrations, typed repositories, transactions.
- `packages/auth`: Privy verification, user mapping, roles/permissions, wallet ownership.
- `packages/academy`: curriculum/progression/server scoring/XP/reward eligibility events.
- `packages/payments`: provider adapters/event normalization/product-to-entitlement rules.
- `packages/rewards`: eligibility/review/approval/rejection/cancel/manual fulfillment ledger.

## Required external credentials

Privy server credentials, Supabase PostgreSQL connection, and any approved payment webhook credentials are required to operate relevant contracts. GHL credentials are required only for worker-owned sync after a verified persisted event. Solana RPC may support read-only balance snapshots. No reward-wallet secret key is permitted.
