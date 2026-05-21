#!/usr/bin/env bash
# One-time local development bootstrap.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

echo "==> aumraj-crm local setup"
echo

# Node.js
if ! command -v node >/dev/null 2>&1; then
  echo "ERROR: Node.js is not installed. Install Node.js LTS first."
  exit 1
fi
echo "Node.js: $(node -v)"

# MySQL client
if ! command -v mysql >/dev/null 2>&1; then
  echo "WARNING: mysql client not found. Install MySQL before running migrations."
else
  echo "MySQL client: $(mysql --version | head -1)"
fi

# Environment file
if [[ ! -f .env.local ]]; then
  cp .env.example .env.local
  echo "Created .env.local from .env.example — edit it with your database credentials and secrets."
else
  echo ".env.local already exists, skipping copy."
fi

# Symlink for Prisma CLI
if [[ ! -f .env ]] || [[ -L .env ]]; then
  ln -sf .env.local .env
  echo "Linked .env -> .env.local for Prisma CLI."
fi

# Dependencies
echo
echo "==> Installing npm dependencies..."
npm install

echo
echo "==> Generating Prisma client..."
npx prisma generate

echo
echo "==> Next steps:"
echo "  1. Edit .env.local (DATABASE_URL, NEXTAUTH_SECRET, etc.)"
echo "  2. Create database: mysql -u root -p -e \"CREATE DATABASE aumraj_local CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;\""
echo "  3. Run migrations:  npx prisma migrate dev"
echo "  4. Start dev server: npm run dev"
echo "  5. Open http://localhost:5500"
echo
echo "See docs/LOCAL_DEV.md for full details."
