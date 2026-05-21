# 03 — Funnel Pipeline

## Purpose

Track sales opportunities from open pipeline (Hot/Mild/Cold) through closure (Won/Lost/Dropped), with charts, FY summaries, hit-rate reporting, and Excel export.

## Actors

| Actor | Actions |
|-------|---------|
| **Staff** | CRUD own funnel; funnel report; charts (`funnel` permission for some UI) |
| **Admin** | All funnel; export; summary tables; update any row |
| **Group head** | Team funnel if `group.funnel`; list fetch checks `group.scores` (quirk) |

## Inputs

### Funnel record (`Funnel` model)

| Field | Type | Notes |
|-------|------|-------|
| `companyId`, `personId` | FK | Required on create |
| `type` | string | e.g. Supply/Support, AMC/Software (Settings or `lists.funnelType`) |
| `opportunity` | string | Settings / `lists.opportunity` |
| `oem` | string | Settings / `lists.oem` |
| `topLine`, `bottomLine` | float | PO value bands |
| `description` | text | |
| `status` | string | Open: Hot, Mild, Cold; Terminal: Won, Lost, Dropped |
| `closureDate` | date | |
| `date` | datetime | Entry default `now()` |
| `staffsId` | string | Owner |

### Default list filter (user/admin/group fetch)

If no status filter: `status IN ['Hot', 'Mild', 'Cold']`.

Comma-separated status filter normalized to title case (`Hot`, `Mild`, etc.).

### Export (`Export.tsx` + `/api/admin/funnel/export`)

Dataset: **Past** (left staff), **Current** (active), **All**.

Filename: `FUNNEL_[PAST|CURRENT|ALL].xlsx` (parent `funnel` → `FUNNEL` + flag).

## Business rules

1. **Open pipeline:** Hot, Mild, Cold shown by default; terminal statuses hidden unless filtered.
2. **Charts:** Pie/bar aggregations include only Hot, Mild, Cold (not Won/Lost/Dropped).
3. **Won reporting:** `status = 'Won'` and `closureDate` within FY for top PO / company leaderboards.
4. **Hit % summary:** Groups by month label `DATE_FORMAT(date, '%b-%y')`; `HAVING COUNT > 1` excludes sparse months.
5. **Group scope:** Funnel rows where `employee.id IN group.members`.
6. **Group update:** Requires `group.funnel`; updates by `funnelId` only (no member check on row).
7. **Settings `funnelStatus`:** Only Cold, Mild, Hot — terminal statuses are **hardcoded in UI/SQL**, not in Settings JSON.

## Calculations

### Hit percentage (monthly summary SQL)

```text
hitPercentage = IF(totalFunnelCases > 0,
  (wonCases / totalFunnelCases) * 100,
  0)
```

Where:

- `wonCases = COUNT(CASE WHEN status = 'Won' THEN 1 END)`
- `totalFunnelCases = COUNT(funnelId)`

Rounded in SQL with `ROUND(...)`.

### Date window (user summary — current behavior)

```javascript
dateEnd = new Date().setDate(31)   // day-of-month 31 — overflow risk
dateStart = setMonth(getMonth() - 12) with setDate(1)
```

Filter: `f.date BETWEEN dateStart AND dateEnd` for current staff.

## Outputs

- AG Grid infinite scroll funnel lists
- Chart series (opportunity/OEM/status distributions for open statuses)
- Summary tables: `wonCases`, `totalFunnelCases`, `hitPercentage` per month
- Export XLSX

## API endpoints

| Endpoint | Method | Scope |
|----------|--------|-------|
| `/api/user/funnel/add` | POST | Own |
| `/api/user/funnel/update` | POST | Own |
| `/api/user/funnel/fetch` | POST | Own, default open statuses |
| `/api/user/funnel/fetch/summary` | GET | Own monthly hit % |
| `/api/user/funnel/charts` | POST | Own |
| `/api/admin/funnel/fetch` | POST | All |
| `/api/admin/funnel/update` | POST | Admin |
| `/api/admin/funnel/fetch/summary` | GET | Org summaries |
| `/api/admin/funnel/charts` | POST | All |
| `/api/admin/funnel/export` | POST | Filtered export |
| `/api/group/funnel/fetch` | POST | Members; requires `scores` flag |
| `/api/group/funnel/update` | POST | Requires `funnel` flag |
| `/api/group/funnel/fetch/summary` | GET | Team |
| `/api/group/funnel/charts` | POST | Team |

## Edge cases

| Case | Detail |
|------|--------|
| `setDate(31)` | Invalid dates in months with <31 days — LOGIC_REVIEW P1 |
| Group fetch vs update flags | Fetch checks `scores`, update checks `funnel` |
| Status enum mismatch | Settings vs Won/Lost/Dropped |
| Summary `HAVING COUNT > 1` | Months with 1 funnel row excluded |
| IDOR group update | Any `funnelId` updatable if head has `funnel` |

See [LOGIC_REVIEW.md](../LOGIC_REVIEW.md).
