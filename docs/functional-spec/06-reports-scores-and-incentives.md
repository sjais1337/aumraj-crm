# 06 — Reports: Scores and Incentives

## Purpose

Visualize activity scores over time, compute FY average scores and incentive amounts tied to billing achievement, with different aggregation rules on staff vs admin/group pivot views.

## Actors

| Actor | View |
|-------|------|
| **Staff** | `/users/reports/scores` — flat list of own scored activities |
| **Admin** | `/admin/reports/scores` — pivot matrix `{mon}{yy}` + incentive column |
| **Group head** | `/group/reports/scores` — same pivot as admin for `group.members` |

## Inputs

### Staff score report

AG Grid infinite scroll:

- `startRow`, `endRow`, `filterModel`, `sortModel`
- Server forces `filterModel.staffsId = session.user.id`
- Columns: `date`, `activity`, `score`

### Admin/group score report

POST body:

| Field | Description |
|-------|-------------|
| `employee` | Optional single `staffsId`; else active staff (`leaveDate: null`) |
| `from`, `to` | Date range; empty → default **13-month** window |

Default date range when `from` empty:

```javascript
lte = end of current month
gte = first day of month (today - 13 months)
```

Uses `setMonth`/`setDate` on mutable `Date` — can mutate shared date state (bug).

### Billing input for incentive (quirk)

Admin and group score pages call **`GET /api/user/dash`** (not an admin billing route) to read `billingPercentage`, even when logged in as admin.

## Business rules

1. **Pivot transform:** Groups rows by `id` + month key `jan24`, `feb24`, … (`formatDate` → lowercase month + 2-digit year).
2. **Pivot aggregation:** **Sums** every activity `score` in that month (multiple activities same month add together).
3. **FY filter (default view):** Keeps month keys `>= financialYear().start` for average/incentive.
4. **Dedup before pivot:** Unique by `date_id` key keeps one row per day per staff in API response — but pivot still sums multiple scores if same month key from different days (intended) and multiple activities same day if dedup failed.
5. **Average for incentive:** `averageScore = sum(monthScores) / count(months with keys in FY)` (integer parse).
6. **Tier thresholds:** ≥250, ≥200, ≥150 (strict `>` on user home for factor; `>=` on admin/group pages — minor inconsistency).

## Calculations

### workMonths

```javascript
monthDiff(from, to) = (to.month - from.month) + 12 * (to.year - from.year) + 1

m = joinDate
workMonths = (m < FY.start) ? monthDiff(FY.start, FY.end) : monthDiff(m, FY.end)
```

### billingPercentage (from dash)

```text
billingPercentage = (latest BillingData.amount / Settings.target) * 100   // string fixed 1 decimal
```

Used as `parseFloat(billingPercentage) / 100` in incentive.

### Incentive amount (admin/group matrix)

```text
factor = 0.25 if averageScore >= 250
       = 0.15 if averageScore >= 200
       = 0.06 if averageScore >= 150
       = 0     otherwise

incentive = floor? (toFixed(0) string) of:
  factor × billingPercentage × salary × workMonths
```

(`billingPercentage` here is 0–1 fraction.)

### User home incentive (`users/page.tsx`)

Uses **mean of monthly performance scores** from `/api/user/performance` (daily MAX method), not pivot sum:

```text
userFyScoreTemp = average(user monthly scoreRaw from performance API)
factor = 0.25 | 0.15 | 0.06 | 0  (strict > 250, > 200, > 150)
incentive = floor(salary × workMonths × factor × (billingAchieved / billingTarget))
```

### Performance API (contrast) — see doc 09

```sql
Per day: MAX(score) GROUP BY DATE(date), staffsId
Per month: SUM(daily_max) GROUP BY month, staffsId
```

**Spec vs implementation gap:** Score report pivot **≠** performance dashboard monthly totals.

## Outputs

- Heatmap-colored pivot cells (tier color scales)
- Columns: month keys from `lists.years` / dynamic keys, `averageScore`, `incentive`
- Staff: simple chronological score list

## API endpoints

| Endpoint | Method | Notes |
|----------|--------|-------|
| `/api/user/reports/score` | POST | Own activities |
| `/api/admin/reports/score` | POST | All scores + salaries |
| `/api/group/reports/score` | POST | Team (`scores` flag) |
| `/api/user/dash` | GET | Billing % (used by admin UI) |
| `/api/user/performance` | GET | Monthly MAX-based series |

## Edge cases

| Case | Detail |
|------|--------|
| Date mutation in default 13-month | `tod.setMonth` mutates Date object |
| Admin uses user dash | Wrong scope if dash ever per-user billing |
| `includeOld` / employee null | FY slice logic only when filters default |
| Sep month key | Fixed in client `monthMap` after prior bugs |
| Performance vs pivot | Document both; do not assume equality |

See [LOGIC_REVIEW.md](../LOGIC_REVIEW.md).
