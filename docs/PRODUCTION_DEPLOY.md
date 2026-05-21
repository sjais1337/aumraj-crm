# Production Deployment Runbook

Use this checklist when provisioning the production VPS for **kra.aumraj.in**. This is **not** needed for local development.

## Architecture

- **Domain:** `kra.aumraj.in`, `www.kra.aumraj.in`
- **App path:** `/var/www/aumraj-crm`
- **App port:** `5500` (proxied by nginx)
- **Process manager:** systemd (`aumraj-prod.service`)
- **Database:** MySQL `production`

## Prerequisites

- VPS with Ubuntu/Debian (or similar)
- DNS A record for `kra.aumraj.in` pointing to the VPS
- SSH access with sudo
- MySQL dump and upload files from the old server (if migrating)

## One-time server setup

Run on the VPS as a user with sudo:

```bash
sudo ./scripts/setup-server.sh
```

This script installs dependencies, clones the repo, configures nginx and systemd, and prints remaining manual steps (env secrets, DB restore).

### Manual steps after setup-server.sh

1. **Environment file**

   ```bash
   cp /var/www/aumraj-crm/infra/env/.env.production.example /var/www/aumraj-crm/.env.production
   nano /var/www/aumraj-crm/.env.production
   ```

   Set real values for `DATABASE_URL`, `NEXTAUTH_SECRET`, and URLs.

2. **MySQL database**

   Restore from dump or create fresh:

   ```bash
   mysql -u root -p -e "CREATE DATABASE production CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
   mysql -u root -p production < /path/to/aumraj-production.sql
   ```

3. **Upload files** (if migrating)

   ```bash
   rsync -avz OLD_SERVER:/path/to/app/public/uploads/ /var/www/aumraj-crm/public/uploads/
   rsync -avz OLD_SERVER:/path/to/app/public/images/pfp/ /var/www/aumraj-crm/public/images/pfp/
   ```

4. **HTTPS** (recommended)

   ```bash
   sudo certbot --nginx -d kra.aumraj.in -d www.kra.aumraj.in
   ```

   Update `NEXTAUTH_URL` in `.env.production` to `https://kra.aumraj.in` after certbot.

5. **First deploy**

   ```bash
   cd /var/www/aumraj-crm
   ./scripts/deploy.sh production
   ```

## Routine deploys

SSH to the VPS and run:

```bash
cd /var/www/aumraj-crm
./scripts/deploy.sh production
```

This pulls `main`, installs deps, runs migrations, builds, and restarts the service.

## nginx notes

The template at `infra/nginx/kra.aumraj.in.conf.template` is based on the previous server config with these fixes:

- Single server block proxying to `:5500` (removed duplicate `:10929` block)
- Added `client_max_body_size 20M` for PDF/profile uploads
- Preserved gzip settings

Global proxy headers (`X-Forwarded-For`, `X-Forwarded-Proto`) should live in the nginx `http {}` block if not already present:

```nginx
proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
proxy_set_header X-Forwarded-Proto $scheme;
```

## Operations

| Task | Command |
|------|---------|
| Deploy | `./scripts/deploy.sh production` |
| View logs | `sudo journalctl -u aumraj-prod -f` |
| Restart app | `sudo systemctl restart aumraj-prod` |
| App status | `sudo systemctl status aumraj-prod` |
| DB backup | `./scripts/backup-db.sh production` |
| nginx test | `sudo nginx -t && sudo systemctl reload nginx` |

## Smoke test after deploy

1. Open `https://kra.aumraj.in/` — login page loads
2. Sign in with a known staff account
3. Visit `/users`, `/admin` (if admin user)
4. Upload a profile photo — file appears in `public/images/pfp/`
5. Open an SLA record with a PDF — file loads from `public/uploads/`

## Rollback

If a deploy fails:

```bash
cd /var/www/aumraj-crm
git checkout HEAD~1
npm ci
npm run build
sudo systemctl restart aumraj-prod
```

Restore the database from backup if migrations caused issues.
