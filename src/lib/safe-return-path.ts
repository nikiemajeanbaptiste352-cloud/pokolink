/**
 * Chemin de retour interne sûr (`?retour=/…`).
 * Refuse les URLs absolues / protocol-relative (open redirect).
 */
export function safeReturnPath(value: string | null | undefined): string | null {
  if (!value || !value.startsWith('/') || value.startsWith('//')) return null
  return value
}
