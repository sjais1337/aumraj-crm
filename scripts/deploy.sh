#!/usr/bin/env bash
# Deploy aumraj-crm to production.
# Usage: ./scripts/deploy.sh production
#
# On a fresh VM (after setup-server.sh + .env.production + MySQL):
#   cd /var/www/aumraj-crm
#   ./scripts/deploy.sh production
#
# Skip git pull (e.g. deploying current checkout): SKIP_GIT_PULL=1 ./scripts/deploy.sh production
set -euo pipefail

ENV="${1:-}"
if [[ "$ENV" != "production" ]]; then
  echo "Usage: $0 production"
  exit 1
fi

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

ENV_FILE=".env.production"
SERVICE="aumraj-prod"
PORT=5500
BRANCH="${DEPLOY_BRANCH:-main}"

if [[ ! -f "$ENV_FILE" ]]; then
  echo "ERROR: $ENV_FILE not found."
  echo "Run: ./scripts/init-production-env.sh"
  exit 1
fi

# Prisma CLI reads .env; Next.js also loads .env.production in production builds.
ln -sf .env.production .env

echo "==> Deploying $ENV from branch $BRANCH"
echo "    Directory: $ROOT"
echo

if [[ "${SKIP_GIT_PULL:-}" != "1" ]]; then
  if [[ -d .git ]]; then
    echo "==> Pulling latest code..."
    git fetch origin
    git checkout "$BRANCH"
    git pull origin "$BRANCH"
  else
    echo "WARNING: Not a git repository — skipping pull (set SKIP_GIT_PULL=1 to silence)."
  fi
else
  echo "==> Skipping git pull (SKIP_GIT_PULL=1)"
fi

echo "==> Installing dependencies..."
npm ci

echo "==> Loading environment..."
set -a
# shellcheck disable=SC1090
source "$ENV_FILE"
set +a

echo "==> Prisma generate + migrate..."
npx prisma generate
npx prisma migrate deploy

echo "==> Building Next.js app..."
npm run build

if id www-data >/dev/null 2>&1; then
  echo "==> Setting ownership for www-data..."
  if [[ "$EUID" -eq 0 ]]; then
    chown -R www-data:www-data "$ROOT"
  elif command -v sudo >/dev/null 2>&1; then
    sudo chown -R www-data:www-data "$ROOT"
  else
    echo "WARNING: Could not chown to www-data. systemd may fail to read .next — run deploy with sudo or fix ownership manually."
  fi
fi

echo "==> Starting systemd service..."
if command -v systemctl >/dev/null 2>&1; then
  if [[ "$EUID" -eq 0 ]]; then
    SYSTEMCTL=(systemctl)
  elif command -v sudo >/dev/null 2>&1; then
    SYSTEMCTL=(sudo systemctl)
  else
    SYSTEMCTL=()
  fi

  if [[ ${#SYSTEMCTL[@]} -gt 0 ]]; then
    if "${SYSTEMCTL[@]}" is-active --quiet "$SERVICE" 2>/dev/null; then
      "${SYSTEMCTL[@]}" restart "$SERVICE"
    else
      "${SYSTEMCTL[@]}" start "$SERVICE"
    fi
    "${SYSTEMCTL[@]}" --no-pager --full status "$SERVICE" || true
  else
    echo "WARNING: systemctl/sudo not available. Start manually: npm start"
  fi
else
  echo "WARNING: systemd not found. Start manually: npm start"
fi

echo "==> Health check..."
sleep 3
if curl -sf "http://127.0.0.1:${PORT}/" >/dev/null; then
  echo "OK: App responding on http://127.0.0.1:${PORT}/"
else
  echo "WARNING: Health check failed on port $PORT."
  echo "Check logs: sudo journalctl -u $SERVICE -n 80 --no-pager"
  exit 1
fi

echo
echo "==> Deploy complete."
