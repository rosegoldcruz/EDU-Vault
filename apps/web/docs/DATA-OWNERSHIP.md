# Data Ownership

## Supabase PostgreSQL

Owns internal users, Privy mappings, linked accounts, roles, entitlements, wallets/challenges, curriculum, assessments/attempts, progress/unlocks, XP events, payment events/grants/revocations, reward eligibility/review/fulfillment, referrals, GHL mappings, webhook ledger, jobs/dead letters, DNC audit, reconciliation checkpoints, reports, and mutation audit.

It also owns member profiles, positions/royalty records, referral codes/leads, support tickets/messages, export requests, curriculum revisions/content blocks, assessment answers, fulfillment references, and administrator decision history. Detailed legacy-to-canonical mapping is in `MEMBER-DATA-MODEL-MAP.md`.

## Privy

Owns authentication identity and connected-wallet sessions. The platform stores the stable mapping from Privy subject to internal UUID and independently verifies wallet ownership where required. Privy metadata is not the product authorization store.

## GoHighLevel

Owns CRM outreach state, Voice AI calls, SMS conversations, appointments, opportunities, sales ownership, campaign communication, and channel DND execution. PostgreSQL stores mappings, event history, desired synchronization state, and compliance audit.

## ReadyMode

Owns only representative-side call handling fields that a real ReadyMode interface proves. No speculative data ownership is allowed.

## Browser applications

Own presentation and ephemeral UI state only. They never own authoritative progress, score, entitlement, reward, payment, DNC, or CRM mutation state.

`apps/member` may hold an access-scope projection for rendering, but the API re-authorizes every protected request. Correct assessment answers and privileged database credentials never enter browser payloads or bundles.

## Railway applications

- `apps/api` owns verified request handling and transactional mutations.
- `apps/worker` owns persisted asynchronous processing, GHL synchronization, exports, retries/dead letters, reconciliation, and reports.
- `apps/scheduler` owns enqueueing due work only.
- None owns or loads a reward asset signer.
