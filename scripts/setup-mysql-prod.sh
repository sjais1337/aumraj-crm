#!/usr/bin/env bash
# Create MySQL database + app user for production on a fresh VPS.
# Usage: sudo ./scripts/setup-mysql-prod.sh
#
# Optional env vars:
#   MYSQL_APP_USER=aumraj
#   MYSQL_APP_PASSWORD=...   (generated if unset)
#   MYSQL_DATABASE=production
set -euo pipefail

APP_DIR="${APP_DIR:-/var/www/aumraj-crm}"
MYSQL_APP_USER="${MYSQL_APP_USER:-aumraj}"
MYSQL_DATABASE="${MYSQL_DATABASE:-production}"

if [[ "$EUID" -ne 0 ]]; then
  echo "Run as root: sudo $0"
  exit 1
fi

if ! command -v mysql >/dev/null 2>&1; then
  echo "ERROR: mysql client not installed. Run scripts/setup-server.sh first."
  exit 1
fi

if [[ -z "${MYSQL_APP_PASSWORD:-}" ]]; then
  MYSQL_APP_PASSWORD="$(openssl rand -base64 18 | tr -d '/+=' | head -c 20)"
  echo "Generated MySQL password for $MYSQL_APP_USER: $MYSQL_APP_PASSWORD"
  echo "(Save this  it is also written to $APP_DIR/.env.production if that file exists.)"
fi

echo "==> Creating database and user..."
mysql <<SQL
CREATE DATABASE IF NOT EXISTS \`${MYSQL_DATABASE}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER IF NOT EXISTS '${MYSQL_APP_USER}'@'localhost' IDENTIFIED BY '${MYSQL_APP_PASSWORD}';
ALTER USER '${MYSQL_APP_USER}'@'localhost' IDENTIFIED BY '${MYSQL_APP_PASSWORD}';
GRANT ALL PRIVILEGES ON \`${MYSQL_DATABASE}\`.* TO '${MYSQL_APP_USER}'@'localhost';
FLUSH PRIVILEGES;
SQL

echo "Database '$MYSQL_DATABASE' and user '$MYSQL_APP_USER'@localhost are ready."

# URL-encode @ in password for DATABASE_URL
ENCODED_PWD="$(python3 - <<PY
import urllib.parse
print(urllib.parse.quote('${MYSQL_APP_PASSWORD}', safe=''))
PY
)"
DATABASE_URL="mysql://${MYSQL_APP_USER}:${ENCODED_PWD}@localhost:3306/${MYSQL_DATABASE}"

ENV_FILE="$APP_DIR/.env.production"
if [[ -f "$ENV_FILE" ]]; then
  python3 - "$ENV_FILE" "$DATABASE_URL" <<'PY'
import sys
from pathlib import Path

path = Path(sys.argv[1])
url = sys.argv[2]
lines = path.read_text().splitlines()
out = []
replaced = False
for line in lines:
    if line.startswith("DATABASE_URL="):
        out.append(f"DATABASE_URL={url}")
        replaced = True
    else:
        out.append(line)
if not replaced:
    out.append(f"DATABASE_URL={url}")
path.write_text("\n".join(out) + "\n")
PY
  echo "Updated DATABASE_URL in $ENV_FILE"
else
  echo
  echo "Add this to .env.production after running init-production-env.sh:"
  echo "DATABASE_URL=${DATABASE_URL}"
fi

echo
echo "To import an existing dump instead of an empty schema:"
echo "  gunzip -c /path/to/aumraj-production.sql.gz | mysql -u root -p ${MYSQL_DATABASE}"
echo "Then run: cd $APP_DIR && ./scripts/deploy.sh production"
