# 08 — Salary and Payroll

## Purpose

Admin generates monthly salary slips per staff; staff view and download PDF payslips with earnings/deductions breakdown.

## Actors

| Actor | Actions |
|-------|---------|
| **Admin** | Create/update slips (`/admin/salary/add`, report grid) |
| **Staff** | View own slips (`/users/salary`), export PDF |

## Inputs

### SalarySlip model

| Field | Description |
|-------|-------------|
| `month` | Date (month of slip) |
| `staffsId` | Employee |
| `salary` | Monthly gross reference |
| `paidDays` | Days paid |
| `leavesTaken`, `leavesAvailable`, `carryLeaves` | Leave accounting |
| `compoffTaken`, `compoffBalance`, `compoffAdded` | Comp-off |
| `tds`, `ec`, `loan`, `others` | Deductions |
| `post`, `department` | Snapshot on slip |
| `netSalary` | Stored payable (admin form); **may differ from client recalc** |

### Admin create (`POST /api/admin/addSalary`)

Body passed directly to `prisma.salarySlip.create(data)` — no server-side formula validation.

### Admin update (`POST /api/admin/addSalary/update`)

Updates existing slip fields including `netSalary`.

## Business rules

1. Only **admin** may create/update salary records via API.
2. Staff salary report: infinite scroll with `prismaFilter` / `prismaSort`; scoped to `staffsId = session.user.id` in API.
3. **PDF export:** Client renders `SalarySlip` component → `html2canvas` → `jsPDF`; uses computed `nsp` on grid, displays stored `netSalary` on slip template.
4. Payslip shows `paidDays`, leave/comp-off fields, PAN from `employee.panNo`.

## Calculations

All computed **client-side** on staff and admin report grids (`users/salary/page.tsx`, `admin/salary/report/page.tsx`):

```text
base = (salary / 30) × (2/3) × paidDays
hra  = (salary / 30) × (1/3) × paidDays
gross = base + hra
deductions = ec + tds + loan + others
nsp = round(gross - deductions)
```

Display:

- `base`, `hra`, `gross`, `deduction`, `nsp` added as grid columns (some hidden for PDF).
- **Stored `netSalary`** on PDF footer may have been entered manually at create time and not equal `nsp`.

## Outputs

- AG Grid salary history per staff
- PDF download per selected row
- Admin report: all staff slips with same derived columns + `netSalary` column

## API endpoints

| Endpoint | Method | Actor |
|----------|--------|-------|
| `/api/admin/addSalary` | POST | Admin create |
| `/api/admin/addSalary/update` | POST | Admin update |
| `/api/admin/reports/salary` | POST | Admin grid |
| `/api/user/salary` | POST | Own slips |

## Edge cases

| Case | Detail |
|------|--------|
| netSalary vs nsp mismatch | Admin can store arbitrary `netSalary` |
| No server validation | Negative paidDays or null salary possible |
| PDF uses rounded nsp | Slip template shows `data.netSalary` field |

See [LOGIC_REVIEW.md](../LOGIC_REVIEW.md) if payroll integrity items added.
