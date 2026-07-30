# Environment Matrix

Names only; values are never committed or fabricated.

| Name | Web | Member | API | Worker | Scheduler | Scope |
|---|:---:|:---:|:---:|:---:|:---:|---|
| `NEXT_PUBLIC_API_URL` | ✓ | ✓ |  |  |  | browser-safe per environment |
| `NEXT_PUBLIC_PRIVY_APP_ID` | optional | ✓ |  |  |  | browser-safe, dev/prod separate |
| `NEXT_PUBLIC_PRIVY_CLIENT_ID` | optional | optional |  |  |  | browser-safe when App Clients are used |
| `PRIVY_APP_ID` |  |  | ✓ | optional |  | server-only |
| `PRIVY_APP_SECRET` |  |  | ✓ | optional |  | server-only |
| `PRIVY_VERIFICATION_KEY` |  |  | optional |  |  | server-only |
| `DATABASE_URL` |  |  | ✓ | ✓ | ✓ | server application/pooler PostgreSQL URL |
| `DATABASE_DIRECT_URL` |  |  | migration only |  |  | direct migration/admin PostgreSQL URL |
| `GHL_LOCATION_ID` |  |  | ✓ | ✓ | ✓ | exact location ID |
| `GHL_PRIVATE_INTEGRATION_TOKEN` |  |  | webhook-related optional | ✓ | optional | server-only |
| `GHL_WEBHOOK_PUBLIC_KEY` |  |  | ✓ |  |  | official signature verification if configurable |
| `PAYMENT_PROVIDER` |  |  | ✓ | ✓ | optional | provider selector |
| provider secret/webhook names |  |  | ✓ | ✓ | optional | defined after merchant selection |
| `READYMODE_ENABLED` |  |  |  | ✓ | optional | must default false |
| ReadyMode credential/number names |  |  |  | optional | optional | only after verified contract |
| `IVT_ALLOW_EXTERNAL_MESSAGES` |  |  |  | ✓ |  | must default false through staging |
| `IVT_ALLOW_BULK_ENROLLMENT` |  |  |  | ✓ |  | must default false through staging |
| `IVT_ALLOW_DESTRUCTIVE_WRITES` |  |  | ✓ | ✓ | ✓ | must default false |
| `LOG_LEVEL` |  |  | ✓ | ✓ | ✓ | server-only |
| `PORT` |  |  | ✓ |  |  | Railway-provided/API |
| `NODE_ENV` | ✓ | ✓ | ✓ | ✓ | ✓ | runtime |

Forbidden in browser/Vercel bundles: PostgreSQL URLs, `PRIVY_APP_SECRET`, Supabase service-role/secret keys, GHL tokens, payment secrets/webhook secrets, ReadyMode credentials, wallet signer/private keys.

CI-only Vercel names, if custom CI is adopted: `VERCEL_TOKEN`, `VERCEL_ORG_ID`, and one project ID per frontend project. They are not application runtime variables.

