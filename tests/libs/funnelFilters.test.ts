import { describe, expect, it } from 'vitest';
import { prepareFunnelFilterModel } from '@/libs/funnelFilters';

describe('prepareFunnelFilterModel', () => {
  it('removes status filter when user types all', () => {
    expect(
      prepareFunnelFilterModel({
        status: { contains: 'all' },
      })
    ).toEqual({});
  });

  it('is case-insensitive for all', () => {
    expect(
      prepareFunnelFilterModel({
        status: { contains: ' ALL ' },
      })
    ).toEqual({});
  });

  it('keeps other filters when all clears status', () => {
    expect(
      prepareFunnelFilterModel({
        status: { contains: 'all' },
        type: { contains: 'Supply' },
      })
    ).toEqual({
      type: { contains: 'Supply' },
    });
  });

  it('defaults to open statuses when no filters are set', () => {
    expect(prepareFunnelFilterModel({})).toEqual({
      status: { in: ['Hot', 'Mild', 'Cold'] },
    });
  });

  it('defaults to open statuses when filtering by employee only', () => {
    expect(
      prepareFunnelFilterModel({
        employee: { name: { contains: 'Vijay' } },
      })
    ).toEqual({
      employee: { name: { contains: 'Vijay' } },
      status: { in: ['Hot', 'Mild', 'Cold'] },
    });
  });

  it('maps a single status value to an in filter', () => {
    expect(
      prepareFunnelFilterModel({
        status: { contains: 'won' },
      })
    ).toEqual({
      status: { in: ['Won'] },
    });
  });
});
