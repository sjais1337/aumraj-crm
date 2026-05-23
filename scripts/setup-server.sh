#!/usr/bin/env bash
# One-time production VPS bootstrap. Run with sudo on a fresh Ubuntu/Debian server.
#
# Typical usage (clone first, then bootstrap):
#   sudo mkdir -p /var/www
#   sudo git clone git@github.com:ORG/aumraj-crm.git /var/www/aumraj-crm
#   cd /var/www/aumraj-crm
#   sudo ./scripts/setup-server.sh
#
# Alternative (clone during bootstrap):
#   sudo REPO_URL=git@github.com:ORG/aumraj-crm.git ./scripts/setup-server.sh
set -euo pipefail

APP_DIR="${APP_DIR:-/var/www/aumraj-crm}"
REPO_URL="${REPO_URL:-}"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

if [[ "$EUID" -ne 0 ]]; then
  echo "Run as root: sudo $0"
  exit 1
fi

echo "==> aumraj-crm production server setup"
echo "    App directory: $APP_DIR"
echo

export DEBIAN_FRONTEND=noninteractive
apt-get update

# Base packages for clone, native npm modules (bcrypt), and TLS later
apt-get install -y git curl ca-certificates build-essential rsync

# Node.js 20 LTS
if ! command -v node >/dev/null 2>&1; then
  echo "==> Installing Node.js LTS via NodeSource..."
  curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
  apt-get install -y nodejs
fi
echo "Node.js: $(node -v)"
echo "npm: $(npm -v)"

# nginx (optional for localhost-only; install now so routing is ready later)
if ! command -v nginx >/dev/null 2>&1; then
  echo "==> Installing nginx..."
  apt-get install -y nginx
fi

# MySQL server
if ! command -v mysql >/dev/null 2>&1; then
  echo "==> Installing MySQL server..."
  apt-get install -y mysql-server
  systemctl enable mysql
  systemctl start mysql || true
fi

mkdir -p "$APP_DIR"

if [[ -d "$REPO_ROOT/.git" && "$REPO_ROOT" != "$APP_DIR" ]]; then
  echo "==> Syncing repository from $REPO_ROOT to $APP_DIR..."
  rsync -a \
    --exclude node_modules \
    --exclude .next \
    --exclude backups \
    --exclude .env \
    --exclude .env.local \
    --exclude .env.production \
    "$REPO_ROOT/" "$APP_DIR/"
elif [[ -n "$REPO_URL" ]]; then
  if [[ ! -d "$APP_DIR/.git" ]]; then
    echo "==> Cloning $REPO_URL into $APP_DIR..."
    git clone "$REPO_URL" "$APP_DIR"
  else
    echo "Repository already present at $APP_DIR"
  fi
elif [[ ! -d "$APP_DIR/.git" ]]; then
  echo "ERROR: No git repository at $APP_DIR."
  echo "Clone the repo first, for example:"
  echo "  git clone <repo-url> $APP_DIR"
  echo "Or set REPO_URL when running this script."
  exit 1
fi

if [[ ! -f "$APP_DIR/package.json" ]]; then
  echo "ERROR: $APP_DIR does not look like the aumraj-crm app (package.json missing)."
  exit 1
fi

# Writable upload paths for www-data
mkdir -p "$APP_DIR/public/images/pfp" "$APP_DIR/public/uploads" "$APP_DIR/backups"

if [[ -f "$APP_DIR/infra/nginx/kra.aumraj.in.conf.template" ]]; then
  cp "$APP_DIR/infra/nginx/kra.aumraj.in.conf.template" /etc/nginx/sites-available/kra.aumraj.in
  ln -sf /etc/nginx/sites-available/kra.aumraj.in /etc/nginx/sites-enabled/kra.aumraj.in
  rm -f /etc/nginx/sites-enabled/default
  nginx -t
  systemctl reload nginx
  echo "nginx site installed for kra.aumraj.in (HTTP only until certbot)"
fi

if [[ -f "$APP_DIR/infra/systemd/aumraj-prod.service.template" ]]; then
  cp "$APP_DIR/infra/systemd/aumraj-prod.service.template" /etc/systemd/system/aumraj-prod.service
  systemctl daemon-reload
  systemctl enable aumraj-prod
  echo "systemd unit installed (start after .env.production + deploy)"
fi

if id www-data >/dev/null 2>&1; then
  chown -R www-data:www-data "$APP_DIR/public/images/pfp" "$APP_DIR/public/uploads" "$APP_DIR/backups"
fi

# Let the invoking user run npm/deploy before the final www-data chown in deploy.sh
if [[ -n "${SUDO_USER:-}" && "$SUDO_USER" != "root" ]]; then
  chown -R "$SUDO_USER":"$SUDO_USER" "$APP_DIR"
  echo "App tree owned by $SUDO_USER (deploy.sh will chown to www-data after build)."
elif [[ "$(stat -c '%U' "$APP_DIR" 2>/dev/null || echo root)" == "root" ]]; then
  echo "NOTE: $APP_DIR is owned by root. Before deploy, run:"
  echo "  sudo chown -R \\\$USER:$APP_DIR $APP_DIR"
fi

echo
echo "==> Server bootstrap complete."
echo
echo "Next steps:"
echo "  1. cd $APP_DIR"
echo "  2. ./scripts/init-production-env.sh    # creates .env.production + NEXTAUTH_SECRET"
echo "  3. Edit .env.production (DATABASE_URL, NEXTAUTH_URL)"
echo "  4. sudo ./scripts/setup-mysql-prod.sh # fresh DB, or restore a SQL dump instead"
echo "  5. ./scripts/deploy.sh production     # install, migrate, build, start on :5500"
echo "  6. Optional HTTPS: sudo certbot --nginx -d kra.aumraj.in -d www.kra.aumraj.in"
echo
echo "Localhost smoke test after deploy: curl -sf http://127.0.0.1:5500/"
echo "See docs/PRODUCTION_DEPLOY.md for the full runbook."
