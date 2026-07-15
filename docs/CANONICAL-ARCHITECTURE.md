# Canonical Architecture

## Locked platform

- Vercel: `apps/web` and `apps/member` only.
- Railway: `apps/api`, `apps/worker`, `apps/scheduler`.
- Supabase: one managed PostgreSQL product and automation data plane.
- Privy: authentication identity and wallet sessions.
- GoHighLevel location `OOxBz4Jalnuam4eNqhvD`: CRM outreach, Voice AI, conversations, appointments, opportunities, ownership, messaging, and channel DND execution.
- ReadyMode: only verified representative-side call handling after transfer.

Supabase Auth is not an identity provider for this platform. Supabase Edge Functions are not a backend. Vercel applications do not perform privileged database mutations. Railway PostgreSQL, LibSQL, Turso, D1, SQLite, JSON files, and local PostgreSQL are not production data planes.

## Logical workspace

| Component | Responsibility |
|---|---|
| `apps/web` | Exact public Iron Vault experience and lead/account entry |
| `apps/member` | One Vaulted Academy/member/admin application using Privy in browser and typed API client |
| `apps/api` | Privy verification, Academy/payment/wallet/admin/export APIs, signed webhooks, health/readiness/metrics |
| `apps/worker` | Durable event processing, entitlements, GHL sync/outcomes/DND, retries/dead letters/reconciliation/reporting |
| `apps/scheduler` | GHL, DNC, payment, appointment, reward, stuck-state, and daily-report schedules |
| `packages/db` | PostgreSQL Drizzle schema/migrations/client/repositories |
| `packages/auth` | Privy verification, identity mapping, roles/authorization, wallet ownership |
| `packages/academy` | Curriculum, entitlements, progress, assessments, unlocks, XP |
| `packages/payments` | Provider-neutral payment events and entitlement grants/revocations |
| `packages/rewards` | Manual eligibility, review, approval, rejection, and fulfillment ledger |
| `packages/ghl` | Client, mappings, outcomes, DNC, synchronization |
| `packages/readymode` | Disabled contract until verified |
| `packages/config` | Typed environment validation |
| `packages/observability` | Redacted logs, health, readiness, metrics, audit, reconciliation, reports |

## Request boundary

Browser → Privy session → Railway bearer-token API → PostgreSQL transaction/job → optional GHL mutation. GHL/payment webhooks enter through authenticated Railway routes and are persisted before asynchronous handling. DNC evaluation precedes every outreach mutation. Reward eligibility never invokes asset transfer.

