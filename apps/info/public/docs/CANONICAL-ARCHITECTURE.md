# Canonical Architecture

## Product correction

The authenticated product is the Iron Vault Member Back Office. The Academy is one product area inside that back office alongside dashboard, account, wallets, positions, referrals, support, status, rewards, Vault, VIP, settings, export, and administrator tools.

- `apps/member` is the only member portal and owns the complete authenticated shell.
- Academy routes render inside that shell.
- Do not create `apps/academy`.
- Do not treat the current minimal EDU Vault Academy UI as the complete authenticated product.

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
| `apps/member` | Complete member back office, including Academy and administrator UI, using Privy in browser and a typed Railway API client |
| `apps/api` | Privy verification, Academy/payment/wallet/admin/export APIs, signed webhooks, health/readiness/metrics |
| `apps/worker` | Durable event processing, entitlements, GHL sync/outcomes/DND, retries/dead letters/reconciliation/reporting |
| `apps/scheduler` | GHL, DNC, payment, appointment, reward, stuck-state, and daily-report schedules |
| `packages/db` | PostgreSQL Drizzle schema/migrations/client/repositories |
| `packages/auth` | Privy verification, identity mapping, roles/authorization, wallet ownership |
| `packages/academy` | Curriculum, progress, server-authoritative assessments, unlocks, completion, XP, and reward-eligibility evidence |
| `packages/payments` | Provider-neutral payment events and entitlement grants/revocations |
| `packages/rewards` | Manual eligibility, review, approval, rejection, and fulfillment ledger |
| `packages/ghl` | Client, mappings, outcomes, DNC, synchronization |
| `packages/readymode` | Disabled contract until verified |
| `packages/config` | Typed environment validation |
| `packages/observability` | Redacted logs, health, readiness, metrics, audit, reconciliation, reports |

## Request boundary

Browser → Privy session → Railway bearer-token API → PostgreSQL transaction/job → optional GHL mutation. GHL/payment webhooks enter through authenticated Railway routes and are persisted before asynchronous handling. DNC evaluation precedes every outreach mutation. Reward eligibility never invokes asset transfer.

## Member route tree

The expected route tree is documented in `MEMBER-ROUTE-MAP.md`. Its core is `/dashboard`, `/academy/**`, `/account/**`, `/positions`, `/referrals`, `/tickets`, `/rewards`, `/vault`, `/vip`, `/settings`, `/data-export`, and `/admin/**`. Routes are created only when their verified purpose and contract are accepted.

## Member security invariants

- Privy identity does not imply paid entitlement.
- One Privy subject maps to one canonical user UUID; no Supabase Auth shadow user.
- Ordinary `MEMBER` role does not grant paid Academy access.
- Assessment selections are scored by the Railway API; answer keys never reach the browser.
- Vercel member rendering does not perform privileged database mutations.
- No reward path signs or sends assets. Fulfillment is external/manual and recorded by reference.
