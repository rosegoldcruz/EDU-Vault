# Go-Live Checklist

- [ ] One canonical workspace and one dependency lockfile.
- [ ] Unified PostgreSQL migrations/seeds pass twice on real Supabase staging.
- [ ] Database constraints/advisors reviewed; no production alternate database.
- [ ] Railway API/worker/scheduler builds, starts, shuts down, restarts, and reports healthy.
- [ ] Privy staging login maps one stable internal user; role/entitlement checks pass.
- [ ] Wallet ownership, replay/expiry, primary/reward constraints pass.
- [ ] Module 0 and the verified paid Modules 1-12 enforce access and sequencing server-side; any later expansion has separately approved content records.
- [ ] Assessment tampering fails; lesson/assessment progress and XP persist exactly once.
- [ ] Duplicate/concurrent payment events grant once; refund/revocation passes.
- [ ] Rewards reach manual review only; no automatic transfer path or signer secret exists.
- [ ] GHL controlled contact sync, outcomes, DNC precedence, opportunities, appointments, and retries pass.
- [ ] Voice AI payload contract and approved responses tested; no production calling activated.
- [ ] ReadyMode remains disabled or controlled transfer dependency is verified.
- [ ] User export, mutation audit, reports, dead letters, reconciliation, metrics, alerts pass.
- [ ] Vercel previews match current homepage/member experience and call staging Railway only.
- [ ] Security, privacy/retention, content/legal, load, failure-injection, and end-to-end staging reviews pass.
- [ ] DNS/domain, production env, migration, promotion, communication, and rollback approvals recorded.
- [ ] Stop before customer-facing activation until explicit approval.
