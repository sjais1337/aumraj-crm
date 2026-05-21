#!/usr/bin/env bash
# One-time production VPS bootstrap. Run with sudo on a fresh server.
# Usage: sudo ./scripts/setup-server.sh
set -euo pipefail

APP_DIR="/var/www/aumraj-crm"
REPO_URL="${REPO_URL:-}"  # Set REPO_URL=git@github.com:org/aumraj-crm.git before running

if [[ "$EUID" -ne 0 ]]; then
  echo "Run as root: sudo $0"
  exit 1
fi

echo "==> aumraj-crm production server setup"
echo

# Node.js
if ! command -v node >/dev/null 2>&1; then
  echo "Installing Node.js LTS via NodeSource..."
  curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
  apt-get install -y nodejs
fi
echo "Node.js: $(node -v)"

# nginx
if ! command -v nginx >/dev/null 2>&1; then
  apt-get update
  apt-get install -y nginx
fi

# MySQL client (server may already have MySQL installed)
if ! command -v mysql >/dev/null 2>&1; then
  echo "Installing MySQL server..."
  apt-get install -y mysql-server
fi

# App directory
mkdir -p "$APP_DIR"
if [[ -n "$REPO_URL" ]]; then
  if [[ ! -d "$APP_DIR/.git" ]]; then
    git clone "$REPO_URL" "$APP_DIR"
  fi
else
  echo "NOTE: REPO_URL not set. Copy or clone the repo to $APP_DIR manually."
fi

if [[ -f "$APP_DIR/infra/nginx/kra.aumraj.in.conf.template" ]]; then
  cp "$APP_DIR/infra/nginx/kra.aumraj.in.conf.template" /etc/nginx/sites-available/kra.aumraj.in
  ln -sf /etc/nginx/sites-available/kra.aumraj.in /etc/nginx/sites-enabled/kra.aumraj.in
  nginx -t
  systemctl reload nginx
  echo "nginx site installed for kra.aumraj.in"
fi

if [[ -f "$APP_DIR/infra/systemd/aumraj-prod.service.template" ]]; then
  cp "$APP_DIR/infra/systemd/aumraj-prod.service.template" /etc/systemd/system/aumraj-prod.service
  systemctl daemon-reload
  systemctl enable aumraj-prod
  echo "systemd unit installed (not started until .env.production exists)"
fi

# Permissions
if id www-data >/dev/null 2>&1 && [[ -d "$APP_DIR" ]]; then
  chown -R www-data:www-data "$APP_DIR"
fi

echo
echo "==> Server bootstrap complete. Manual steps remaining:"
echo "  1. cp $APP_DIR/infra/env/.env.production.example $APP_DIR/.env.production"
echo "  2. Edit .env.production with DATABASE_URL, NEXTAUTH_SECRET, etc."
echo "  3. Create/restore MySQL database 'production'"
echo "  4. rsync uploads from old server if migrating"
echo "  5. cd $APP_DIR && ./scripts/deploy.sh production"
echo "  6. sudo certbot --nginx -d kra.aumraj.in -d www.kra.aumraj.in"
echo
echo "See docs/PRODUCTION_DEPLOY.md for the full runbook."
