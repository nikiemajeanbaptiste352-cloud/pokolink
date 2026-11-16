import { resolveMarketEvent } from '@/lib/pro-event-bridge'
import { paths } from '@/routes/paths'

/**
 * Destination publique Market Event : fil TikTok + panneau détail via `?evenement=`.
 * `undefined` seulement si l'id est inconnu.
 */
export function getEventPath(eventId: string): string | undefined {
  const event = resolveMarketEvent(eventId)
  if (!event) return undefined
  return `${paths.events}?evenement=${encodeURIComponent(eventId)}`
}

/**
 * Lien depuis la page publique d’un établissement : onglet événements + panneau.
 */
export function getEstablishmentEventPath(
  eventId: string,
  establishmentRef: string,
): string {
  return `${paths.establishment(establishmentRef)}?onglet=evenements&evenement=${encodeURIComponent(eventId)}`
}
