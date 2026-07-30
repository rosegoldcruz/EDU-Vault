#!/usr/bin/env bash
set -euo pipefail

# Ubuntu/Debian bootstrap
apt-get update
apt-get install -y nginx certbot python3-certbot-nginx postgresql postgresql-contrib

npm install -g pnpm pm2

mkdir -p /var/www/certbot
mkdir -p /opt/iron-vault/logs

echo "Bootstrap completed. Configure PostgreSQL user/database and DNS before certbot."
