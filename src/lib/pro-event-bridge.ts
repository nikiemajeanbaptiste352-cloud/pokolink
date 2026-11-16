/**
 * Pont Espace Pro (privé) ↔ Market Event (public).
 *
 * Règle produit :
 * - L’Espace Pro **crée / publie** les événements.
 * - La page publique **affiche** les événements publiés et permet aux clients / visiteurs
 *   d’**agir** (participer, rappel, achat démo).
 *
 * Frontend only : résolution locale (TEMP_EVENTS + ProExtras + démos).
 */
import { DEMO_PROS } from '@/lib/directory'
import { getTempEvent } from '@/lib/placeholder-events'
import { getPublicEvents } from '@/lib/pro-public'
import { getProExtras } from '@/lib/pro-extras-store'
import { loadServicesState } from '@/lib/services-storage'
import type { MarketEvent } from '@/types/event'
import type { ProEvent } from '@/types/pro'
import type { CatalogItem, Service } from '@/types/service'

/** Convertit un événement Pro publié en événement Market Event consultable / participable. */
export function proEventToMarketEvent(event: ProEvent, service: Service): MarketEvent {
  return {
    id: event.id,
    kind: event.kind,
    title: event.title,
    description:
      event.description.trim() ||
      `Événement organisé par ${service.name}. Participez depuis la page publique.`,
    host: {
      name: service.name,
      type: 'merchant',
      proRef: service.username || service.id,
      avatarSrc: service.logo || undefined,
      verified: true,
    },
    startsAt: event.startsAt,
    endsAt: event.endsAt,
    ...(event.extra.trim() ? { reward: event.extra.trim() } : {}),
    participants: event.participants ?? 0,
    ...(event.cover ? { imageSrc: event.cover } : {}),
    ...(event.partnershipLink ? { partnershipLink: event.partnershipLink } : {}),
  }
}

function findInService(
  service: Service,
  items: readonly CatalogItem[],
  eventId: string,
): MarketEvent | undefined {
  const serviceItems = items.filter((item) => item.serviceId === service.id)
  const extras = getProExtras(service, serviceItems)
  const published = getPublicEvents(extras).find((event) => event.id === eventId)
  if (!published) return undefined
  return proEventToMarketEvent(published, service)
}

/**
 * Résout un événement Market Event : catalogue démo d’abord, puis événements
 * publiés des Espaces Pro (utilisateur + annuaire).
 */
export function resolveMarketEvent(eventId: string | undefined): MarketEvent | undefined {
  if (!eventId) return undefined
  const fromTemp = getTempEvent(eventId)
  if (fromTemp) return fromTemp

  for (const demo of DEMO_PROS) {
    const published = getPublicEvents(demo.extras).find((event) => event.id === eventId)
    if (published) return proEventToMarketEvent(published, demo.service)
  }

  const { services, items } = loadServicesState()
  for (const service of services) {
    if (service.status !== 'active') continue
    const found = findInService(service, items, eventId)
    if (found) return found
  }

  return undefined
}

/** Tous les événements publiés des Espaces Pro (annuaire + services locaux). */
export function listPublishedProMarketEvents(): MarketEvent[] {
  const seen = new Set<string>()
  const list: MarketEvent[] = []

  function push(event: MarketEvent) {
    if (seen.has(event.id)) return
    seen.add(event.id)
    list.push(event)
  }

  for (const demo of DEMO_PROS) {
    for (const event of getPublicEvents(demo.extras)) {
      push(proEventToMarketEvent(event, demo.service))
    }
  }

  const { services, items } = loadServicesState()
  for (const service of services) {
    if (service.status !== 'active') continue
    const serviceItems = items.filter((item) => item.serviceId === service.id)
    const extras = getProExtras(service, serviceItems)
    for (const event of getPublicEvents(extras)) {
      push(proEventToMarketEvent(event, service))
    }
  }

  return list
}
