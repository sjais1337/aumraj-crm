export const PLACEHOLDER_PFP = 'placeholder';

export const PFP_SIZE = 256;

/** Absolute URL for a staff profile photo (or placeholder). */
export function profilePhotoUrl(
  userId?: string | null,
  cacheKey?: string | number
): string {
  const id = userId ?? PLACEHOLDER_PFP;
  const base = `/images/pfp/${id}.png`;
  return cacheKey != null ? `${base}?v=${cacheKey}` : base;
}
