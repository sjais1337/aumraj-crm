#!/usr/bin/env bash
# Create .env.production from the example and generate NEXTAUTH_SECRET.
# Usage: ./scripts/init-production-env.sh
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

EXAMPLE="$ROOT/infra/env/.env.production.example"
TARGET="$ROOT/.env.production"

if [[ ! -f "$EXAMPLE" ]]; then
  echo "ERROR: Missing $EXAMPLE"
  exit 1
fi

if [[ -f "$TARGET" ]]; then
  echo ".env.production already exists — not overwriting."
else
  cp "$EXAMPLE" "$TARGET"
  SECRET="$(openssl rand -base64 32)"
  python3 - "$TARGET" "$SECRET" <<'PY'
import sys
from pathlib import Path

path = Path(sys.argv[1])
secret = sys.argv[2]
text = path.read_text()
text = text.replace("CHANGE_ME_NEXTAUTH_SECRET", secret, 1)
path.write_text(text)
PY
  echo "Created $TARGET with a generated NEXTAUTH_SECRET."
fi

ln -sf .env.production .env
echo "Linked .env -> .env.production (for Prisma CLI)."

echo
echo "Edit $TARGET before deploying:"
echo "  - DATABASE_URL (set automatically by setup-mysql-prod.sh, or paste from a dump restore)"
echo "  - NEXTAUTH_URL (https://kra.aumraj.in, or http://YOUR_VPS_IP:5500 for a first localhost test)"
echo
echo "Then: sudo ./scripts/setup-mysql-prod.sh   # fresh empty DB, or restore a SQL dump instead"
echo "      ./scripts/deploy.sh production"
