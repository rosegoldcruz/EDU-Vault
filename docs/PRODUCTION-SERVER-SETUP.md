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
  -d info.ironvaulttoken.com \
  -d api.ironvaulttoken.com
```

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
curl -I https://info.ironvaulttoken.com
curl -I https://api.ironvaulttoken.com/health
```

## 7) Backups

```bash
export DATABASE_URL='postgresql://iron_vault:change_me@127.0.0.1:5432/iron_vault'
infrastructure/scripts/backup.sh
```

Backups are written under `infrastructure/backups/`.
