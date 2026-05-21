# 01 — Roles and Access

## Purpose

Define who can access which UI surfaces and API capabilities: staff (`/users`), group heads (`/group`), administrators (`/admin`), and how JWT session fields and middleware enforce (or fail to enforce) those boundaries.

## Actors

| Actor | Identification | Primary surface |
|-------|----------------|-----------------|
| **Staff** | Any authenticated `Staffs` row | `/users/*` |
| **Admin** | `permissions.admin = true` | `/admin/*` |
| **Group head** | `group.headId = session.user.id` | `/group/*` |
| **Permissioned staff** | JWT flags: `support`, `slaEntry`, `slaReport`, `funnel` | Sub-routes on `/users` |

Group capability is separate from JWT: boolean flags on `Group` (`scores`, `funnel`, `support`, `reports`, `hierarchy`, `sla`).

## Inputs

### Login (`POST` via NextAuth Credentials)

- `email` → matched to `staffs.emailId`
- `password` → bcrypt compare against `staffs.hash`

### JWT / session payload (`authOptions.ts`)

After login, token and session include:

| Field | Source |
|-------|--------|
| `id` | `staffs.id` |
| `email` | `staffs.emailId` |
| `name`, `post` | `staffs` |
| `admin` | `permissions.admin` |
| `support` | `permissions.support` |
| `slaEntry` | `permissions.slaEntry` |
| `slaReport` | `permissions.slaReport` |
| `funnel` | `permissions.funnel` |
| `updatedAt` | `staffs.updatedAt` |

**Note:** `funnel` is stored in JWT but **not** checked by `middleware.ts` for funnel pages.

### Middleware matcher (`middleware.ts`)

```text
matcher: ['/users/:path*', '/admin/:path*', '/groups/:path*']
```

Enforced redirects (non-holder → `/users/permissions`):

| Path prefix | Required token |
|-------------|----------------|
| `/admin/*` | `admin` |
| `/users/sla/entry` | `slaEntry` |
| `/users/support/add` | `support` |

## Business rules

1. **Authentication:** All matched routes require a valid JWT (`authorized: !!token`). Sign-in page: `/`.
2. **Admin routes:** Non-admins hitting `/admin/*` are redirected to permissions page (not signed out).
3. **SLA entry / support add:** Same redirect pattern for missing `slaEntry` / `support`.
4. **Group routes:** UI lives under `/group/*`, but middleware matches **`/groups/*`** (plural) — group pages are **not** protected by this middleware file. See [LOGIC_REVIEW.md](../LOGIC_REVIEW.md).
5. **API authorization:** Most API routes call `getServerSession` and check `session.user.admin` or group flags per handler; inconsistent across routes (documented in LOGIC_REVIEW).
6. **Session invalidation:** `GET /api/auth/validate-session` compares `staffs.updatedAt` in DB vs session; mismatch → 401 → client signs out. Triggered from user home on load.
7. **Permissions staleness:** JWT flags are fixed at login until re-login or invalidation via `updatedAt` change (e.g. admin updates permissions).
8. **Group head:** Resolved by `prisma.group.findFirst({ where: { headId: session.user.id } })`; `members` is JSON array of staff IDs.

## Calculations

None.

## Outputs

- Redirect to `/users/permissions` when middleware denies access
- Valid session: `{ message: 'Valid session' }`
- Invalid session: `{ message: 'Session invalidated. Please log in again.' }`

## API endpoints

| Endpoint | Method | Access |
|----------|--------|--------|
| `/api/auth/[...nextauth]` | * | Public (login) |
| `/api/auth/validate-session` | GET | Authenticated |
| `/api/admin/updatePermissions` | POST | Admin |
| `/api/admin/register` | POST | Admin (new staff) |
| `/api/group/permissions` | GET | Group head |

## Edge cases

| Issue | Behavior |
|-------|----------|
| `/group` vs `/groups` middleware | Group UI unprotected by middleware matcher typo |
| `funnel` JWT unused in middleware | Funnel pages reachable if linked; API may still check |
| `console.log` token in middleware | Logs full JWT in server logs (dev noise / leakage risk) |
| Group APIs | Often check `groupData.scores` / `funnel` / `reports` inconsistently |
| No ownership on some updates | Support/task/funnel updates by ID without staff check — see LOGIC_REVIEW P0 |

Cross-reference: [LOGIC_REVIEW.md](../LOGIC_REVIEW.md) — P0 auth/IDOR, P1 scoping.
