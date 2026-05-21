# 11 — Settings and Enums

## Purpose

Centralize dropdown values (OEM, funnel status, support types, etc.) and org billing target in the database, with hardcoded fallbacks in `src/libs/consts.ts` when Settings row is missing or for static UI lists.

## Actors

| Actor | Actions |
|-------|---------|
| **Admin** | Edit Settings via Tags UI → `POST /api/admin/updateSettings` |
| **All authenticated** | Read `GET /api/settings` |

## Inputs

### Settings model (single row expected)

| JSON field | Purpose |
|------------|---------|
| `oem` | OEM dropdown |
| `slaSupportType` | SLA support type |
| `slaType` | SLA tier |
| `supportType` | Support category |
| `opportunity` | Funnel opportunity |
| `funnelType` | Funnel type |
| `funnelStatus` | **Open** statuses only: Cold, Mild, Hot |
| `supportStatus` | Support workflow statuses |
| `target` | Int — billing target |

### Fallback `lists` in `consts.ts`

Used when Settings unavailable or hardcoded in components:

| Key | Values (abbreviated) |
|-----|-------------------|
| `oem` | Commscope, Cisco, Juniper, … Others |
| `slaSupportType` | B2B, B2B + ATPL, ATPL |
| `supportType` | Support, Delivery, Payment |
| `slaType` | 8x5xNBD, 24x7 |
| `opportunity` | Cabling, Switching/Routing, Security, … |
| `funnelType` | Supply/Support, AMC/Software |
| `funnelStatus` | Cold, Mild, Hot |
| `supportStatus` | Planning, Progress, Issues, Closed |
| `months` | January … December |
| `years` | `"23"` … `"35"` (score matrix column planning) |
| `colors` | Chart hex colors |

### Hardcoded terminal funnel statuses

**Won**, **Lost**, **Dropped** — used in SQL and UI but **not** in Settings `funnelStatus` JSON.

## Business rules

1. `findFirst({})` on Settings — assumes one config row.
2. Admin update replaces JSON arrays and `target`.
3. Client pages typically fetch `/api/settings` on load via DataContext.
4. Score report column headers use dynamic month keys plus static `years` list for future columns.
5. Regex validators in consts: `phoneRegex`, `emailRegex` for activity forms.

## Calculations

```text
billingPercentage = latest BillingData.amount / Settings.target × 100
```

(see doc 09)

## Outputs

- JSON settings payload to client
- Dropdown options across funnel, support, SLA, activity forms
- Billing target display on dashboards

## API endpoints

| Endpoint | Method | Actor |
|----------|--------|-------|
| `/api/settings` | GET | Authenticated |
| `/api/admin/updateSettings` | POST | Admin |

## Edge cases

| Case | Detail |
|------|--------|
| Missing Settings row | `findFirst` null → runtime errors on dash |
| funnelStatus vs terminal | Enum mismatch in validation |
| Typo in lists | `Lenevo` in OEM list |
| Years 23–35 | Hardcoded; must align with pivot key logic |

See [LOGIC_REVIEW.md](../LOGIC_REVIEW.md).
