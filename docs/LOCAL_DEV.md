# Local Development Setup

This guide covers running **aumraj-crm** on your machine for day-to-day development.

**Functional specification:** For business rules, report formulas, workflows, and API behavior (current implementation), see [functional-spec/README.md](./functional-spec/README.md). Known logic issues are cataloged in [LOGIC_REVIEW.md](./LOGIC_REVIEW.md).

## Prerequisites

- **Node.js** LTS (v18 or v20 recommended)
- **MySQL** 8.x running locally
- **Git**

Verify:

```bash
node -v
npm -v
mysql --version
```

## 1. Clone and install

```bash
cd ~/projects/aumraj-crm
npm install
```

`postinstall` runs `prisma generate` automatically.

## 2. Environment variables

Copy the example env file and edit it:

```bash
cp .env.example .env.local
```

Set these values in `.env.local`:

| Variable | Local value |
|----------|-------------|
| `DATABASE_URL` | `mysql://USER:PASS@localhost:3306/aumraj_local` |
| `NEXTAUTH_SECRET` | Generate with `openssl rand -base64 32` |
| `NEXTAUTH_URL` | `http://localhost:5500` |
| `NEXTAUTH_URL_INTERNAL` | `http://127.0.0.1:5500` |
| `NODE_ENV` | `development` |

**Prisma CLI note:** Prisma reads `.env` by default, not `.env.local`. After creating `.env.local`, symlink it for migrations:

```bash
ln -sf .env.local .env
```

Next.js loads both `.env` and `.env.local` in development.

## 3. Create the local database

```bash
mysql -u root -p -e "CREATE DATABASE aumraj_local CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
```

Optionally create a dedicated MySQL user instead of using `root`.

## 4. Run migrations

```bash
npx prisma migrate dev
```

This applies all migrations in `prisma/migrations/` to your local `aumraj_local` database.

For a fresh DB with no migration history (e.g. after importing a dump), use:

```bash
npx prisma migrate deploy
```

## 5. Start the dev server

```bash
npm run dev
```

Open [http://localhost:5500](http://localhost:5500) and sign in with a staff account from your database.

## Optional: import production data locally

To work with realistic data, import a dump from production into `aumraj_local`.

**Full guide:** [DATABASE_MIGRATION.md](./DATABASE_MIGRATION.md)

Quick path:

```bash
./scripts/setup-mysql-local.sh   # Arch: install MariaDB + import aumraj-production.sql.gz
```

## Upload directories

User uploads are stored on the filesystem:

- `public/uploads/` — SLA contract PDFs
- `public/images/pfp/` — staff profile photos

These directories are tracked in git with sample/seed files. New uploads during local dev stay local.

## Common commands

| Task | Command |
|------|---------|
| Dev server | `npm run dev` |
| Lint | `npm run lint` |
| Prisma Studio | `npx prisma studio` |
| Reset local DB schema | `npx prisma migrate reset` |
| Production build test | `npm run build && npm start` |

## Troubleshooting

**"Invalid Credentials" on login** — Staff must exist in the `staffs` table with a bcrypt `hash`. Import prod data or create a user via the admin register API.

**Prisma can't connect** — Check MySQL is running and `DATABASE_URL` in `.env` / `.env.local` is correct.

**NextAuth redirect issues** — Ensure `NEXTAUTH_URL` matches the port you use (`http://localhost:5500`), not port 3000.

**Port 5500 in use** — Stop the other process or temporarily change the port in `package.json` and `NEXTAUTH_URL`.

## First-time bootstrap script

Run the helper script for a guided setup:

```bash
./scripts/setup-local.sh
```
