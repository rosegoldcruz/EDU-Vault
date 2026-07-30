# Member Migration Plan

## Goal

Establish `apps/member` as the complete Iron Vault member back office, with Academy inside its shared shell, while using canonical Privy/wallet foundations, Railway API boundaries, Supabase PostgreSQL, server-authoritative assessment scoring, and manual-only rewards.

No restructuring or migration was executed during archaeology.

## Source and destination

| Role | Repository |
|---|---|
| Product/behavior authority | `/home/vupi-projects/member.ironvaulttoken.com` branch `academy-free-course-modules-7-12`, HEAD `29f6223`, dirty provenance recorded |
| Implementation destination | `/srv/EDU Vault` branch `consolidation/iron-vault-platform`, audit baseline `d9c55ae` |

## Required workspace

```text
apps/web
apps/member
apps/api
apps/worker
apps/scheduler
packages/db
packages/auth
packages/academy
packages/payments
packages/rewards
packages/config
packages/observability
packages/ghl
packages/readymode
```

Do not create `apps/academy`. Do not make the current EDU Vault public homepage the member shell. Do not migrate live public-site behavior into `apps/member`.

## Phase order

### 1. Freeze provenance and acceptance tests

- Record source repo/branch/commit/path for every transplant.
- Hash dirty source files before copying any approved worktree behavior.
- Convert the route, curriculum, entitlement, assessment, and reward rules in this audit into acceptance tests.
- Verify no source environment or generated secret-bearing file enters the canonical repository.

Exit: provenance manifest and failing contract tests describe the intended product.

### 2. Establish workspace without behavior loss

- Convert repository in place to the locked app/package tree.
- Preserve current canonical UI and tests while moving them behind package boundaries.
- Create `apps/member` and `apps/web`; do not call either complete.
- Create Railway app shells with health/readiness only, not fake domain endpoints.

Exit: builds/tests pass and no product behavior is silently removed.

### 3. PostgreSQL foundation

- Port reusable current canonical schema concepts to PostgreSQL Drizzle in `packages/db`.
- Add identity, role, profile, entitlement, invite, backoffice, assessment, payment, manual reward, audit/outbox/job entities.
- Add constraints/indexes/transactions and Data API/RLS posture.
- Keep production database empty until migration approval.

Exit: migration tests and repository tests pass against disposable PostgreSQL.

### 4. Authentication and access

- Port Privy verification to `packages/auth`/`apps/api`.
- Map Privy subject to one internal UUID.
- Synchronize safe linked accounts/wallet candidates without granting paid access.
- Implement access states from `ENTITLEMENT-MODEL.md`.
- Remove current `PRIVY_SIGN_IN -> ACTIVE` behavior.

Exit: tests prove sign-in alone has free scope only; single/full/VIP/admin/revoked/expired behave correctly.

### 5. Member shell and backoffice reads

- Build one `apps/member` shell using legacy navigation evidence and current design foundations.
- Implement dashboard, account, wallets, positions, referrals, tickets, Vault, rewards status, and approved VIP/status surfaces against typed API clients.
- Keep Academy routes nested in this shell.

Exit: desktop/mobile navigation is coherent and each implemented route has loading/empty/error states.

### 6. Curriculum import and Academy

- Import verified 0-12 curriculum source literals with provenance and revision digests.
- Preserve exact text until product/legal review approves edits.
- Build path/module/lesson routes and progression from canonical records.
- Resolve Module 0 capture/access decision before publishing.

Exit: 13 modules, 77 lessons, 13 assessments, and 130 questions reconcile exactly; no answer key in member payload/bundle.

### 7. Server-authoritative assessments

- Implement attempt start/submit contracts.
- Score in API transaction and create completion/unlock/XP exactly once.
- Remove browser score/pass input and latest-failed-attempt completion reversal.
- Emit reward eligibility only after verified completion.

Exit: abuse/concurrency tests pass and a forged browser cannot award progress, XP, eligibility, or CRM qualification.

### 8. Entitlements, invites, and payments

- Implement transactional invite redemption.
- Implement provider-neutral product/grant model.
- Adapt signed Stripe webhook concepts only if Stripe is approved.
- Persist event/transaction/grant chain exactly once; model refund/dispute/revocation.

Exit: payment replay is idempotent and paid access is created/revoked only from trusted evidence.

### 9. Manual rewards

- Convert Modules 1-6 completion evidence into eligibility records.
- Add wallet readiness, review queue, approve/reject/cancel, manual fulfillment reference, immutable audit.
- Import historical transactions as references only after reconciliation.
- Prove no signer, send, token-account creation, transfer retry, or transfer cron exists.

Exit: end-to-end manual workflow passes with zero transfer capability.

### 10. Admin and operations

- Add users, entitlements, curriculum, rewards, payments, tickets, and reports admin surfaces.
- Add role/permission checks and mutation audit.
- Add export, worker jobs, dead letters, reconciliation, metrics, redacted logs.

Exit: administrator workflows are auditable and least-privileged.

### 11. Data migration rehearsal

- Read-only export legacy source tables.
- Reconcile Privy identities, duplicate email/wallet matches, entitlement status, progress indexes, and historical rewards.
- Run dry-run import into disposable PostgreSQL; compare counts and exceptions.
- Produce human exception queue. Do not apply production migration without explicit approval.

Exit: signed reconciliation report with zero unexplained count drift.

### 12. Cutover and rollback planning

- Only after product decisions, credentials, legal/content review, tests, rehearsal, and explicit deployment authorization.
- Define traffic, webhook, database, and member-session rollback boundaries.
- Preserve legacy repositories read-only until retention approval.

## Retain/adapt/reject map

| Legacy/current capability | Decision | Target |
|---|---|---|
| Backoffice shell/navigation | Adapt | `apps/member` |
| Privy verification/internal UUID concepts | Adapt current canonical | `packages/auth` |
| Wallet challenge/signature verification | Retain current canonical concept | `packages/auth`, `apps/api` |
| Entitlement scopes/admin bypass | Adapt legacy | `packages/auth`, `packages/db` |
| Curriculum 0-12 | Import exactly with provenance | `packages/academy`, PostgreSQL |
| Client quiz scoring | Reject | Server scoring |
| Shadow Supabase Auth users | Reject | Direct user UUID mapping |
| Profile/positions/referrals/tickets | Rebuild through typed repos | `apps/member`, `apps/api`, `packages/db` |
| Signed Stripe webhook/idempotency | Adapt if provider approved | `packages/payments`, `apps/api/worker` |
| Automatic reward transfer | Reject completely | Manual reward ledger only |
| GHL orientation direct webhook | Reject | Persisted verified event then worker sync |

## Migration proof

Each transplant commit records source path/commit/digest, retained behavior, rejected behavior, target package, tests, and rollback boundary. Every data rehearsal produces source count, mapped count, skipped count with reason, duplicate/conflict count, target count, and digest/sample verification. Secrets and `.env` files are never committed or logged.

## Restoration implementation update - 2026-07-15

The first visible migration slice is implemented in `apps/member`. It restores the legacy information architecture and route behavior inside one Academy-aligned shell. Backend dependencies are isolated behind typed adapters, so UI work no longer waits on database, payment, reward, GHL, Railway, or Supabase expansion.

The next implementation step is adapter replacement only: connect each existing response contract to the canonical API without restructuring the rendered product. Reward surfaces must remain read/review-only.
