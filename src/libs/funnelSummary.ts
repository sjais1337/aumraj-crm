import { financialYear } from '@/libs/consts';

/** Local calendar date `YYYY-MM-DD` (avoids UTC shift from toISOString). */
export function toLocalDateString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/** Current Indian FY (Apr 1 – Mar 31) bounds for funnel summary SQL. Uses add `date`, not closureDate. */
export function financialYearBounds(): { fyStart: string; fyEnd: string } {
  const { start, end } = financialYear();
  return {
    fyStart: toLocalDateString(start),
    fyEnd: toLocalDateString(end),
  };
}

export function serializeQueryRows<T = Record<string, unknown>>(
  rows: unknown
): T[] {
  if (!Array.isArray(rows)) {
    return [];
  }

  return JSON.parse(
    JSON.stringify(rows, (_key, value) =>
      typeof value === 'bigint' ? Number(value) : value
    )
  );
}

/** End of calendar month as local `YYYY-MM-DD`. */
export function endOfMonthLocal(date: Date = new Date()): string {
  const d = new Date(date.getFullYear(), date.getMonth() + 1, 0);
  return toLocalDateString(d);
}

/** Rolling last 12 calendar months (current month + prior 11). Add date, not closureDate. */
export function funnelSummaryLast12MonthsRange(date: Date = new Date()): {
  dateStart: string;
  dateEnd: string;
} {
  const start = new Date(date.getFullYear(), date.getMonth() - 11, 1);
  return {
    dateStart: toLocalDateString(start),
    dateEnd: endOfMonthLocal(date),
  };
}
