/** Splits a comma-separated notes string and capitalizes each term. */
export function capitalizeNotes(str?: string): string {
  if (!str) return '';
  return str
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .join(', ');
}
