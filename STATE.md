# State

## 2026-07-14 Phase 0.5 member archaeology

- Completed a read-only full-repository audit of `/home/vupi-projects/member.ironvaulttoken.com` at branch `academy-free-course-modules-7-12`, committed HEAD `29f6223`, with dirty worktree provenance kept separate.
- Verified 17 current worktree page routes, 22 API route files, one administrator UI, 13 modules, 77 lessons, 13 assessments, and 130 questions.
- Audited the member shell, navigation, backoffice surfaces, curriculum, assessment security, identity/entitlements, tables, payments, wallets, rewards, scripts, public assets, documentation, generated repository snapshot, and 96-commit all-branch history.
- Confirmed no curriculum beyond Module 12 and corrected the unsupported Modules 1-22 claim.
- Locked the product correction: `apps/member` is the complete member back office and Academy lives inside it; no `apps/academy` or second portal.
- Locked server-authoritative assessment scoring and manual-only rewards with no signer/send/retry path.
- Created the Phase 0.5 audit, route, navigation, data, API, curriculum, security, entitlement, migration, and gap documents.
- No workspace restructure, code transplant, dependency install, build, test, migration, deployment, database write, GHL write, production change, or legacy repository modification occurred.
- Next executable phase remains workspace establishment only after this archaeology/design set is reviewed.

## 2026-07-15

- Phase 0 audit completed across `/srv`, corrected live root `/home/vupi-projects`, and dated backups.
- Six required `/srv` audit/migration documents created.
- Canonical repository selected: `/srv/EDU Vault`.
- Branch created: `consolidation/iron-vault-platform`.
- No code transplant, dependency install, build, test, migration, deployment, database write, CRM write, or production change has occurred on this branch.
- Next executable phase: create the workspace in-place, preserve current behavior, then port the PostgreSQL schema/auth/Academy invariants through reviewed commits.

## Member Back Office restoration - 2026-07-15

- `apps/member` is now a runnable Next.js application with an explicit local mock session and a future API mode.
- Restored routes: `/dashboard`, `/academy`, `/rewards`, `/vault`, `/positions`, `/referrals`, `/vip`, `/status`, `/support`, `/account`, and `/admin/rewards`.
- Academy and back-office pages share one responsive shell, navigation system, design-token layer, and state system.
- Privy remains the real-auth boundary. Login does not create or imply a paid entitlement.
- Rewards and administrator rewards are read/review-only; no signer, transfer, worker, retry, or cron path exists in this app.
- Remaining work is backend hookup through the typed adapter contracts. It does not block local interface use.
