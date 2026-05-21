# 07 — Reports: Conveyance and Activity

## Purpose

**Activity reports:** Searchable grids of work logs (admin/group can score or review).

**Conveyance reports:** Reimbursement totals for **Meeting** activities using per-staff `conveyanceCost` rate and parking.

## Actors

| Actor | Activity report | Conveyance report |
|-------|-----------------|-------------------|
| **Staff** | Own (`/users/reports/activity` if exists) / scores | `/users/reports/conveyance` |
| **Admin** | `/admin/reports/activity` | `/admin/reports/conveyance` |
| **Group head** | `/group/reports/activity` (`reports`) | `/group/reports/conveyance` (`reports`) |

## Inputs

### Conveyance month aggregate

POST body: `{ filterModel }` — client may pass AG Grid date filters.

Server overrides:

```javascript
filterModel.location = 'Meeting'
filterModel.staffsId = session.user.id   // user route only
```

Default month if no `date` filter:

```javascript
gte = first day of current month
lte = last day of current month
```

### Conveyance multi-staff calc (admin/group)

```javascript
filterModel.location = 'Meeting'
// staffsId filter from grid — all matching staff
```

`groupBy ['staffsId']` with `_sum.distance`, `_sum.parkingCost`.

## Business rules

1. **Only Meeting** rows qualify (`location = 'Meeting'`).
2. **Telecalling** has company/person but no conveyance in formula.
3. **Office** has null distance/parking.
4. **Default conveyance rate:** `staffs.conveyanceCost` default **6** (schema).
5. **Admin calc:** Per staff group: `costEmp × sum(distance) + sum(parkingCost)`; totals summed across staff.
6. **Group calc:** Same formula as admin (~duplicate code in `group/reports/conveyance/calc` and `admin/reports/conveyance/calc`).
7. **Activity admin update:** Inline field updates; delete warns about conveyance + scores.
8. **Group activity list:** Filters `employee.id IN group.members` for rows; **count** query omits member filter (bug).

## Calculations

### Per staff (user month endpoint)

```text
distance = SUM(activity.distance) WHERE location='Meeting' AND filters
parking  = SUM(activity.parkingCost)

cost = distance × staffs.conveyanceCost + parking
```

If sums null, API may return `cost: null` → UI shows 0.

### Admin/group multi-staff

```text
totalCost = Σ_staff ( conveyanceCost_staff × Σ distance_staff + Σ parking_staff )
```

Equivalent to summing each Meeting row’s `distance × rate + parking` when rate is constant per staff.

## Outputs

| Output | Description |
|--------|-------------|
| Conveyance card | INR formatted total for selected month/filters |
| Activity grid | date, location, activity text, company/person, staff name (group/admin) |
| Distance/parking breakdown | Returned in month API JSON (optional display) |

## API endpoints

| Endpoint | Method | Actor |
|----------|--------|-------|
| `/api/user/reports/conveyance` | POST | Staff grid rows |
| `/api/user/reports/conveyance/month` | POST | Staff monthly total |
| `/api/admin/reports/conveyance` | POST | Admin grid |
| `/api/admin/reports/conveyance/calc` | POST | Admin total |
| `/api/group/reports/conveyance` | POST | Group grid |
| `/api/group/reports/conveyance/calc` | POST | Group total |
| `/api/user/reports/activity` | POST | Staff |
| `/api/admin/reports/activity` | POST | Admin |
| `/api/admin/reports/activity/update` | POST | Admin |
| `/api/group/reports/activity` | POST | Group |

## Edge cases

| Case | Detail |
|------|--------|
| Null distance/parking | SUM null → NaN cost unless guarded |
| `filterModel` passed to Prisma raw | Client-controlled keys — injection/style risk |
| Group conveyance without member filter on calc | May include non-members if grid filter empty |
| Duplicate admin/group calc | Maintenance burden — LOGIC_REVIEW P3 |

See [LOGIC_REVIEW.md](../LOGIC_REVIEW.md).
