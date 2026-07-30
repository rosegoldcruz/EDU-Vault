#!/usr/bin/env bash
set -euo pipefail

cd /opt/iron-vault

git pull
pnpm install --frozen-lockfile
pnpm build
pnpm db:migrate
pm2 reload ecosystem.config.cjs --update-env

pm2 status
pm2 logs --lines 100 --nostream
nginx -t
curl -I https://ironvaulttoken.com
curl -I https://member.ironvaulttoken.com
curl -I https://api.ironvaulttoken.com/api/health
