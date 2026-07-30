#!/usr/bin/env bash
set -euo pipefail

STAMP=$(date +"%Y%m%d-%H%M%S")
BACKUP_DIR="/opt/iron-vault/infrastructure/backups/$STAMP"
mkdir -p "$BACKUP_DIR"

pg_dump "$DATABASE_URL" | gzip > "$BACKUP_DIR/postgres.sql.gz"
tar -czf "$BACKUP_DIR/logs.tar.gz" -C /opt/iron-vault logs

echo "Backup created at $BACKUP_DIR"

# Keep last 14 backups.
cd /opt/iron-vault/infrastructure/backups
ls -1dt */ | tail -n +15 | xargs -r rm -rf
