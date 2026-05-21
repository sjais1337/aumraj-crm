#!/usr/bin/env bash
# Deploy aumraj-crm to production.
# Usage: ./scripts/deploy.sh production
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
BRANCH="main"

if [[ ! -f "$ENV_FILE" ]]; then
  echo "ERROR: $ENV_FILE not found. Copy infra/env/.env.production.example and fill in secrets."
  exit 1
fi

echo "==> Deploying $ENV from branch $BRANCH"
echo "    Directory: $ROOT"
echo

echo "==> Pulling latest code..."
git fetch origin
git checkout "$BRANCH"
git pull origin "$BRANCH"

echo "==> Installing dependencies..."
npm ci

echo "==> Prisma generate + migrate..."
set -a
# shellcheck disable=SC1090
source "$ENV_FILE"
set +a
npx prisma generate
npx prisma migrate deploy

echo "==> Building Next.js app..."
npm run build

echo "==> Restarting systemd service..."
if systemctl is-active --quiet "$SERVICE" 2>/dev/null; then
  sudo systemctl restart "$SERVICE"
else
  echo "WARNING: $SERVICE is not active. Start it with: sudo systemctl start $SERVICE"
fi

echo "==> Health check..."
sleep 2
if curl -sf "http://127.0.0.1:${PORT}/" >/dev/null; then
  echo "OK: App responding on port $PORT"
else
  echo "WARNING: Health check failed. Check logs: sudo journalctl -u $SERVICE -n 50"
  exit 1
fi

echo
echo "==> Deploy complete."
