# Build Log

## 2026-07-14 Phase 0.5 member archaeology

No build, test, migration, dependency install, application execution, or deployment was run. This phase was documentation-only and required read-only legacy inspection before restructuring.

Verification performed:

- Confirmed legacy branch/HEAD and dirty status without modifying it.
- Captured separate committed-HEAD and worktree snapshots excluding dependencies, generated build output, and environment files.
- Enumerated current and historical routes/files across all branches.
- Deterministically extracted 13 modules, 77 lessons, 13 assessments, and 130 question/answer sets from the committed curriculum literals.
- Compared current canonical schema/auth/routes with legacy behavior.
- Checked generated documents for required filenames, route/count coverage, unsupported module claims, prohibited reward behavior, and source/target provenance.

Runtime verification is intentionally deferred because no application code was changed and workspace restructuring is the next separately authorized phase.

## 2026-07-15 Phase 0

No build was run. This was intentional: the audit contract prohibited modifying repositories before the repository/capability maps and canonical decision were complete, and existing build commands write generated artifacts. Historical artifacts do not prove current HEAD.

Branch creation and documentation generated no runtime or deploy artifact.

## 2026-07-15 - Member Back Office restoration

- Established the standalone `apps/member` Next.js application.
- Restored the legacy shell, desktop sidebar, mobile drawer, topbar, member identity, XP, wallet readiness, active-route state, and administrator navigation.
- Restored 11 member/admin routes and centralized the rendered page hierarchy in reusable screen components.
- Added typed `mock` and `api` adapters for identity, membership, dashboard, positions, referrals, tickets, rewards, wallet, VIP, status, and Academy summary.
- Added shared loading, empty, error, table, form, modal, tabs, progress, wallet, and membership primitives.
- Applied the canonical Academy-inspired purple, electric-green, white, and dark visual system.
- Verified 24 screenshots across desktop, tablet, and mobile with no overflow or browser errors.
- No deployment or production-system write occurred.
