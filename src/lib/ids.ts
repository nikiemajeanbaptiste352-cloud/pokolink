/**
 * Identifiant unique côté client (provisoire).
 * L’API fournira les vrais identifiants ; ne pas lier au domaine Services.
 */
export function createId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`
}
