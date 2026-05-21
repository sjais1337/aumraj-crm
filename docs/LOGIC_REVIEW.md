# Logic Review — Aumraj CRM

Engineering audit of **current** behavior: logic errors, security gaps, inconsistent scoping, and inefficiencies. Documentation only — not a fix list. Cross-referenced from [functional-spec](./functional-spec/README.md).

**Priority:** P0 (critical) → P3 (low/duplication).

---

## P0 — Auth / IDOR / data leak

### P0-1 Support update — no ownership enforcement

| | |
|---|---|
| **File** | `src/app/api/user/support/update/route.ts` |
| **What happens** | Builds `filtermodel` with `staffsId` when user lacks `support`, but `prisma.support.update` `where` is only `{ supportId }`. Any authenticated user can PATCH any ticket. |
| **Expected** | `where: { supportId, staffsId: session.user.id }` unless admin/support role. |
| **Impact** | Cross-user support tampering. |

### P0-2 Group funnel update — any funnel ID

| | |
|---|---|
| **File** | `src/app/api/group/funnel/update/route.ts` |
| **What happens** | Checks `group.funnel` then updates by `funnelId` only; no verify funnel owner ∈ `group.members`. |
| **Expected** | `where` includes staff in members list. |
| **Impact** | Group head can modify opportunities outside team. |

### P0-3 Task remark — any task ID

| | |
|---|---|
| **File** | `src/app/api/user/tasks/remark/route.ts` |
| **What happens** | Updates `tasks` by `id` with no `staffsId` check. |
| **Expected** | Only assignee may complete. |
| **Impact** | Close others’ tasks. |

### P0-4 User summaries — org-wide leak on staff home

| | |
|---|---|
| **File** | `src/app/api/user/summaries/route.ts` |
| **What happens** | Funnel, AMC, support status SQL aggregates **all staff**; exposed on `/users` dashboard. |
| **Expected** | Scoped to session user or role. |
| **Impact** | Competitive data visible to every employee. |

### P0-5 Notifications — global funnel/support events

| | |
|---|---|
| **File** | `src/app/api/user/notifications/route.ts` |
| **What happens** | Won funnel and support add/close queries have no `staffsId` filter. |
| **Expected** | User-relevant subset or admin-only. |
| **Impact** | Information disclosure. |

---

## P1 — Calculation / date bugs

### P1-1 Score report default range — Date mutation

| | |
|---|---|
| **File** | `src/app/api/admin/reports/score/route.ts` |
| **What happens** | `tod.setMonth(tod.getMonth() + 1)` and `- 13` mutate same `Date` instance for lte/gte. |
| **Expected** | Clone dates before arithmetic. |
| **Impact** | Wrong 13-month window, skewed pivots/incentives. |

### P1-2 Funnel summary — setDate(31) overflow

| | |
|---|---|
| **Files** | `src/app/api/user/funnel/fetch/summary/route.ts`, `src/app/api/admin/funnel/fetch/summary/route.ts`, `src/app/api/group/funnel/fetch/summary/route.ts` |
| **What happens** | `new Date().setDate(31)` rolls into next month in shorter months. |
| **Expected** | End-of-month via library or last day helper. |
| **Impact** | Wrong `dateEnd` filter for hit %. |

### P1-3 Performance team average — employeeCount inverted

| | |
|---|---|
| **File** | `src/app/api/user/performance/route.ts` |
| **What happens** | `prisma.staffs.count({ where: { NOT: { leaveDate: null } } })` counts staff **with** leaveDate set (leavers). Variable computed but team average uses per-month `count` from data instead. |
| **Expected** | `leaveDate: null` for active headcount. |
| **Impact** | Misleading team metrics / dead code confusion. |

### P1-4 Dash — divide by zero

| | |
|---|---|
| **File** | `src/app/api/user/dash/route.ts` |
| **What happens** | `billingAchieved/billingTarget` with no guard. |
| **Expected** | Handle `target === 0`. |
| **Impact** | `Infinity` / NaN billing % breaks incentives. |

### P1-5 User home incentive — strict vs inclusive tiers

| | |
|---|---|
| **File** | `src/app/users/page.tsx` vs `src/app/admin/reports/scores/page.tsx` |
| **What happens** | Home uses `> 250`; admin uses `>= 250`. |
| **Expected** | Single threshold rule. |
| **Impact** | Different incentive at exactly 150/200/250. |

### P1-6 Score pivot vs performance — different semantics

| | |
|---|---|
| **Files** | `src/app/admin/reports/scores/page.tsx`, `src/app/api/user/performance/route.ts` |
| **What happens** | Pivot sums all activity scores per month; performance uses daily MAX then sum. |
| **Expected** | Product should pick one definition. |
| **Impact** | User sees conflicting “monthly score” concepts. |

---

## P1 — Inconsistent scoping

### P1-7 Group activity count — missing member filter

| | |
|---|---|
| **File** | `src/app/api/group/reports/activity/route.ts` |
| **What happens** | `findMany` uses `AND` with members; `count` uses `filterModel` only. |
| **Expected** | Same `where` for count. |
| **Impact** | Grid pagination total wrong. |

### P1-8 Group funnel fetch — checks `scores` not `funnel`

| | |
|---|---|
| **File** | `src/app/api/group/funnel/fetch/route.ts` |
| **What happens** | Permission gate: `if (!groupData.scores)`. |
| **Expected** | `groupData.funnel`. |
| **Impact** | Heads with funnel but not scores denied list access. |

### P1-9 Group conveyance calc — member scope

| | |
|---|---|
| **File** | `src/app/api/group/reports/conveyance/calc/route.ts` |
| **What happens** | Aggregates all Meeting rows matching client `filterModel`; no forced `staffsId IN members`. |
| **Expected** | Restrict to group.members. |
| **Impact** | Inflated totals if filters empty. |

### P1-10 Middleware — `/group` not protected

| | |
|---|---|
| **File** | `src/middleware.ts` |
| **What happens** | Matcher uses `/groups/:path*`; app routes are `/group/*`. |
| **Expected** | Matcher aligns with routes. |
| **Impact** | Group pages rely only on API checks. |

---

## P2 — Data integrity

### P2-1 addActivity — no transaction

| | |
|---|---|
| **File** | `src/app/api/user/addActivity/route.ts` |
| **What happens** | Customer, person, PersonStaff, activity created sequentially. |
| **Expected** | `$transaction`. |
| **Impact** | Orphan customers/persons on failure. |

### P2-2 Merge companies — raw SQL in transaction

| | |
|---|---|
| **File** | `src/app/api/admin/customers/merge/companies/route.ts` |
| **What happens** | Interpolated `IN (${ids})` in `$executeRawUnsafe`; splice logic on JSON body. |
| **Expected** | Parameterized `in` queries. |
| **Impact** | SQL injection risk; partial merge on error. |

### P2-3 Purge activity — unvalidated deleteMany

| | |
|---|---|
| **File** | `src/app/api/admin/purge/activity/route.ts` |
| **What happens** | Deletes any IDs in body; empty catch swallows errors. |
| **Expected** | Audit + confirm scope. |
| **Impact** | Silent failure or mass delete. |

### P2-4 Purge funnel / AMC — similar pattern

| | |
|---|---|
| **Files** | `src/app/api/admin/purge/funnel/route.ts`, `src/app/api/admin/purge/amc/route.ts` |
| **What happens** | Bulk delete by ID list with minimal validation. |
| **Impact** | Accidental data loss. |

### P2-5 Support update — dead filter code

| | |
|---|---|
| **File** | `src/app/api/user/support/update/route.ts` |
| **What happens** | `filtermodel` built never passed to Prisma. |
| **Impact** | False sense of security (related P0-1). |

### P2-6 Session validate — updatedAt null

| | |
|---|---|
| **File** | `src/app/api/auth/validate-session/route.ts` |
| **What happens** | Compares timestamps if `user` exists; `updatedAt` optional on Staffs. |
| **Impact** | NaN comparison if null. |

---

## P3 — Duplication / inefficiency

### P3-1 Admin vs group conveyance calc duplicate

| | |
|---|---|
| **Files** | `src/app/api/admin/reports/conveyance/calc/route.ts`, `src/app/api/group/reports/conveyance/calc/route.ts` |
| **Impact** | ~90% duplicate; drift risk. |

### P3-2 Funnel summary date logic triplicated

| | |
|---|---|
| **Files** | user/admin/group `funnel/fetch/summary/route.ts` |
| **Impact** | Same setDate(31) bug in three places. |

### P3-3 Score report pages duplicate

| | |
|---|---|
| **Files** | `src/app/admin/reports/scores/page.tsx`, `src/app/group/reports/scores/page.tsx` |
| **Impact** | Parallel client incentive logic. |

### P3-4 Notifications full-table scans

| | |
|---|---|
| **File** | `src/app/api/user/notifications/route.ts` |
| **What happens** | Multiple `findMany` without limits on funnel/support. |
| **Impact** | Slow as data grows. |

### P3-5 Customer fetch N+1 patterns

| | |
|---|---|
| **Files** | Various `customers/fetch`, activity maps |
| **Impact** | Heavy includes per row in grids. |

### P3-6 Client filterModel → Prisma where

| | |
|---|---|
| **Files** | Conveyance month/calc routes, some report POST handlers |
| **What happens** | `filterModel` merged into `where` without `prismaFilter` sanitization. |
| **Impact** | Unexpected keys / operator injection surface. |

### P3-7 Middleware console.log token

| | |
|---|---|
| **File** | `src/middleware.ts` |
| **Impact** | Log noise; token fields in logs. |

### P3-8 prismaFilter person branch no-op

| | |
|---|---|
| **File** | `src/libs/consts.ts` |
| **What happens** | `filters['person'] = filters['person']` when person already exists. |
| **Impact** | Person column filters ignored. |

### P3-9 prismaFilter inRange swap

| | |
|---|---|
| **File** | `src/libs/consts.ts` |
| **What happens** | When `filter < filterTo`, sets `gte: filterTo, lte: filter` (reversed). |
| **Impact** | Empty or wrong numeric filters. |

### P3-10 Admin score page uses user dash

| | |
|---|---|
| **File** | `src/app/admin/reports/scores/page.tsx` |
| **What happens** | `axios.get('/api/user/dash')` for billing %. |
| **Impact** | Coupling; wrong if dash becomes per-user. |

### P3-11 Export funnel filename

| | |
|---|---|
| **File** | `src/components/Breadcrumbs/Export.tsx` |
| **What happens** | `FUNNEL_` + dataset flag; parent path `funnel`. |
| **Impact** | Minor; document only. |

### P3-12 Performance highest/lowest — calendar month not FY

| | |
|---|---|
| **File** | `src/app/api/user/performance/route.ts` |
| **Impact** | “FY score” on UI vs leaderboard month mismatch confuses users. |

---

## Cross-cutting — spec vs implementation

| Topic | Spec location | Issue |
|-------|---------------|-------|
| Monthly score definition | 06, 09, 12 | MAX-per-day vs sum-all-activities |
| Funnel terminal statuses | 03, 11 | Not in Settings JSON |
| Support summary column names | 04, 09 | Planning→SUPPORT naming |
| Group permission flags | 01, 10 | scores vs funnel mismatch |

---

## Summary counts

| Priority | Count |
|----------|-------|
| P0 | 5 |
| P1 | 10 |
| P2 | 6 |
| P3 | 12 |
| **Total** | **33** (+ cross-cutting table) |

When rebuilding, treat functional-spec formulas as **observed behavior**; use this document to decide what to fix vs preserve.
