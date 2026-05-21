#!/usr/bin/env bash
# Recover from a failed MariaDB install on Arch Linux.
# Run when you see: ERROR 1698, install-db failed, or Access denied for root.
#
#   ./scripts/fix-mysql-local.sh
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
ROOT_PASSWORD="aumraj@123"
DATADIR="/var/lib/mysql"

if command -v mariadb >/dev/null 2>&1; then
  MYSQL_CLI="mariadb"
else
  MYSQL_CLI="mysql"
fi

echo "==> MariaDB recovery (Arch Linux)"
echo

# Clean up stray install-db output in project directory
if [[ -d "$ROOT/data" ]]; then
  echo "Removing stray $ROOT/data ..."
  rm -rf "$ROOT/data"
fi

echo "Stopping MariaDB..."
sudo systemctl stop mariadb 2>/dev/null || true

# Re-initialize if system tables are missing
if [[ ! -d "$DATADIR/mysql" ]]; then
  echo "Data directory empty — initializing..."
  sudo mariadb-install-db --user=mysql --basedir=/usr --datadir="$DATADIR"
else
  echo "Data directory exists at $DATADIR (not wiping existing data)."
  echo "If you need a full reset, run:"
  echo "  sudo systemctl stop mariadb"
  echo "  sudo rm -rf /var/lib/mysql/*"
  echo "  sudo mariadb-install-db --user=mysql --basedir=/usr --datadir=/var/lib/mysql"
  echo "  then re-run this script."
fi

echo "Starting MariaDB..."
sudo systemctl start mariadb

sleep 2

echo "Setting root password via sudo (unix_socket auth)..."
sudo "$MYSQL_CLI" -e \
  "ALTER USER 'root'@'localhost' IDENTIFIED BY '${ROOT_PASSWORD}'; FLUSH PRIVILEGES;"

echo "Testing password login..."
MYSQL_PWD="$ROOT_PASSWORD" "$MYSQL_CLI" -u root -e "SELECT VERSION() AS version;"

echo
echo "==> Recovery complete."
echo "    Run: MYSQL_PWD='aumraj@123' ./scripts/import-local-db.sh"
echo "    Or:  ./scripts/setup-mysql-local.sh"
