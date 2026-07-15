# Repository Migration Map

The detailed, attributed backlog is `/srv/LEGACY-MIGRATION-BACKLOG.md`.

| Source | Retain | Reject/replace | Target |
|---|---|---|---|
| Current canonical repository at current audit baseline `d9c55ae` (original Phase 0 code baseline recorded separately as `3594e54`) | Public/Academy UI, Privy verification, stable identity, wallet challenge, normalized learning domain, progression, XP tests | LibSQL/Turso, privileged Vercel routes, automatic paid membership on Privy sign-in, minimal three-lesson curriculum, Academy-only shell | `apps/web`, `apps/member`, `packages/auth`, `packages/academy`, `packages/db` |
| `/srv/iron-vault-automation` based on `bd39b10` working tree | Webhook ledger, durable jobs, outcomes, DNC, reconciliation, reporting, health/logging | PM2/local PG deployment, empty handlers, disabled integration claims, re-serialized webhook signature | Railway apps, `packages/ghl`, `packages/observability`, `packages/db` |
| legacy public `b743c23` plus reviewed dirty provenance | Exact live homepage, authenticated Stripe checkout/metadata concepts | Duplicate member backend, client-ID manual/USDC routes | `apps/web`, `packages/payments` |
| legacy member branch `academy-free-course-modules-7-12` at `29f6223` plus separately reviewed dirty provenance | Complete member backoffice product evidence; one shell; Module 0-12 content, 77 lessons, 130 questions; entitlement/invite/payment/referral/ticket/position/wallet/reward-admin concepts | Supabase Auth shadow users, client scoring, Academy outside shell at current HEAD, direct GHL qualification, automatic payout, signer/cron/retry | `apps/member`, `apps/api`, `packages/auth`, `packages/academy`, `packages/payments`, `packages/rewards`, `packages/db` |

Every transplant commit must record source repository, branch, commit, file, optional digest for dirty provenance, retained behavior, discarded behavior, tests, and rollback boundary.

Phase 0.5 details are in `MEMBER-BACKOFFICE-AUDIT.md`, `MEMBER-GAP-MATRIX.md`, and `MEMBER-MIGRATION-PLAN.md`. No workspace restructure begins before those artifacts are accepted.
