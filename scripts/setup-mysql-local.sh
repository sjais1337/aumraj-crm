#!/usr/bin/env bash
# One-time local MySQL setup for Arch Linux + import production dump.
# Run on your machine (requires sudo):
#
#   ./scripts/setup-mysql-local.sh
#
# If install failed partway, run the recovery script first:
#   ./scripts/fix-mysql-local.sh
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
ROOT_PASSWORD="aumraj@123"
DATADIR="/var/lib/mysql"

# Prefer mariadb CLI (mysql is deprecated on Arch)
if command -v mariadb >/dev/null 2>&1; then
  MYSQL_CLI="mariadb"
else
  MYSQL_CLI="mysql"
fi

mysql_cmd() {
  if [[ "${USE_SUDO:-0}" == "1" ]]; then
    sudo "$MYSQL_CLI" "$@"
  else
    "$MYSQL_CLI" "$@"
  fi
}

echo "==> aumraj-crm local MySQL setup (Arch Linux)"
echo

# Remove stray data dir if a previous install-db ran from the wrong cwd
if [[ -d "$ROOT/data" ]]; then
  echo "==> Removing stray $ROOT/data from failed install-db..."
  rm -rf "$ROOT/data"
fi

if ! command -v "$MYSQL_CLI" >/dev/null 2>&1; then
  echo "==> Installing MariaDB..."
  sudo pacman -S --needed mariadb
fi

# Initialize system tables if datadir is empty
if [[ ! -d "$DATADIR/mysql" ]]; then
  echo "==> Initializing MariaDB data directory..."
  sudo systemctl stop mariadb 2>/dev/null || true
  sudo mariadb-install-db --user=mysql --basedir=/usr --datadir="$DATADIR"
fi

echo "==> Starting MariaDB..."
sudo systemctl enable --now mariadb

# Wait for server to accept connections
for i in {1..15}; do
  if USE_SUDO=1 mysql_cmd -e "SELECT 1;" >/dev/null 2>&1; then
    break
  fi
  sleep 1
done

echo "==> Setting root password..."
# Arch MariaDB: root uses unix_socket until password is set — must use sudo
if USE_SUDO=1 mysql_cmd -e "SELECT 1;" >/dev/null 2>&1; then
  USE_SUDO=1 mysql_cmd -e \
    "ALTER USER 'root'@'localhost' IDENTIFIED BY '${ROOT_PASSWORD}'; FLUSH PRIVILEGES;"
  echo "Root password set."
elif MYSQL_PWD="$ROOT_PASSWORD" mysql_cmd -u root -e "SELECT 1;" >/dev/null 2>&1; then
  echo "Root password already configured."
else
  echo "ERROR: Cannot connect to MariaDB."
  echo "Try running: ./scripts/fix-mysql-local.sh"
  exit 1
fi

echo "==> Updating .env.local..."
ENV_LOCAL="$ROOT/.env.local"
if [[ ! -f "$ENV_LOCAL" ]]; then
  cp "$ROOT/.env.example" "$ENV_LOCAL"
fi

ENCODED_PWD="aumraj%40123"
if grep -q '^DATABASE_URL=' "$ENV_LOCAL"; then
  sed -i "s|^DATABASE_URL=.*|DATABASE_URL=\"mysql://root:${ENCODED_PWD}@localhost:3306/aumraj_local\"|" "$ENV_LOCAL"
else
  echo "DATABASE_URL=\"mysql://root:${ENCODED_PWD}@localhost:3306/aumraj_local\"" >> "$ENV_LOCAL"
fi

ln -sf .env.local "$ROOT/.env"

echo "==> Importing database dump..."
MYSQL_PWD="$ROOT_PASSWORD" "$ROOT/scripts/import-local-db.sh"

echo
echo "==> Done. Start the app with: npm run dev"
echo "    Open http://localhost:5500"
