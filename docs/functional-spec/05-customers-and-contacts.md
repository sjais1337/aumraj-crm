# 05 — Customers and Contacts

## Purpose

Maintain company (`Customer`) and contact (`Person`) master data, AMC metadata on companies, staff-scoped contact search, and admin merge tools for deduplication.

## Actors

| Actor | Actions |
|-------|---------|
| **Staff** | Search companies/persons; create via activity/funnel flows |
| **Admin** | Full customer grid, update, export, merge companies/contacts |

## Inputs

### Customer (`Customer` model)

| Field | Purpose |
|-------|---------|
| `companyName` | Required identifier |
| `numberOfBranch`, `totalITUsers` | Scale |
| `location`, `state` | Geography |
| **Firewall** | `firewallModelNo`, `firewallAMCDueDate` |
| **Anti-virus** | `antiVirusOem`, `renewalDueDate` |
| **L3/L2** | Model + `L3AMCDueDate`, `L2AMCDueDate` |
| **WiFi** | `wifiModel`, `wifiAMCDueDate` |
| **Video** | `VCOEM`, `VCAMCDueDate` |
| **EPBX** | `epbxModel`, `epbxAMCDute` (schema typo) |

### Person (`Person` model)

| Field | Purpose |
|-------|---------|
| `personName`, `emailId`, `phoneNo` | Contact details |
| `companyId` | Optional FK to Customer |
| `entryCount` | Increment on create (activity flow sets 1) |

### PersonStaff

Composite key `(personId, staffId)` — staff only sees persons linked here in search.

### Admin merge

**Companies:** POST body array; first element is survivor `{ personId, companyId }`; others merged into survivor company, duplicate customers deleted.

**Contacts:** Similar pattern for person deduplication (separate route).

## Business rules

1. **Person search** (`GET /api/user/search/person`): Requires `query` and `company`; filters `personName contains query` AND `PersonStaff.staffId = session.user.id`.
2. **Company search** (`GET /api/user/search/company`): Staff-scoped company lookup (separate route).
3. **New company on activity:** Minimal `Customer` create (name only).
4. **Merge companies:** `updateMany` persons; raw SQL updates `activity`, `funnel`, `support`, `sla`, `person`; `deleteMany` duplicate customers inside `$transaction` — **partial raw SQL outside typed Prisma safeguards**.
5. **Export customers:** Flatten person + nested company AMC fields to XLSX via `Export` component (`CUSTOMERS.xlsx` pattern).
6. **Admin customer fetch:** Infinite scroll with `prismaFilter` / `prismaSort`.

## Calculations

None.

## Outputs

- Search autocomplete results (person: name, email, phone, personId)
- Admin customer grid + export spreadsheet
- Merge API returns surviving `personId`

## API endpoints

| Endpoint | Method | Actor |
|----------|--------|-------|
| `/api/user/search/person` | GET | Staff |
| `/api/user/search/company` | GET | Staff |
| `/api/admin/customers/fetch` | POST | Admin |
| `/api/admin/customers/update` | POST | Admin |
| `/api/admin/customers/count` | GET | Admin |
| `/api/admin/customers/export` | POST | Admin |
| `/api/admin/customers/merge/companies` | POST | Admin |
| `/api/admin/customers/merge/contacts` | POST | Admin |

## Edge cases

| Case | Detail |
|------|--------|
| Person without PersonStaff | Invisible in search but may exist on activities |
| Merge SQL injection style | `otherCompanyIds` interpolated into raw SQL |
| Merge transaction | Raw updates + delete; failure modes inconsistent |
| `prismaFilter` person fields | Reassign bug — person text filters may no-op — doc 12 |

See [LOGIC_REVIEW.md](../LOGIC_REVIEW.md).
