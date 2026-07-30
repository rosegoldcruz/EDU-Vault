# Railway Setup

Status: no Railway project, authentication, or service deployment has been verified.

Create three services from this monorepo after workspace scripts exist:

| Service | Root/build/start contract | Health contract |
|---|---|---|
| API | monorepo root; build API and shared packages; start compiled API | `/health` liveness, `/readiness` database/dependency readiness, `/metrics` |
| Worker | monorepo root; build worker and shared packages; start durable worker | process liveness plus persisted heartbeat/job-lag/dead-letter checks |
| Scheduler | monorepo root; build scheduler and shared packages; start isolated recurring scheduler | persisted scheduler heartbeat and overdue-schedule check |

Commands are not labeled verified until the workspace exists and Railway preview logs prove them. All processes require structured redacted logging, SIGTERM handling, bounded shutdown, safe lease release/recovery, retry/backoff, and non-zero exit on unrecoverable configuration.

The intended production domain is `api.ironvaulttoken.com`. Current read-only evidence is a Vercel deployment-not-found response. Do not change DNS or attach the domain without explicit production approval.

