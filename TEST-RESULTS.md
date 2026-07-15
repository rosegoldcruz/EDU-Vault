# Test Results

## 2026-07-15 Phase 0

No test command was run during the read-only audit.

Static evidence:

- this repository contains focused Academy/domain and rendered-route tests;
- the automation source records 24 passing tests, build, typecheck, and local PostgreSQL migration at its working-tree state;
- legacy public/member repositories have no automated test suites and their current dirty trees are unverified.

All future results must include command, commit, environment, database target class (never a secret/value), pass/fail count, and relevant artifact/log reference.

## Member app - 2026-07-15

| Check | Result |
|---|---|
| `npm run typecheck` in `apps/member` | Pass |
| `npm run lint` in `apps/member` | Pass |
| `npm test` in `apps/member` | Pass, 3/3 contract and safety tests |
| `npm run build` in `apps/member` | Pass; Next.js production artifacts generated |
| Runtime route matrix | Pass; 11/11 routes returned HTTP 200 |
| Visual matrix | Pass; 24/24 captures at 1440x1000, 1024x768, and 390x844 |
| Browser errors | Pass; zero console or page errors |
| Horizontal overflow | Pass; zero failures in the 24-screen matrix |
| Loading/empty/error states | Pass; each shared state rendered successfully |
| Mobile navigation | Pass; drawer opened and navigated to `/academy` |
| Mock write disclosure | Pass; referral submit stated that no production data changed |
