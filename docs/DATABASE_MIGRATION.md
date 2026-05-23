# Database Migration Guide

How to move the aumraj-crm MySQL database between environments: **VPS → local dev** and **old VPS → new production VPS**.

---

## Local development (VPS dump → your machine)

### Prerequisites

- Arch Linux (or adapt package commands for your distro)
- Dump file: `aumraj-production.sql.gz` in the project root
- Root MySQL password for local only: `aumraj@123`

### Automated setup (Arch)

```bash
cd ~/projects/aumraj-crm
chmod +x scripts/setup-mysql-local.sh scripts/import-local-db.sh scripts/fix-mysql-local.sh
./scripts/setup-mysql-local.sh
```

If setup failed with `ERROR 1698` or `install-db` wrote to `./data`:

```bash
./scripts/fix-mysql-local.sh
MYSQL_PWD='aumraj@123' ./scripts/import-local-db.sh
```

**Why this happens on Arch:** MariaDB root uses `unix_socket` auth until a password is set — you must use `sudo mariadb`, not plain `mysql -u root`. Also `mariadb-install-db` must target `--datadir=/var/lib/mysql`, not the current directory.

This will:

1. Install and start MariaDB (`pacman -S mariadb`)
2. Set MySQL `root` password to `aumraj@123`
3. Create database `aumraj_local`
4. Import `aumraj-production.sql.gz`
5. Update `.env.local` and symlink `.env` → `.env.local`

### Manual steps

**Install MariaDB (Arch):**

```bash
sudo pacman -S mariadb
sudo mariadb-install-db --user=mysql --basedir=/usr
sudo systemctl enable --now mariadb
sudo mariadb -e "ALTER USER 'root'@'localhost' IDENTIFIED BY 'aumraj@123'; FLUSH PRIVILEGES;"
```

**Import dump:**

```bash
cd ~/projects/aumraj-crm
MYSQL_PWD='aumraj@123' ./scripts/import-local-db.sh
```

**Environment file** (note `@` encoded as `%40` in the URL):

```env
DATABASE_URL="mysql://root:aumraj%40123@localhost:3306/aumraj_local"
NEXTAUTH_URL="http://localhost:5500"
NEXTAUTH_URL_INTERNAL="http://127.0.0.1:5500"
```

**Start app:**

```bash
npm run dev
```

### Re-import after a fresh VPS dump

```bash
# On VPS
mysqldump -u root -p \
  --single-transaction --routines --triggers --hex-blob \
  production > ~/aumraj-production.sql
gzip ~/aumraj-production.sql

# On local machine
scp USER@VPS:~/aumraj-production.sql.gz ~/projects/aumraj-crm/
MYSQL_PWD='aumraj@123' ./scripts/import-local-db.sh
```

To replace all local data, drop and recreate first:

```bash
MYSQL_PWD='aumraj@123' mysql -u root -e "DROP DATABASE IF EXISTS aumraj_local;"
MYSQL_PWD='aumraj@123' ./scripts/import-local-db.sh
```

---

## Production migration (old VPS → new VPS)

**Start here:** [PRODUCTION_DEPLOY.md](./PRODUCTION_DEPLOY.md) — full start-to-finish runbook (dump → SCP → MySQL on Ubuntu → restore → clone → `.env.production` → deploy → HTTPS).

The sections below are a shorter reference and overlap with that guide.

### Overview

```mermaid
flowchart LR
  OldVPS["Old VPS MySQL production"]
  Dump["mysqldump .sql.gz"]
  NewVPS["New VPS MySQL production"]
  App["Next.js + nginx"]

  OldVPS --> Dump
  Dump --> NewVPS
  NewVPS --> App
```

### Step 1 — Backup on old VPS

Run in the **shell**, not inside the `mysql>` prompt:

```bash
mysqldump -u root -p \
  --single-transaction \
  --routines \
  --triggers \
  --hex-blob \
  production > ~/aumraj-production-$(date +%F).sql

gzip ~/aumraj-production-$(date +%F).sql
```

`--single-transaction` avoids long table locks on InnoDB tables during the dump.

### Step 2 — Transfer to new VPS

```bash
scp USER@OLD_VPS:~/aumraj-production-YYYY-MM-DD.sql.gz USER@NEW_VPS:~/
```

### Step 3 — Restore on new VPS

```bash
mysql -u root -p -e \
  "CREATE DATABASE production CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

gunzip -c ~/aumraj-production-YYYY-MM-DD.sql.gz | mysql -u root -p production
```

Verify:

```bash
mysql -u root -p production -e "SHOW TABLES; SELECT COUNT(*) FROM staffs;"
mysql -u root -p production -e "SELECT migration_name FROM _prisma_migrations;"
```

### Step 4 — App config on new VPS

1. Copy `infra/env/.env.production.example` → `.env.production`
2. Set `DATABASE_URL` to the new server's MySQL credentials
3. Keep or rotate `NEXTAUTH_SECRET` (rotating logs everyone out)
4. Set `NEXTAUTH_URL=https://kra.aumraj.in`

### Step 5 — Deploy application

```bash
cd /var/www/aumraj-crm
./scripts/deploy.sh production
```

`deploy.sh` runs `prisma migrate deploy`, which should be a **no-op** if `_prisma_migrations` was included in the dump. If migrations are missing, Prisma will apply pending ones.

### Step 6 — Migrate uploaded files

Database rows reference filenames on disk. Copy uploads separately:

```bash
rsync -avz OLD_VPS:/var/www/aumraj-crm/public/uploads/ /var/www/aumraj-crm/public/uploads/
rsync -avz OLD_VPS:/var/www/aumraj-crm/public/images/pfp/ /var/www/aumraj-crm/public/images/pfp/
```

### Step 7 — Cutover

1. Stop writes on old server (maintenance mode or stop app)
2. Take a **final** incremental dump if the DB changed since step 1
3. Restore final dump on new server
4. Re-rsync uploads
5. Update DNS for `kra.aumraj.in` to new VPS IP
6. Enable HTTPS: `sudo certbot --nginx -d kra.aumraj.in -d www.kra.aumraj.in`
7. Smoke-test login, reports, PDF uploads

### Step 8 — Keep old server as rollback

Retain old VPS + DB for 24–48 hours before decommissioning.

---

## Bad practices (avoid these)

This section documents mistakes found in the current setup or common during migration. **Do not repeat these in production.**

### 1. Committing secrets to git

**Bad:** Tracking `.env` with real `DATABASE_URL`, `NEXTAUTH_SECRET`, and passwords in the repository.

**Why it's bad:** Anyone with repo access gets production credentials. Secrets persist in git history even after deletion.

**Do instead:** Use `.env.example` with placeholders. Keep `.env`, `.env.local`, `.env.production` in `.gitignore`. Rotate any password that was ever committed.

### 2. Using the production database name locally without thinking

**Bad:** Pointing local `.env` at `production` database on localhost while sharing the same DB name as prod.

**Why it's bad:** Confusing, easy to run destructive scripts against the wrong data, and `import.ts` explicitly wipes tables.

**Do instead:** Use a separate database name locally (`aumraj_local`). Import prod dumps into that isolated database.

### 3. Running `mysqldump` inside the MySQL client

**Bad:**

```sql
mysql> mysqldump -u root -p production > dump.sql;
```

**Why it's bad:** `mysqldump` is a shell command, not SQL. You get a syntax error.

**Do instead:** Exit `mysql>` (`exit` or Ctrl+D) and run `mysqldump` from bash.

### 4. Passing passwords on the command line in production scripts

**Bad:** `mysql -u root -pskjj54kol` or `mysqldump -u root -ppassword` in shared scripts, shell history, or documentation on live servers.

**Why it's bad:** Password visible in `ps`, `.bash_history`, and process lists.

**Do instead:** Use `-p` interactively, `MYSQL_PWD` in a restricted env file (local dev only), or `~/.my.cnf` with `chmod 600` on servers.

### 5. `NEXTAUTH_URL` mismatch with app port

**Bad:** App on port `5500` but `NEXTAUTH_URL=http://localhost:3000`.

**Why it's bad:** Broken OAuth callbacks, redirect loops, session cookie issues.

**Do instead:** `NEXTAUTH_URL` must match the URL users actually visit (including port locally).

### 6. Duplicate nginx server blocks

**Bad:** Two `server` blocks with the same `server_name` proxying to different ports (`5500` and `10929`).

**Why it's bad:** Unpredictable routing; one block silently wins.

**Do instead:** One server block per hostname. Remove legacy configs.

### 7. Migrating DB but forgetting filesystem uploads

**Bad:** Restoring MySQL only; SLA PDFs (`public/uploads/`) and profile photos (`public/images/pfp/`) stay on old server.

**Why it's bad:** DB has `pdfLocation` filenames pointing to files that don't exist on the new server.

**Do instead:** Always rsync upload directories as part of migration.

### 8. No verification after import

**Bad:** Assuming import succeeded without checking row counts or testing login.

**Do instead:**

```bash
mysql -u root -p aumraj_local -e "SELECT COUNT(*) FROM staffs; SELECT COUNT(*) FROM customer;"
npx prisma migrate status
npm run dev  # test login
```

### 9. Running `import.ts` against production

**Bad:** Executing `import.ts` (which `deleteMany`s all core tables) against a live or prod-restored database.

**Why it's bad:** Wipes all staff, customers, funnel, SLA, and support data.

**Do instead:** Only use `import.ts` with `nodeData/` JSON on an empty dev database.

### 10. Weak or placeholder secrets in production

**Bad:** `NEXTAUTH_SECRET="NEXTAUTH_SECRET"` or short guessable passwords.

**Why it's bad:** Session tokens can be forged; accounts compromised.

**Do instead:** `openssl rand -base64 32` for `NEXTAUTH_SECRET`. Strong unique MySQL passwords per environment.

### 11. No backup before migration

**Bad:** Restoring a dump over the only copy of production without a backup.

**Do instead:** Always backup before restore:

```bash
./scripts/backup-db.sh production   # on VPS, after setup
```

### 12. Using `root` MySQL user in production

**Bad:** Application connects as MySQL `root` on a public-facing VPS.

**Why it's bad:** SQL injection or app compromise gives full server DB admin access.

**Do instead:** Create a dedicated MySQL user (e.g. `aumraj`) with grants only on `production.*`. Using `root` locally for dev-only setup is acceptable; not for production.

---

## Quick reference

| Task | Command |
|------|---------|
| Local MySQL setup + import | `./scripts/setup-mysql-local.sh` |
| Re-import dump only | `MYSQL_PWD='aumraj@123' ./scripts/import-local-db.sh` |
| VPS backup | `mysqldump ... production \| gzip > backup.sql.gz` |
| VPS restore | `gunzip -c backup.sql.gz \| mysql -u root -p production` |
| Prod deploy after restore | `./scripts/deploy.sh production` |
