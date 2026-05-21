#!/usr/bin/env bash
# Backup MySQL database for aumraj-crm.
# Usage: ./scripts/backup-db.sh production
# Requires DATABASE_URL in .env.production or .env.local (via symlink).
set -euo pipefail

ENV="${1:-}"
if [[ "$ENV" != "production" ]]; then
  echo "Usage: $0 production"
  exit 1
fi

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

ENV_FILE=".env.production"
if [[ ! -f "$ENV_FILE" ]]; then
  echo "ERROR: $ENV_FILE not found."
  exit 1
fi

# shellcheck disable=SC1090
source "$ENV_FILE"

if [[ -z "${DATABASE_URL:-}" ]]; then
  echo "ERROR: DATABASE_URL not set in $ENV_FILE"
  exit 1
fi

BACKUP_DIR="${ROOT}/backups"
mkdir -p "$BACKUP_DIR"
TIMESTAMP="$(date +%Y%m%d_%H%M%S)"
OUTPUT="${BACKUP_DIR}/production_${TIMESTAMP}.sql.gz"

echo "==> Backing up production database..."
mysqldump \
  --single-transaction \
  --routines \
  --triggers \
  --hex-blob \
  --databases production \
  | gzip > "$OUTPUT"

echo "Backup saved: $OUTPUT ($(du -h "$OUTPUT" | cut -f1))"
