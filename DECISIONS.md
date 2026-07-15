# Decisions

## D-001: Canonical repository

Use this repository as the single future source of truth. `/srv/iron-vault-automation` and all legacy repositories remain intact source material.

## D-002: Runtime/data architecture

Vercel owns web/member rendering; Railway owns API/worker/scheduler; one Supabase PostgreSQL database owns persistent product/automation data; Privy owns auth/wallet sessions; GHL owns CRM/outreach; ReadyMode remains disabled until verified.

## D-003: Baseline selection

Use this repository for identity/wallet/progression/XP invariants, the legacy member repo for reviewed curriculum/UI concepts, the legacy public repo for exact live public UI/payment concepts, and automation for jobs/DNC/outcomes/reconciliation/reporting.

## D-004: Rejected legacy behavior

Reject Supabase Auth shadow users, client-authoritative quiz results, privileged Vercel mutations, automatic reward transfers/signers/cron, client-ID manual payment routes, alternate production databases, and speculative ReadyMode behavior.

## D-005: One authenticated product

`apps/member` is the complete Iron Vault Member Back Office. Academy is nested within its shared shell. Do not create `apps/academy` or a second member portal.

## D-006: Identity and entitlement separation

Privy sign-in creates or resolves identity only. It does not create paid access. One Privy subject maps to one canonical internal user UUID. `MEMBER` role does not grant paid Academy access; active scoped entitlement does. ADMIN bypass is explicit and audited.

## D-007: Curriculum authority

Use the legacy `iron-vault-academy-unlocked.jsx` at `29f6223` as the current curriculum source: Module 0 plus Modules 1-12, 77 lessons, 13 assessments, and 130 questions. No Module 13+ evidence was found. Do not reduce the product to the three current canonical lessons or manufacture missing content.

## D-008: Server-authoritative assessment

The browser submits selected option IDs only. The Railway API loads the private answer key, scores, records attempts/answers, determines completion, unlocks, and awards XP exactly once in a transaction. Answer keys and caller-supplied scores never become authoritative.

## D-009: Manual-only rewards

Verified education completion may create eligibility. Authorized humans review and approve/reject/cancel. Separate manual fulfillment is recorded by external reference. No API, worker, scheduler, webhook, lesson, assessment, retry, or cron may sign or send tokens or money.

## 2026-07-15 - Restore the visible back office before backend expansion

- **Decision:** Recreate the legacy member route and component hierarchy in `apps/member` using centralized typed mock/API adapters.
- **Reason:** The member product must be visible and testable while canonical services are still being connected.
- **Guardrails:** Mock mode is explicit, mock writes disclose non-persistence, Privy remains the production identity provider, and login never grants membership.
- **Visual system:** Use `#760CBC`, `#56E628`, and `#FFFFFF` through shared tokens and primitives derived from the canonical Academy direction.
- **Rejected:** Supabase Auth shadow users, automatic reward transfer, Solana signing, reward workers/cron/retries, shared VIP master codes, caller-authoritative scoring, and caller-controlled webhook destinations.
