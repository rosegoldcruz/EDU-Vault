# Member Data Model Map

## Identity rule

Privy authenticates an external subject. Canonical PostgreSQL stores exactly one internal `users.id` UUID for each `privy_subject`. Every member-owned row references that UUID. Email and wallet are mutable linked identities, not primary authorization keys. No Supabase Auth shadow user is created.

## Legacy entities

| Legacy entity | Purpose and columns used | Identity/read/write paths | Constraints/indexes/auth | Canonical mapping and decision |
|---|---|---|---|---|
| `iv_user_profiles` | Profile: `id`, `privy_user_id`, `email`, `role`, `current_tier`, `referral_code`, referrer, `vault_xp`, `wallet_address`, timestamps | Read/write by access checks, profile API, wallet resolver, XP sync, grandfather script | Unique Privy ID/referral code; role check; self-referrer FK; RLS enabled without policies; service role bypass | `users`, `user_roles`, `member_profiles`, `referral_codes`; migrate real rows after identity reconciliation |
| `iv_user_positions` | Investment, advance, royalty spent, token balance, dividends, five participation statuses | GET route creates default row; Vault reads | Unique/FK Privy ID; status checks; RLS no policies | `member_positions` plus normalized `position_status_events`; do not create on GET; validate authoritative source |
| `iv_referral_leads` | Name, phone, relationship, best call time, profession, link sent, status | Member GET/POST; profile ensured first | FK Privy ID; member/time index; no status constraint; RLS no policies | `referral_leads` references `users.id`; API ownership predicate; GHL mapping/job separately |
| `iv_status_tickets` | Name/email snapshot, subject, message, admin response, status, last update | Member GET/POST only; no admin UI | FK Privy ID; status check; member/time index; RLS no policies | `support_tickets`, `support_ticket_messages`, status history; admin actions audited |
| `iv_member_entitlements` | Identity selectors, source/status, Stripe IDs, invite code, grant/expiry, metadata | Access checks; invite/Stripe writes; reward tier lookup; grandfather script | Status/source checks; identity-at-least-one check; indexes; unique Stripe session partial index; RLS no policies | `entitlements`, `entitlement_grants`, `entitlement_events`; one user FK, typed scope, source reference; migrate active/history |
| `iv_member_invites` | Code, optional identity binding, status, max/used count, creator, expiry, metadata | Invite redemption read/update | Unique code; usage/status checks; indexes; RLS no policies | `invites`, `invite_redemptions`; transactional lock/increment/grant |
| `profiles` | Only `id` used by education layer | Synthetic Supabase Auth UUID upsert | Schema absent from repo | Reject. Do not migrate shadow identity rows except as a reconciliation input |
| `progress` | `user_id`, `module_index`, `lesson_index` | Education GET and idempotent upsert | Assumed unique triple; schema absent | `lesson_progress` keyed to canonical user/lesson UUID; map indexes to imported curriculum records |
| `quiz_results` | `user_id`, `module_index`, `score`, `passed`, `attempted_at` | Education inserts caller score; latest row read; reward completion source | Schema absent; latest by timestamp | Import only as untrusted legacy attempts with provenance; canonical `assessment_attempts` and `assessment_answers` are server-scored |
| `iv_module_completions` | Privy ID, module 1-6, source/event, timestamps, metadata | Reward eligibility/XP/admin summary | Unique user/module; module 1-6 check; indexes; RLS no policies | `module_completions` keyed to user/module; evidence links to authoritative assessment attempt; import only after validation |
| `iv_reward_milestones` | Privy ID, milestone 1-3, module range, status, eligibility, metadata | Reward sync/status/admin | Unique user/milestone; checks/indexes; RLS no policies | `reward_eligibilities` and `reward_reviews`; translate statuses; no transfer side effect |
| `iv_payout_jobs` | User, milestone/module/reward track, wallet, mint, amount, retry/lock state, metadata | Queue/worker/admin/member status | Partial unique indexes; shape/status checks; RLS no policies | Do not migrate as executable jobs. Import historical records into `reward_legacy_events`/audit and create review records only by approved reconciliation |
| `iv_payout_transactions` | Job, user, milestone/module, wallet, mint, amount, signature, status, raw response | Worker/admin/member status | Unique job/signature; checks/indexes; RLS no policies | `reward_fulfillments` with `method=EXTERNAL_MANUAL`, external reference, immutable audit; preserve historical signatures as references |
| `iv_payments` | Privy ID, email, Stripe customer/session/intent/event, price/tier/amount/currency/status | Current webhook reads/updates if table exists; verification script | Migration deleted from current tree; unique session/event; status check | `payment_events`, `payment_transactions`, `payment_event_processing`, entitlement grant link; signed raw payload digest |
| Wallet information | `iv_user_profiles.wallet_address` plus Privy linked accounts | Profile/reward APIs scan Privy; fallback may update profile | No ownership proof for profile value | `wallets`, `wallet_challenges`, `wallet_verifications`, explicit primary/reward flags; use current canonical signature challenge |
| Token balance | Live Solana RPC query; no durable source | Profile/Vault/reward reads | External RPC; token mint env | Optional cached `wallet_asset_snapshots`; non-authoritative display only |

## Current canonical entities

The current EDU Vault defines `academy_users`, `linked_accounts`, `wallets`, `wallet_challenges`, `learning_paths`, `modules`, `lessons`, `lesson_progress`, `module_progress`, `xp_events`, and `content_unlocks` in SQLite Drizzle.

Reusable concepts:

- Internal UUID separated from Privy subject.
- Linked identity table.
- Wallet ownership challenge and verified selection.
- Normalized path/module/lesson records and publication flags.
- Idempotent lesson progress, content unlock, module progress, and XP source uniqueness.

Required corrections:

- Port schema to PostgreSQL in `packages/db`; SQLite/LibSQL is not production.
- Rename `academy_users` to platform-level `users`.
- Remove default `ACTIVE` membership and `PRIVY_SIGN_IN` paid source.
- Add entitlement, assessment, payment, complete backoffice, reward review, webhook/job/audit, and export domains.
- Move privileged reads/writes to Railway repositories/services.

## Proposed canonical PostgreSQL entities

### Identity and access

| Table | Core fields / invariants |
|---|---|
| `users` | UUID PK, status, primary display fields, timestamps; one platform user |
| `external_identities` | user FK, provider, subject, normalized email/identifier; unique provider+subject |
| `user_roles` | user FK, role, grant/revoke actor/reason/time; effective roles audited |
| `member_profiles` | user FK unique, referral code, tier display, profile fields; no paid authorization |
| `entitlements` | user FK, kind `SINGLE_MODULE/FULL_ACADEMY/VIP`, status, starts/expires, source type/ref, scope JSON or normalized join, timestamps |
| `entitlement_events` | append-only grant/activate/revoke/expire metadata, actor, reason, correlation ID |
| `invites` | hashed/normalized code identity, binding, scope, max uses, expiry, status |
| `invite_redemptions` | invite+user unique, redemption event, entitlement FK |

### Back office

| Table | Core fields / invariants |
|---|---|
| `member_positions` | user FK, typed position category/value/source/as-of; avoid hard-coded display flags |
| `position_status_events` | append-only status history and actor/source |
| `referral_codes` | user FK unique, code unique, state |
| `referral_leads` | owner user FK, contact fields, consent/source/status, optional GHL mapping |
| `support_tickets` | owner user FK, subject, status, priority, timestamps |
| `support_ticket_messages` | ticket FK, author user/system, body, visibility, immutable timestamp |
| `notifications` | only if approved: user, type, payload, read time, source event |
| `data_export_requests` | user, status, requested/completed/expiry, artifact reference, audit |

### Academy

| Table | Core fields / invariants |
|---|---|
| `learning_paths` | slug/version/order/access/publication |
| `academy_modules` | path FK, legacy number, slug, metadata, access and reward policy, publication |
| `lessons` | module FK, slug/order/type/duration/XP/publication/revision |
| `lesson_content_blocks` | lesson FK, order, type, structured payload, source digest |
| `assessments` | module FK, pass threshold, attempt policy, publication/version |
| `assessment_questions` | assessment FK, prompt/order; private API read |
| `assessment_options` | question FK, option ID/text/order, `is_correct`; never in member payload |
| `assessment_attempts` | user/assessment/version, status, score, passed, started/submitted/scored times, idempotency key |
| `assessment_answers` | attempt/question/selected option, correctness snapshot |
| `lesson_progress` | user/lesson status, started/completed, unique pair |
| `module_progress` | user/module aggregates and authoritative completion attempt FK |
| `content_unlocks` | user/content/reason/source event unique |
| `xp_events` | append-only amount/source unique; no direct mutable XP balance required |

### Payments and rewards

| Table | Core fields / invariants |
|---|---|
| `payment_events` | provider/event ID unique, raw body/object storage policy, signature result, mode, received time |
| `payment_transactions` | provider transaction/session, user, product, amount/currency/status unique |
| `payment_event_processing` | exactly-once state, attempts, errors, timestamps |
| `products` / `product_entitlement_rules` | provider-neutral catalog to entitlement scopes |
| `reward_eligibilities` | user, policy/milestone, evidence attempt/completion, wallet readiness, immutable eligibility time |
| `reward_reviews` | eligibility FK unique, pending/approved/rejected/cancelled, reviewer/reason/times |
| `reward_fulfillments` | review FK, method `EXTERNAL_MANUAL`, external reference, recorded by/time; no signer data |
| `reward_audit_events` | append-only transition/event history |

### Platform operations

`webhook_events`, `jobs`, `job_attempts`, `dead_letters`, `audit_events`, `ghl_mappings`, `reconciliation_checkpoints`, and report snapshots belong in the shared canonical database as already defined by architecture documents.

## Authorization expectations

- Browser never receives a database key or privileged repository.
- `apps/api` verifies Privy and resolves canonical user UUID before repository access.
- Member queries include an ownership predicate even when a route is authenticated.
- Admin queries require explicit permission and write an audit event.
- PostgreSQL RLS is defense in depth if tables are Data API exposed; Railway service access remains repository-scoped.
- New Supabase tables are not assumed to be automatically exposed to Data/GraphQL APIs. The design does not require browser Data API access.
- No authorization decision uses user-editable Privy/Supabase metadata.

## Migration decisions

1. Export legacy rows read-only with source table, source PK, timestamps, and digest.
2. Build a Privy-subject-to-canonical-user map; reconcile duplicate email/wallet matches manually.
3. Import profile/backoffice records only after identity mapping.
4. Import entitlements as grants/events preserving source and expiry; do not infer access from role.
5. Import curriculum from source literals with revision provenance.
6. Treat legacy quiz results and module completions as untrusted evidence; approve any reward-bearing migration through reconciliation.
7. Import historical transactions as immutable external fulfillment references, never executable jobs.
8. Validate counts and referential integrity before any cutover. No migration was executed in this phase.
