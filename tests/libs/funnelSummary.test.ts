import { describe, expect, it } from 'vitest';
import {
  financialYearBounds,
  funnelSummaryLast12MonthsRange,
  toLocalDateString,
} from '@/libs/funnelSummary';

describe('funnelSummary', () => {
  it('formats local calendar dates without UTC shift', () => {
    const date = new Date(2025, 3, 1); // Apr 1 2025 local
    expect(toLocalDateString(date)).toBe('2025-04-01');
  });

  it('returns Apr–Mar financial year bounds', () => {
    const bounds = financialYearBounds();
    expect(bounds.fyStart.endsWith('-04-01')).toBe(true);
    expect(bounds.fyEnd.endsWith('-03-31')).toBe(true);
  });

  it('last 12 months spans 12 calendar months', () => {
    const ref = new Date(2026, 4, 15); // May 2026
    const { dateStart, dateEnd } = funnelSummaryLast12MonthsRange(ref);
    expect(dateStart).toBe('2025-06-01');
    expect(dateEnd).toBe('2026-05-31');
  });
});
