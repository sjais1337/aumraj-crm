/** Normalise AG-Grid / prisma funnel filters for fetch, charts, and export. */
export function prepareFunnelFilterModel(
  filterModel: Record<string, unknown> = {}
): Record<string, unknown> {
  const filter = { ...filterModel };
  let explicitAllStatuses = false;

  if (
    filter.status &&
    typeof filter.status === 'object' &&
    filter.status !== null &&
    'contains' in filter.status
  ) {
    const contains = (filter.status as { contains: string }).contains.trim();

    if (contains.toLowerCase() === 'all') {
      delete filter.status;
      explicitAllStatuses = true;
    } else {
      const splitted = contains.split(',');
      if (splitted.length > 1) {
        delete filter.status;
        filter.OR = splitted.map((i) => ({ status: { contains: i.trim() } }));
      }
    }
  }

  if (
    filter.status &&
    typeof filter.status === 'object' &&
    filter.status !== null &&
    'contains' in filter.status
  ) {
    filter.status = {
      in: (filter.status as { contains: string }).contains
        .split(',')
        .map((i) =>
          i
            .trim()
            .replace(
              /\w\S*/g,
              (text) =>
                text.charAt(0).toUpperCase() + text.substring(1).toLowerCase()
            )
        ),
    };
  }

  if (!explicitAllStatuses && Object.keys(filter).length === 0) {
    filter.status = { in: ['Hot', 'Mild', 'Cold'] };
  }

  return filter;
}
