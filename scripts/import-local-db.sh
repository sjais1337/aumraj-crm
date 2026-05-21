#!/usr/bin/env bash
# Import aumraj-production.sql.gz into local MySQL database aumraj_local.
# Prerequisites: MariaDB/MySQL running, root password set.
#
# Usage:
#   MYSQL_PWD='aumraj@123' ./scripts/import-local-db.sh
#   ./scripts/import-local-db.sh path/to/dump.sql.gz
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
DUMP="${1:-$ROOT/aumraj-production.sql.gz}"
DB_NAME="aumraj_local"
MYSQL_USER="${MYSQL_USER:-root}"
MYSQL_PWD="${MYSQL_PWD:-aumraj@123}"

if command -v mariadb >/dev/null 2>&1; then
  MYSQL_CLI="mariadb"
else
  MYSQL_CLI="mysql"
fi

if [[ ! -f "$DUMP" ]]; then
  echo "ERROR: Dump not found: $DUMP"
  exit 1
fi

export MYSQL_PWD

echo "==> Checking MySQL connection..."
"$MYSQL_CLI" -u "$MYSQL_USER" -e "SELECT VERSION();" >/dev/null

echo "==> Creating database $DB_NAME (if missing)..."
"$MYSQL_CLI" -u "$MYSQL_USER" -e \
  "CREATE DATABASE IF NOT EXISTS \`$DB_NAME\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

echo "==> Importing $(basename "$DUMP") into $DB_NAME..."
echo "    This may take a minute."

if [[ "$DUMP" == *.gz ]]; then
  gunzip -c "$DUMP" | "$MYSQL_CLI" -u "$MYSQL_USER" "$DB_NAME"
else
  "$MYSQL_CLI" -u "$MYSQL_USER" "$DB_NAME" < "$DUMP"
fi

echo "==> Verifying import..."
TABLES=$("$MYSQL_CLI" -u "$MYSQL_USER" -N -e \
  "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema='$DB_NAME';")
STAFFS=$("$MYSQL_CLI" -u "$MYSQL_USER" -N -e "SELECT COUNT(*) FROM \`$DB_NAME\`.staffs;" 2>/dev/null || echo "0")

echo "    Tables: $TABLES"
echo "    Staff rows: $STAFFS"
echo
echo "==> Import complete."
echo "    Ensure .env.local DATABASE_URL points at: mysql://root:...@localhost:3306/$DB_NAME"
echo "    (@ in password must be URL-encoded as %40 in DATABASE_URL)"
