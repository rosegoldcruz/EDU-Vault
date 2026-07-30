# Iron Vault Production Monorepo

This repository is structured for one controlled Linux production server hosting:

- `ironvaulttoken.com` (public site)
- `member.ironvaulttoken.com` (member app)
- `info.ironvaulttoken.com` (documentation app)
- `api.ironvaulttoken.com` (API + payments + webhooks)

## Layout

```text
/opt/iron-vault
├── apps/
│   ├── web/
│   ├── member/
│   ├── info/
│   └── api/
├── packages/
│   ├── ui/
│   ├── database/
│   ├── auth/
│   ├── payments/
│   ├── config/
│   ├── types/
│   └── validation/
├── ecosystem.config.cjs
├── pnpm-workspace.yaml
├── turbo.json
├── package.json
└── .env
```

## Domain routing

- `ironvaulttoken.com` -> `localhost:3000`
- `member.ironvaulttoken.com` -> `localhost:3001`
- `info.ironvaulttoken.com` -> `localhost:3002`
- `api.ironvaulttoken.com` -> `localhost:4000`

Nginx config: `infrastructure/nginx/iron-vault.conf`

## PM2 processes

- `iron-vault-web`
- `iron-vault-member`
- `iron-vault-info`
- `iron-vault-api`
- `iron-vault-worker`

PM2 config: `ecosystem.config.cjs`

## Payments flow

Endpoint for frontend:

- `POST /v1/checkout/sessions`

Webhook from Authorize.net:

- `POST /v1/webhooks/authorize-net`

Implementation: `apps/api/src/server.ts`

## Deployment sequence

```bash
cd /opt/iron-vault
git pull
pnpm install --frozen-lockfile
pnpm build
pnpm db:migrate
pm2 reload ecosystem.config.cjs --update-env
```

Verification:

```bash
pm2 status
pm2 logs --lines 100
nginx -t
curl -I https://ironvaulttoken.com
curl -I https://member.ironvaulttoken.com
curl -I https://api.ironvaulttoken.com/health
```

Automated script:

```bash
infrastructure/scripts/deploy.sh
```
