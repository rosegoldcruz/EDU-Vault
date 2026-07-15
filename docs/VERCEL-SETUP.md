# Vercel Setup

Status: legacy production sites remain active; canonical projects are not linked or deployed.

- Create or reconfigure exactly two projects with roots `apps/web` and `apps/member`.
- Use Git preview deployments for the consolidation branch. Build and test the preview artifact before promotion; production aliases remain on legacy projects until cutover.
- Scope Preview variables to staging Railway/Privy endpoints. Never give previews production database or production Privy secrets.
- Only browser-safe variables may use `NEXT_PUBLIC_`. `PRIVY_APP_SECRET`, PostgreSQL URLs, payment webhook secrets, GHL tokens, Supabase service-role keys, and signer material must not exist in Vercel application environments.
- Pin CLI/package versions if custom CI is introduced. `VERCEL_TOKEN`, `VERCEL_ORG_ID`, and project IDs belong only in CI secret storage.
- Prefer promotion of a verified preview artifact over an untested production rebuild.
- Rollback is alias promotion to the last verified deployment; see `docs/ROLLBACK-PLAN.md`.

The homepage is a migration, not a redesign. Visual comparison against live `www.ironvaulttoken.com` is a release gate.

