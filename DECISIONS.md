# Decisions

## D-001: Canonical repository

Use this repository as the single future source of truth. `/srv/iron-vault-automation` and all legacy repositories remain intact source material.

## D-002: Runtime/data architecture

Vercel owns web/member rendering; Railway owns API/worker/scheduler; one Supabase PostgreSQL database owns persistent product/automation data; Privy owns auth/wallet sessions; GHL owns CRM/outreach; ReadyMode remains disabled until verified.

## D-003: Baseline selection

Use this repository for identity/wallet/progression/XP invariants, the legacy member repo for reviewed curriculum/UI concepts, the legacy public repo for exact live public UI/payment concepts, and automation for jobs/DNC/outcomes/reconciliation/reporting.

## D-004: Rejected legacy behavior

Reject Supabase Auth shadow users, client-authoritative quiz results, privileged Vercel mutations, automatic reward transfers/signers/cron, client-ID manual payment routes, alternate production databases, and speculative ReadyMode behavior.

