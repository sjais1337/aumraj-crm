# Production deployment — start to finish

End-to-end guide for moving **kra.aumraj-crm** from the **old VPS** to a **new Ubuntu VPS** and bringing it live at **kra.aumraj.in**.

This assumes you are **migrating** (database dump + uploaded files), not starting from an empty database.

**Target layout on the new server**

| Item | Value |
|------|--------|
| App directory | `/var/www/aumraj-crm` |
| App port | `5500` (nginx proxies public HTTP/HTTPS to this) |
| MySQL database | `production` |
| Process manager | systemd service `aumraj-prod` |
| Public domain | `kra.aumraj.in`, `www.kra.aumraj.in` |

---

## Before you start

On your machine / both VPSes you need:

- SSH access to **old VPS** and **new VPS** (sudo on the new server)
- DNS control for `kra.aumraj.in` (for cutover later — not required for localhost testing)
- Git access to clone the repository on the new VPS
- Enough disk on the new VPS for the MySQL dump + `public/uploads/` + `public/images/pfp/`

Replace placeholders in commands below:

| Placeholder | Meaning |
|-------------|---------|
| `OLD_VPS` | SSH target for the current production server, e.g. `root@1.2.3.4` |
| `NEW_VPS` | SSH target for the new server, e.g. `ubuntu@5.6.7.8` |
| `YYYY-MM-DD` | Date you take the dump, e.g. `2026-05-21` |
| `YOUR_ORG` | GitHub org or user for the repo |

---

## Phase 1 — Create a database dump on the **old VPS**

SSH into the **old** server:

```bash
ssh OLD_VPS
```

Run **`mysqldump` in the shell**, not inside the `mysql>` prompt:

```bash
mysqldump -u root -p \
  --single-transaction \
  --routines \
  --triggers \
  --hex-blob \
  production > ~/aumraj-production-YYYY-MM-DD.sql

gzip ~/aumraj-production-YYYY-MM-DD.sql
ls -lh ~/aumraj-production-YYYY-MM-DD.sql.gz
```

`--single-transaction` keeps InnoDB tables consistent without long global locks.

**Optional but recommended** — copy the current production secrets file (you will need `NEXTAUTH_SECRET` on the new server):

```bash
# On old VPS — print secret (do not commit this anywhere)
grep NEXTAUTH_SECRET /var/www/aumraj-crm/.env.production
```

Copy that value somewhere safe (password manager). Reusing it avoids forcing every user to log in again after cutover.

Exit the old server when done:

```bash
exit
```

---

## Phase 2 — Copy the dump to the **new VPS** (SCP)

Run from your **laptop** or directly **on the new VPS**.

**Option A — SCP from your laptop** (old → laptop → new, or old → new in one hop):

```bash
# One hop (if NEW_VPS can reach OLD_VPS, run this ON the new VPS):
scp OLD_VPS:~/aumraj-production-YYYY-MM-DD.sql.gz ~/

# Or from laptop:
scp OLD_VPS:~/aumraj-production-YYYY-MM-DD.sql.gz .
scp aumraj-production-YYYY-MM-DD.sql.gz NEW_VPS:~/
```

**Option B — already on the new VPS:**

```bash
ssh NEW_VPS
scp OLD_VPS:~/aumraj-production-YYYY-MM-DD.sql.gz ~/
```

Confirm the file:

```bash
ls -lh ~/aumraj-production-YYYY-MM-DD.sql.gz
```

---

## Phase 3 — Install and configure MySQL on **Ubuntu** (new VPS)

All commands below on the **new VPS** unless noted.

### 3.1 Install MySQL Server

```bash
sudo apt update
sudo apt install -y mysql-server
sudo systemctl enable mysql
sudo systemctl start mysql
sudo systemctl status mysql --no-pager
```

Ubuntu 22.04+ ships MySQL 8. Root login is via `sudo mysql` (auth socket) until you set a password.

### 3.2 (Recommended) Set a root password

```bash
sudo mysql
```

In the `mysql>` prompt:

```sql
ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY 'YOUR_STRONG_ROOT_PASSWORD';
FLUSH PRIVILEGES;
EXIT;
```

Test:

```bash
mysql -u root -p -e "SELECT 1;"
```

### 3.3 Create the app database and dedicated MySQL user

Do **not** run the Next.js app as MySQL `root`. Create an app user (example name `aumraj`):

```bash
mysql -u root -p
```

```sql
CREATE DATABASE IF NOT EXISTS production
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

CREATE USER IF NOT EXISTS 'aumraj'@'localhost' IDENTIFIED BY 'YOUR_STRONG_APP_PASSWORD';
ALTER USER 'aumraj'@'localhost' IDENTIFIED BY 'YOUR_STRONG_APP_PASSWORD';
GRANT ALL PRIVILEGES ON production.* TO 'aumraj'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

Save `YOUR_STRONG_APP_PASSWORD` — you will put it in `DATABASE_URL`.

**URL-encoding:** If the password contains `@`, `#`, `/`, etc., encode it in `DATABASE_URL` (e.g. `@` → `%40`). Example: password `pass@word` → `pass%40word`.

---

## Phase 4 — Restore the dump into MySQL

Still on the **new VPS**:

```bash
gunzip -c ~/aumraj-production-YYYY-MM-DD.sql.gz | mysql -u root -p production
```

If the dump was taken with `--databases production`, it may already include `CREATE DATABASE` / `USE production`. In that case you can omit the database name on the command line:

```bash
gunzip -c ~/aumraj-production-YYYY-MM-DD.sql.gz | mysql -u root -p
```

### Verify the restore

```bash
mysql -u root -p production -e "SHOW TABLES;"
mysql -u root -p production -e "SELECT COUNT(*) AS staff_count FROM staffs;"
mysql -u root -p production -e "SELECT migration_name FROM _prisma_migrations ORDER BY finished_at;"
```

You should see core tables (`staffs`, `customer`, `funnel`, …) and Prisma migration history.

Test that the app user can connect:

```bash
mysql -u aumraj -p production -e "SELECT COUNT(*) FROM staffs;"
```

---

## Phase 5 — Clone the repository and install system dependencies

```bash
sudo mkdir -p /var/www
sudo git clone git@github.com:YOUR_ORG/aumraj-crm.git /var/www/aumraj-crm
sudo chown -R "$USER" /var/www/aumraj-crm
cd /var/www/aumraj-crm
```

Install Node.js 20, nginx, build tools, and register systemd + nginx (MySQL is already installed — the script skips it):

```bash
sudo ./scripts/setup-server.sh
```

This installs:

- Node.js 20 LTS
- nginx (site template for `kra.aumraj.in` → `127.0.0.1:5500`)
- systemd unit `aumraj-prod`
- Writable dirs `public/uploads/`, `public/images/pfp/`

---

## Phase 6 — Configure `.env.production`

Production uses **one** env file: `/var/www/aumraj-crm/.env.production`.

### 6.1 Create the file

```bash
cd /var/www/aumraj-crm
./scripts/init-production-env.sh
```

This copies `infra/env/.env.production.example` → `.env.production`, generates a **new** `NEXTAUTH_SECRET`, and links `.env` → `.env.production` for Prisma CLI.

### 6.2 Edit every variable — what to set

```bash
nano /var/www/aumraj-crm/.env.production
```

| Variable | What to put | Notes |
|----------|-------------|--------|
| `DATABASE_URL` | `mysql://aumraj:YOUR_STRONG_APP_PASSWORD@localhost:3306/production` | Use the **app user** from Phase 3.3. URL-encode special characters in the password. **No quotes** around the value. |
| `NEXTAUTH_SECRET` | Copy from **old** `.env.production` if migrating | Keeps existing sessions valid. If you use the newly generated secret, all users must log in again. Generate fresh only for greenfield: `openssl rand -base64 32` |
| `NEXTAUTH_URL` | `https://kra.aumraj.in` | Must match the URL users type in the browser **after** DNS + HTTPS. For a test **before** DNS, use `http://NEW_VPS_PUBLIC_IP:5500` temporarily. |
| `NEXTAUTH_URL_INTERNAL` | `http://127.0.0.1:5500` | Leave as-is — server-side auth callbacks to the local process. |
| `NODE_ENV` | `production` | Leave as-is. |
| `PORT` | `5500` | Leave as-is — must match `npm start` and nginx upstream. |

**Example** (password `Kx9#mP@2qL` → `Kx9%23mP%402qL`):

```env
DATABASE_URL=mysql://aumraj:Kx9%23mP%402qL@localhost:3306/production
NEXTAUTH_SECRET=paste-from-old-server-or-openssl-rand-output
NEXTAUTH_URL=https://kra.aumraj.in
NEXTAUTH_URL_INTERNAL=http://127.0.0.1:5500
NODE_ENV=production
PORT=5500
```

You do **not** need `.env.local` on the server. Do **not** commit `.env.production` to git.

### 6.3 Quick sanity check

```bash
cd /var/www/aumraj-crm
set -a && source .env.production && set +a
mysql -u aumraj -p production -e "SELECT 1;"
```

---

## Phase 7 — Copy uploaded files from the old VPS

The database stores **filenames** for profile photos and SLA PDFs; the files live on disk.

From the **new VPS**:

```bash
rsync -avz OLD_VPS:/var/www/aumraj-crm/public/uploads/ /var/www/aumraj-crm/public/uploads/
rsync -avz OLD_VPS:/var/www/aumraj-crm/public/images/pfp/ /var/www/aumraj-crm/public/images/pfp/
```

If the old app lived in a different path, adjust the source.

Fix ownership (app runs as `www-data`):

```bash
sudo chown -R www-data:www-data /var/www/aumraj-crm/public/uploads /var/www/aumraj-crm/public/images/pfp
```

---

## Phase 8 — Build and start the application

```bash
cd /var/www/aumraj-crm
./scripts/deploy.sh production
```

`deploy.sh` will:

1. `git pull origin main` (skip with `SKIP_GIT_PULL=1` if needed)
2. `npm ci`
3. `npx prisma generate` + `npx prisma migrate deploy` (usually no-op if dump included `_prisma_migrations`)
4. `npm run build`
5. Set ownership to `www-data`
6. Start/restart `aumraj-prod` via systemd
7. Health-check `http://127.0.0.1:5500/`

### Test on localhost (before DNS)

```bash
curl -sf http://127.0.0.1:5500/ | head
sudo journalctl -u aumraj-prod -n 50 --no-pager
```

If testing via public IP on port 5500, set `NEXTAUTH_URL=http://YOUR_PUBLIC_IP:5500`, redeploy, and open that URL. Switch back to `https://kra.aumraj.in` after HTTPS is live.

---

## Phase 9 — DNS, nginx, and HTTPS (public cutover)

nginx was installed in Phase 5. Before cutover, the site may answer on the VPS IP over HTTP if DNS already points here.

### 9.1 Point DNS

At your DNS provider, set **A records**:

- `kra.aumraj.in` → new VPS public IP
- `www.kra.aumraj.in` → new VPS public IP (or CNAME to `kra.aumraj.in`)

Wait for propagation (`dig kra.aumraj.in +short`).

### 9.2 HTTPS with Certbot

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d kra.aumraj.in -d www.kra.aumraj.in
```

Update env and redeploy:

```bash
nano /var/www/aumraj-crm/.env.production
# NEXTAUTH_URL=https://kra.aumraj.in

cd /var/www/aumraj-crm
./scripts/deploy.sh production
```

### 9.3 Confirm nginx

```bash
sudo nginx -t
sudo systemctl reload nginx
curl -sI https://kra.aumraj.in/ | head
```

---

## Phase 10 — Smoke test checklist

Run after deploy and again after DNS/HTTPS cutover:

1. Open `https://kra.aumraj.in/` — login page loads
2. Sign in with a known staff account
3. Open `/users` — dashboard, billing, inbox
4. Open `/admin` — if the account is an admin
5. Upload a profile photo — file appears under `public/images/pfp/` and shows in the UI
6. Open an SLA / document that uses a PDF in `public/uploads/`

If uploads fail with HTTP 500:

```bash
ls -la /var/www/aumraj-crm/public/images/pfp
ls -la /var/www/aumraj-crm/public/uploads
sudo journalctl -u aumraj-prod -n 80 --no-pager
```

Directories must be owned by `www-data`.

---

## Phase 11 — Final cutover (minimize downtime)

For a live migration with minimal data loss:

1. **Announce maintenance** or stop the app on the old VPS:
   ```bash
   ssh OLD_VPS
   sudo systemctl stop aumraj-prod   # or your old service name
   ```
2. Take a **final** dump on the old VPS (same `mysqldump` command as Phase 1)
3. SCP the new dump to the new VPS and **re-restore** over `production`:
   ```bash
   gunzip -c ~/aumraj-production-FINAL.sql.gz | mysql -u root -p production
   ```
4. Re-rsync uploads (Phase 7) for any files added since the first rsync
5. On the new VPS: `./scripts/deploy.sh production`
6. Confirm DNS points to the new IP (Phase 9)
7. Smoke test (Phase 10)
8. Keep the **old VPS** running read-only or powered for 24–48 h as rollback

---

## Routine operations (after go-live)

| Task | Command |
|------|---------|
| Deploy latest `main` | `cd /var/www/aumraj-crm && ./scripts/deploy.sh production` |
| Deploy without git pull | `SKIP_GIT_PULL=1 ./scripts/deploy.sh production` |
| App logs | `sudo journalctl -u aumraj-prod -f` |
| Restart app | `sudo systemctl restart aumraj-prod` |
| App status | `sudo systemctl status aumraj-prod` |
| DB backup | `cd /var/www/aumraj-crm && ./scripts/backup-db.sh production` |
| Test nginx config | `sudo nginx -t && sudo systemctl reload nginx` |

---

## Troubleshooting

| Symptom | What to check |
|---------|----------------|
| `deploy.sh` health check fails | `sudo journalctl -u aumraj-prod -n 80` |
| Prisma / DB connection errors | `DATABASE_URL` in `.env.production`; test `mysql -u aumraj -p production` |
| nginx 502 Bad Gateway | Is the app up? `curl http://127.0.0.1:5500/`; `systemctl status aumraj-prod` |
| Login redirect loop | `NEXTAUTH_URL` must exactly match browser URL (scheme + host + port) |
| Profile / PDF missing | rsync uploads; DB row exists but file missing on disk |
| Upload 500 | `www-data` must own `public/uploads` and `public/images/pfp` |
| `npm ci` / build permission errors | `sudo chown -R $USER /var/www/aumraj-crm` before deploy; deploy chowns to `www-data` after |

---

## Rollback

**App only** (bad deploy):

```bash
cd /var/www/aumraj-crm
git checkout HEAD~1
npm ci
npm run build
sudo systemctl restart aumraj-prod
```

**Database** (bad migration): restore from a `.sql.gz` backup taken before the change.

**Full rollback**: point DNS back to the old VPS and restart the old app.

---

## Script reference

| Script | When to use |
|--------|-------------|
| `scripts/setup-server.sh` | Once on a new VPS after clone (Node, nginx, systemd) |
| `scripts/init-production-env.sh` | Once to create `.env.production` |
| `scripts/setup-mysql-prod.sh` | **Greenfield only** (empty DB). Skip when restoring a dump — use Phase 3–4 instead |
| `scripts/deploy.sh production` | Every deploy / first start |
| `scripts/backup-db.sh production` | Scheduled backups after go-live |

---

## Related docs

- [DATABASE_MIGRATION.md](./DATABASE_MIGRATION.md) — dump/restore details, bad practices, local dev import
- [LOCAL_DEV.md](./LOCAL_DEV.md) — local development only
