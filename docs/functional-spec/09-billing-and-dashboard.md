# 09 — Billing and Dashboard

## Purpose

Track company billing target vs achievement, drive incentive percentage, and power the staff home dashboard (performance charts, leaderboards, summaries, tasks, notifications).

## Actors

| Actor | Access |
|-------|--------|
| **Staff** | Home `/users` — dash, performance, summaries, notifications, tasks |
| **Admin** | Billing add/update/report under `/admin` |

## Inputs

### Settings + BillingData

- `Settings.target` — single integer target (org-wide).
- `BillingData` — history of `{ billingId (timestamp), amount }`; **latest by `billingId DESC`** is “achieved”.

### Dash (`GET /api/user/dash`)

Uses session user for `salary`, `joinDate`; billing is **global** (not per user).

## Business rules

1. **billingPercentage** returned as string with one decimal: `(achieved/target*100).toFixed(1)`.
2. **workMonths** — same FY logic as incentives (doc 06).
3. **Performance** — FY bounded activity scores; leaderboards use **calendar month** not FY for highest/lowest/last.
4. **Top companies / top POs** — Won funnel in current `financialYear()` by `closureDate`, ordered by `topLine`.
5. **Summaries** — org-wide SQL for current month funnel count, AMC types, support status, SLA expiry list (see doc 04).
6. **Team average bug:** `employeeCount` uses `NOT: { leaveDate: null }` which counts **left** employees — inflates/deflates divisor incorrectly.

## Calculations

### Billing achievement percent

```text
billingAchieved = BillingData.amount (latest row)
billingTarget   = Settings.target
billingPercentage = (billingAchieved / billingTarget) × 100
```

**Edge:** `target = 0` → division by zero (no guard).

### workMonths (dash)

```text
monthDiff(a,b) = (b.month - a.month) + 12×(b.year - a.year) + 1
workMonths = joinDate < FY.start ? monthDiff(FY.start, FY.end) : monthDiff(joinDate, FY.end)
```

### Performance monthly score (SQL)

```sql
-- Per day per staff: MAX(score)
-- Per month per staff: SUM(daily_max)

userRaw: filtered to session staffsId, FY date range
team: all staff, average of sumScore per month across staff count (buggy count)
```

### Team chart series

```text
team[month].score = parseInt(totalScore / count) || 0
```

where `count` = number of staff with data that month (not same as `employeeCount` query).

### User FY score on home

```text
userFyScore = floor( mean(userData monthly scores) )
teamFyScore = floor( mean(teamData monthly scores) )
```

### Incentive on home

```text
incentive = floor(salary × workMonths × factor × (billingAchieved / billingTarget))
```

(`factor` from tier on `userFyScoreTemp` — performance-based average, strict inequalities.)

### Leaderboards (current calendar month)

- **highest:** max sum of daily MAX scores this month, active staff (`leaveDate IS NULL`).
- **lowest:** min sum, same month.
- **last:** top performer **previous calendar month**.

## Outputs

| Widget | Source |
|--------|--------|
| Billing target / achieved / % | dash |
| Yearly incentive estimate | dash + performance tiers |
| Performance line chart | performance `user` vs `team` |
| Highest / lowest / last month | performance |
| Top 5 Won companies / POs | performance |
| Funnel/AMC/support summary tables | summaries |
| AMC expiry warnings | summaries |
| Tasks list | `/api/user/tasks` |
| Notifications feed | `/api/user/notifications` |

## API endpoints

| Endpoint | Method | Notes |
|----------|--------|-------|
| `/api/user/dash` | GET | Billing + salary + workMonths |
| `/api/user/performance` | GET | Charts + leaderboards |
| `/api/user/summaries` | GET | Org rollups |
| `/api/user/tasks` | GET | Assigned tasks |
| `/api/admin/billing/add` | POST | New BillingData row |
| `/api/admin/billing/update` | POST | Update target? / data |
| `/api/admin/billing/report` | POST | History report |

## Edge cases

| Case | Detail |
|------|--------|
| Divide by zero | `billingTarget = 0` |
| employeeCount inverted | Counts leavers not active staff |
| Summaries on user home | Full org data exposure |
| performance `employeeCount` unused correctly | Team average skew |
| financialYear() called twice | Top companies query re-instantiates FY |

See [LOGIC_REVIEW.md](../LOGIC_REVIEW.md).
