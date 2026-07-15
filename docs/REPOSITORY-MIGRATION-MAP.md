# Repository Migration Map

The detailed, attributed backlog is `/srv/LEGACY-MIGRATION-BACKLOG.md`.

| Source | Retain | Reject/replace | Target |
|---|---|---|---|
| Current canonical repository at audit HEAD `3594e54` | Public/Academy UI, Privy verification, stable identity, wallet challenge, normalized learning domain, progression, XP tests | LibSQL/Turso, privileged Vercel routes, Cloudflare remnants as production design | `apps/web`, `apps/member`, `packages/auth`, `packages/academy`, `packages/db` |
| `/srv/iron-vault-automation` based on `bd39b10` working tree | Webhook ledger, durable jobs, outcomes, DNC, reconciliation, reporting, health/logging | PM2/local PG deployment, empty handlers, disabled integration claims, re-serialized webhook signature | Railway apps, `packages/ghl`, `packages/observability`, `packages/db` |
| legacy public `b743c23` plus reviewed dirty provenance | Exact live homepage, authenticated Stripe checkout/metadata concepts | Duplicate member backend, client-ID manual/USDC routes | `apps/web`, `packages/payments` |
| legacy member `29f6223` plus reviewed dirty provenance | Module 0-12 content/questions, entitlement/referral/reward-admin UI concepts | Supabase Auth shadow users, client scoring, automatic payout, signer/cron | `apps/member`, `packages/academy`, `packages/payments`, `packages/rewards` |

Every transplant commit must record source repository, branch, commit, file, optional digest for dirty provenance, retained behavior, discarded behavior, tests, and rollback boundary.

