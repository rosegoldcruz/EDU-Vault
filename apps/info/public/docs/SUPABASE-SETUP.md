# Supabase Setup

Status: design locked; project connection and migration verification not yet performed.

1. Use one dedicated development/staging Supabase project before production.
2. Railway processes connect server-side using PostgreSQL URLs. Use a direct/admin connection for migrations and an application/pooler connection appropriate for long-running Railway processes.
3. Do not enable Supabase Auth as the application identity provider and do not create shadow Auth users.
4. Do not deploy product logic as Edge Functions.
5. Keep all service-role/secret material out of Vercel/browser bundles. A service-role key is not required merely to use PostgreSQL.
6. Convert the current Drizzle SQLite schema and automation SQL into one reviewed PostgreSQL migration history.
7. Add database constraints for stable Privy identity, one verified wallet owner, one primary/reward wallet, challenge replay/expiry, idempotent progress/XP/payment/grants/jobs, and manual reward state transitions.
8. If any schema is exposed through Supabase Data API, explicitly review grants and enable RLS with ownership policies. Railway direct-Postgres access remains the privileged mutation path.
9. Run migration list, migrations, idempotent seeds, constraints, advisors, and smoke queries against the real staging project. Record exact results in `TEST-RESULTS.md`.

Required names are documented in `docs/ENVIRONMENT-MATRIX.md`; values must never be committed.

