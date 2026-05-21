# 02 — Activity and Scoring

## Purpose

Staff log daily customer interactions (meetings, office work, telecalling). Managers score activities for performance tracking, conveyance eligibility, and incentive calculations.

## Actors

| Actor | Actions |
|-------|---------|
| **Staff** | Create activities; view own score report |
| **Admin** | Score activities; edit/delete via activity report; view all staff |
| **Group head** | Score team activities (`group.scores`); view team activity report (`group.reports`) |

## Inputs

### Activity create (`POST /api/user/addActivity`)

| Field | Office | Meeting / Telecalling |
|-------|--------|----------------------|
| `type` | `Office` | `Meeting` or `Telecalling` |
| `date` | Required | Required |
| `activity` | Text (min 10 chars client-side) | Same |
| `companyId` / `personId` | null | Required unless new |
| `isNewCompany`, `companyName` | — | Optional create `Customer` |
| `isNewPerson`, `personName`, `emailId`, `phoneNo` | — | Optional create `Person` + `PersonStaff` |
| `from`, `to`, `km`, `parking` | null | Meeting: locations + distance + parking |

`location` stored as `type` string (`Meeting`, `Office`, `Telecalling`).

### Client validation (`users/activity/page.tsx`)

- Date not empty, not future
- **Backdate limit:** not older than **3 days**
- Activity text **minimum 10 characters**
- Meeting/Telecalling: company/person rules; `phoneRegex`, `emailRegex` for new person
- New company forces new person

### Scoring (`POST /api/admin/mark/score` or `/api/group/mark/score`)

| Field | Description |
|-------|-------------|
| `activityIds` | Array of UUIDs |
| `score` | Integer stored on activity |
| `message` | `notification` text to staff |

## Business rules

1. **On create:** `checked = false`, `score = null`, `checkedBy = ''`, `notificationChecked = null`.
2. **Office:** No company, person, distance, or parking.
3. **New customer:** `Customer` row with `companyName` only; `companyId` assigned.
4. **New person:** `Person` with `entryCount: 1`; `PersonStaff` links `staffId` + `personId`.
5. **Existing person:** Uses provided `personId` (no automatic PersonStaff if missing).
6. **Scoring:** Sets `checked = true`, `checkedBy = session.user.id`, `notificationChecked = false`, optional `notification` message.
7. **No DB transaction** on addActivity (company + person + activity can partially commit).
8. **Conveyance:** Only `location = 'Meeting'` rows with `distance` / `parkingCost` count toward conveyance reports.

## Calculations

Scoring does not compute formulas server-side; score is an assigned integer.

Downstream:

- **Performance dashboard:** daily `MAX(score)` per staff per day, summed per month — see [09-billing-and-dashboard.md](./09-billing-and-dashboard.md).
- **Score pivot report:** sums **all** activity `score` values per month key — see [06-reports-scores-and-incentives.md](./06-reports-scores-and-incentives.md).

## Outputs

- Created `Activity` JSON from API
- Staff notifications of type `message` when `notification` set and `notificationChecked = false`
- Admin/group activity grids with score column (editable on admin)

## API endpoints

| Endpoint | Method | Actor | Notes |
|----------|--------|-------|-------|
| `/api/user/addActivity` | POST | Staff | Create |
| `/api/user/reports/score` | POST | Staff | Own rows, infinite scroll |
| `/api/user/reports/activity` | POST | Staff | Own activity list |
| `/api/user/search/activity` | GET | Staff | Search |
| `/api/admin/reports/activity` | POST | Admin | All staff |
| `/api/admin/reports/activity/update` | POST | Admin | Inline edit |
| `/api/admin/mark/score` | POST | Admin | Bulk score |
| `/api/admin/mark/dates` | POST | Admin | Date bulk edit |
| `/api/admin/mark/employees` | POST | Admin | Reassign staff |
| `/api/group/reports/activity` | POST | Group | Members in `group.members` |
| `/api/group/mark/score` | POST | Group | `scores` flag |
| `/api/admin/purge/activity` | POST | Admin | deleteMany by IDs |

## Edge cases

| Case | Behavior |
|------|----------|
| `from`/`to` empty string | Stored as `null` (buggy check `== '' \|\| undefined`) |
| `km`/`parking` empty | `null` / not parsed |
| Delete activity | Admin confirm warns conveyance + scores lost |
| Group activity `count` | Uses `filterModel` without member AND — wrong total — LOGIC_REVIEW |
| Purge activity | No validation of ID ownership |

See [LOGIC_REVIEW.md](../LOGIC_REVIEW.md).
