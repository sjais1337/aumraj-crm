# 12 — Shared Calculations and Dates

## Purpose

Document cross-cutting utilities in `src/libs/consts.ts` and the AG Grid → Prisma filter/sort pattern used across reports.

## Actors

All authenticated routes and client grids using `prismaFilter`, `prismaSort`, `formatDate`, `formatCurrency`, `financialYear`.

## Inputs

### `financialYear()`

No inputs; uses current date.

### `formatDate(date)`

Any Date-parseable value.

### `formatCurrency(num)`

Numeric amount in INR display.

### `prismaFilter(filterModel)`

AG Grid `FilterModel` object from client.

### `prismaSort(sortModel)`

AG Grid sort model array (first column only).

## Business rules

### Financial year (India)

```javascript
if (month >= 3) {          // April (3) through December
  startYear = year
  endYear = year + 1
} else {                    // January–March
  startYear = year - 1
  endYear = year
}
start = new Date(startYear, 3, 1)   // Apr 1
end   = new Date(endYear, 2, 31)    // Mar 31
```

### formatDate

Output: `DD-MM-YYYY` (zero-padded day/month).

Returns **empty string** if result is `NaN-NaN-NaN` or `01-01-1970`.

### formatCurrency

| Range | Display |
|-------|---------|
| ≥ 1e7 | ₹X.XX Cr |
| ≥ 1e5 | ₹X.XX L |
| ≥ 1e3 | ₹X.XX K |
| else | ₹num |

### prismaSort

- `companyName` → sort nested `Customer.companyName`
- `personName`, `emailId`, `phoneNo` → nested `person.*`
- Else → top-level `colId`

Only first sort column applied.

### prismaFilter

| Filter | Prisma shape |
|--------|----------------|
| `staffsId` text | `employee.name contains` |
| `companyName` | `Customer.companyName contains` |
| `personName` / `emailId` / `phoneNo` | Should set `person[field] contains` — **bug:** existing `person` branch assigns `filters['person'] = filters['person']` (no-op) |
| `date` | `gte` start-of-day `dateFrom`, `lte` end-of-day `dateTo` |
| `text` | `{ contains: filter }` |
| `number` lte/gte | Per AG Grid type |
| `number` inRange | If `filter > filterTo`, swaps gte/lte **incorrectly** when filter < filterTo uses reversed assignment |

Returns flat `where` clause object (not wrapped in `AND`).

### defaultColDef (grids)

```javascript
filter: 'agTextColumnFilter',
floatingFilter: true,
flex: 1,
minWidth: 110
```

### AG Grid infinite scroll pattern

```javascript
POST { startRow, endRow, filterModel: prismaFilter(...), sortModel: prismaSort(...) }
→ findMany({ skip: startRow, take: endRow - startRow, where, orderBy })
→ count({ where })
→ { data: { data, count } }
```

## Calculations

See README formula table; this file owns **date/FY/filter** primitives only.

### Month key (score pivot — client)

```text
key = lowercase(monthAbbr) + twoDigitYear   // e.g. jan24
```

### camelCaseToReadable

Inserts spaces before capitals for display labels.

## Outputs

- Formatted dates in grids and PDFs
- Currency strings on dashboard cards
- Prisma where/order objects

## API endpoints

Not an API — imported by ~30+ route handlers and pages.

## Edge cases

| Function | Issue |
|----------|-------|
| `prismaFilter` person | Multi-field person filters broken |
| `prismaFilter` inRange | gte/lte swapped when filter < filterTo |
| `financialYear` end | March 31 via `new Date(y, 2, 31)` — OK |
| Client passes raw filterModel | Some conveyance routes skip `prismaFilter` |
| Date mutation | Many routes mutate `Date` with `setMonth` in place |

See [LOGIC_REVIEW.md](../LOGIC_REVIEW.md).
