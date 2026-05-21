# 10 — Groups, Tasks, and Notifications

## Purpose

**Groups:** Organize staff under a head with feature flags for delegated reporting.

**Tasks:** Admin assigns work items; staff complete with remarks.

**Notifications:** Composite feed of birthdays, scoring messages, funnel wins, support events.

## Actors

| Actor | Actions |
|-------|---------|
| **Admin** | Create/update/delete groups; assign tasks |
| **Group head** | Reports/scoring/funnel per group flags |
| **Staff** | Complete own tasks; receive notifications |

## Inputs

### Group model

| Field | Description |
|-------|-------------|
| `name` | Group label |
| `head`, `headId` | Display name + `staffs.id` of head |
| `members` | JSON array of staff UUID strings |
| `scores`, `funnel`, `support`, `reports`, `hierarchy`, `sla` | Boolean feature flags |

### Task model

| Field | Description |
|-------|-------------|
| `staffsId` | Assignee |
| `message` | Task text |
| `date` | Created |
| `remark` | Completion note |
| `markTime` | When completed |
| `taskChecked` | Boolean, default false |

### Task remark (`POST /api/user/tasks/remark`)

`{ id, remark }` — sets `taskChecked: true`, `markTime: now()`.

## Business rules

1. **One group per staff:** `Staffs.groupId` unique optional FK.
2. **Head resolution:** APIs use `findFirst({ headId: session.user.id })`.
3. **Member scope:** Funnel/activity reports use `employee.id IN group.members`.
4. **Flag checks (examples):**
   - `scores` — group score report, mark score, funnel **fetch** (quirk)
   - `funnel` — funnel update
   - `reports` — activity/conveyance reports
5. **Tasks:** Staff list from `/api/user/tasks` filtered to assignee; remark API does **not** verify `staffsId === session.user.id`.
6. **Admin tasks report:** `/api/admin/reports/tasks`.
7. **Notifications:** Built on each `GET /api/user/notifications` — full table scans, no pagination.

## Calculations

None for groups/tasks.

### Notification time windows

| Type | Window |
|------|--------|
| `funnel_added` (Won) | `closureDate` in last **2 days** |
| `support_added` | `addDate` last **1 day** |
| `support_closed` | `closeDate` last **1 day** |
| `message` | Activity `notification` set, unchecked, for **session user** |
| `birthday`, `anniversary`, `join` | `DATE_FORMAT(date, '%m-%d') = today`, active staff |

## Outputs

- Group management UI (admin)
- Group sidebar: funnel, scores, reports mirroring admin subsets
- Task cards on user home with remark modal
- Notification list merged: `[...occasions, ...messages, ...funnelCases, ...supportAdded, ...supportClosed]`

## API endpoints

| Endpoint | Method | Notes |
|----------|--------|-------|
| `/api/admin/groups/new` | POST | Create group |
| `/api/admin/groups/fetch` | GET | List |
| `/api/admin/groups/update/permissions` | POST | Flags |
| `/api/admin/groups/update/delete` | POST | Delete |
| `/api/admin/addTask` | POST | Create task |
| `/api/admin/reports/tasks` | POST | Task report |
| `/api/user/tasks` | GET | My tasks |
| `/api/user/tasks/remark` | POST | Complete |
| `/api/user/tasks/markRead` | POST | Mark read |
| `/api/user/notifications` | GET | Feed |
| `/api/group/permissions` | GET | Head flags |
| `/api/group/mark/score` | POST | Team scoring |
| `/api/group/mark/dates` | POST | Bulk dates |
| `/api/group/mark/employees` | POST | Reassign |

## Edge cases

| Case | Detail |
|------|--------|
| Task remark IDOR | Any task ID completable by any user |
| Funnel fetch uses `scores` flag | Misnamed permission check |
| Notifications global | Won/support events show all staff activity |
| `members` JSON | Not validated as subset of org on every API |

See [LOGIC_REVIEW.md](../LOGIC_REVIEW.md).
