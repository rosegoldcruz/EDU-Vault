# Iron Vault Production Server Setup

## 1) Install base services

```bash
sudo infrastructure/scripts/bootstrap-server.sh
```

Install and start Redis only if you decide to use queues/caching.

## 2) PostgreSQL local-only binding

Set in `postgresql.conf`:

```conf
listen_addresses = '127.0.0.1'
```

Set in `pg_hba.conf`:

```conf
host all all 127.0.0.1/32 scram-sha-256
```

Create app role and database:

```sql
CREATE ROLE iron_vault WITH LOGIN PASSWORD 'change_me';
CREATE DATABASE iron_vault OWNER iron_vault;
```

## 3) Nginx virtual hosts

### Isolated Stage 1 VPS hostname

The production-mode staging process uses `staging.ironvaulttoken.com` without
claiming any current production hostname. Install the HTTP-only staging site:

```bash
sudo cp \
  infrastructure/nginx/iron-vault-staging.conf \
  /etc/nginx/sites-available/iron-vault-staging.conf
sudo ln -s \
  /etc/nginx/sites-available/iron-vault-staging.conf \
  /etc/nginx/sites-enabled/iron-vault-staging.conf
sudo nginx -t
sudo systemctl reload nginx
```

Before public DNS exists, map the hostname to the VPS (`74.115.172.219`) in the
tester workstation's hosts file, or validate from the VPS with:

```bash
curl --noproxy '*' \
  --resolve staging.ironvaulttoken.com:80:74.115.172.219 \
  http://staging.ironvaulttoken.com/api/health
```

Start only the production web process with the staging environment:

```bash
pnpm install --frozen-lockfile
pnpm --filter web build
pm2 start ecosystem.config.cjs --only iron-vault-web --env staging
pm2 save
sudo systemctl enable --now pm2-root
```

PM2 reads the VPS-local `DATABASE_URL` from
`/opt/iron-vault/secrets/database.env`; that file must remain root-owned and
mode `0600`.

Privy's embedded wallet requires a secure HTTPS context. The HTTP staging host
can validate nginx, PM2, the production bundle, public pages, static assets,
health checks, database connectivity, and unauthenticated API boundaries, but
member routes will fail during Privy hydration until Stage 2 HTTPS is enabled.

Do not run Certbot until `staging.ironvaulttoken.com` publicly resolves to this
VPS. After explicit DNS authorization:

```bash
sudo certbot --nginx -d staging.ironvaulttoken.com
```

Then add `https://staging.ironvaulttoken.com` to Privy's allowed origins and
the Authorize.Net sandbox callback configuration before authentication and
payment end-to-end testing.

### Primary hosts — not enabled during staging

```bash
sudo cp infrastructure/nginx/iron-vault.conf /etc/nginx/sites-available/iron-vault.conf
sudo ln -sf /etc/nginx/sites-available/iron-vault.conf /etc/nginx/sites-enabled/iron-vault.conf
sudo nginx -t
sudo systemctl reload nginx
```

## 4) TLS via certbot

Run once DNS records resolve to the server:

```bash
sudo certbot --nginx \
  -d ironvaulttoken.com \
  -d member.ironvaulttoken.com \
  -d api.ironvaulttoken.com
```

`info.ironvaulttoken.com` is a separately managed legacy site and is intentionally
outside this repository's application, process, certificate, and nginx configuration.

## 5) App env and first boot

```bash
cp .env.example .env
pnpm install
pnpm build
pnpm db:migrate
pnpm --filter @iron-vault/api db:seed
pm2 start ecosystem.config.cjs
pm2 save
pm2 startup
```

## 6) Operational checks

```bash
pm2 status
pm2 logs --lines 100
curl -I https://ironvaulttoken.com
curl -I https://member.ironvaulttoken.com
curl -I https://api.ironvaulttoken.com/health
```

## 7) Backups

```bash
export DATABASE_URL='postgresql://iron_vault:change_me@127.0.0.1:5432/iron_vault'
infrastructure/scripts/backup.sh
```

Backups are written under `infrastructure/backups/`.
