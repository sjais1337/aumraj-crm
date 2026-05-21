# 04 — Support and SLA (AMC)

## Purpose

**Support:** Track delivery/support/payment work items per customer with status workflow.

**SLA (AMC):** Contract registry with OEM, support type, dates, serial numbers, optional PDF contract file, archive flag.

## Actors

| Actor | Actions |
|-------|---------|
| **Staff** | List/update own support; add if `support` permission |
| **Staff (`slaEntry`)** | SLA entry pages |
| **Staff (`slaReport`)** | SLA report views |
| **Admin** | All support; AMC admin reports, export, purge archive |

## Inputs

### Support (`Support` model)

| Field | Description |
|-------|-------------|
| `companyId`, `personId` | Customer contact |
| `oem`, `type`, `status` | From Settings or `lists` fallbacks |
| `description` | Text |
| `addDate`, `closeDate` | Dates |
| `staffsId` | Owner |

**Types (fallback):** Support, Delivery, Payment — mapped oddly in org-wide summary SQL to Planning/Progress/Issues column names (legacy naming).

**Statuses (fallback):** Planning, Progress, Issues, Closed.

### SLA (`Sla` model)

| Field | Description |
|-------|-------------|
| `companyId`, `personId`, `staffsId` | Links |
| `oem`, `productDescription`, `sla`, `supportType` | Contract details |
| `slaStartDate`, `slaEndDate` | Active period |
| `contractId`, `serialNo` | Identifiers |
| `pdfLocation` | Filename under `public/uploads/` |
| `archived` | Boolean, default false |

**Support types (SLA):** B2B, B2B + ATPL, ATPL.

**SLA types:** 8x5xNBD, 24x7.

### PDF upload

Saved as `public/uploads/{slaId}.{ext}` (user AMC upload routes).

## Business rules

1. **Support add:** Middleware requires `support` for `/users/support/add`.
2. **Support update:** Builds `filtermodel` with `staffsId` when user lacks `support` permission — **but `where` only uses `supportId`** (ownership not enforced server-side).
3. **Default staff list filter:** Planning + Progress (Issues often admin-only in UI).
4. **Admin list:** Includes Issues status.
5. **SLA active summary:** `slaEndDate > CURRENT_DATE` grouped by support type counts.
6. **AMC expiry warnings:** Non-archived SLAs expiring within 30 days or already past `slaEndDate`.
7. **Notifications:** Support added (1 day), support closed (1 day) — org-wide queries, not scoped to user.
8. **Archive:** Admin purge routes for AMC archive/unarchive/delete.

## Calculations

### Org summary support status (`/api/user/summaries`)

Maps status to legacy column names:

| DB `support.status` | Summary column |
|----------------------|----------------|
| Planning | SUPPORT |
| Progress | DELIVERY |
| Issues | PAYMENT |

Counts per staff across **all** support rows (not filtered to session user).

### AMC days until expiry (client mapping)

```text
days = floor((slaEndDate - now) / 86400000)
display = max(0, days) if days <= 0 else floor(days)
```

## Outputs

- Support AG grids with inline update
- SLA entry forms and report grids
- Admin AMC export/count/report
- Dashboard widgets: AMC by type, expiry list, support status rollup

## API endpoints

| Endpoint | Method | Notes |
|----------|--------|-------|
| `/api/user/support/add` | POST | `support` perm |
| `/api/user/support/update` | POST | Field patch |
| `/api/user/support/fetch` | POST | Infinite scroll |
| `/api/admin/support` | POST | Admin list |
| `/api/admin/support/update` | POST | Admin |
| `/api/user/amc/add` | POST | SLA create |
| `/api/user/amc/update` | POST | SLA update |
| `/api/user/amc/fetch` | POST | List |
| `/api/user/amc/upload` | POST | PDF |
| `/api/admin/amc/report` | POST | Report |
| `/api/admin/amc/export` | POST | Export |
| `/api/admin/amc/count` | GET | Count |
| `/api/admin/amc/update` | POST | Admin edit |
| `/api/admin/purge/amc` | POST | Delete |
| `/api/admin/purge/amc/archive` | POST | Archive |
| `/api/admin/purge/amc/unarchive` | POST | Unarchive |
| `/api/user/summaries/support` | GET | Support slice |

## Edge cases

| Case | Detail |
|------|--------|
| Support update IDOR | Any authenticated user can patch any `supportId` |
| Summaries leak | Funnel/AMC/support rollups are org-wide on user home |
| Status vs type naming | Summary SQL labels do not match `supportType` list |
| `epbxAMCDute` | Typo in Prisma schema field name |

See [LOGIC_REVIEW.md](../LOGIC_REVIEW.md).
