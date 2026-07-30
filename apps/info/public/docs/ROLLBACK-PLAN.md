# Rollback Plan

Until cutover, legacy Vercel projects remain the rollback target.

1. Freeze customer-facing activation and external GHL writes.
2. Promote the last verified Vercel web/member deployments or restore legacy production aliases.
3. Remove/rollback the `api.ironvaulttoken.com` alias without deleting Railway services.
4. Stop Railway worker/scheduler consumption safely; preserve jobs/events/dead letters.
5. Roll application code back before database schema. Database migrations must be expand/contract and backward compatible through the rollback window.
6. Revoke/rotate newly exposed credentials if compromise is suspected.
7. Reconcile payments, entitlements, DNC, GHL mutations, appointments, and reward reviews from immutable ledgers before resuming.
8. Record incident timeline, affected IDs, rollback artifact/deployment IDs, data repair, and approval to resume.

Never delete events, jobs, audit rows, payment records, entitlement grants, or reward history to simulate rollback.

