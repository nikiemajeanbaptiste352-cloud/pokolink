/**
 * STOCKAGE TEMPORAIRE : pendant la phase frontend, les services créés sont conservés
 * dans le localStorage du navigateur pour pouvoir tester le parcours complet.
 * À remplacer par l'API (TanStack Query) : aucun composant ne dépend de ce fichier,
 * seul `ServicesProvider` l'utilise.
 */
import { normalizeService } from '@/lib/service-defaults'
import type { CatalogItem, Service } from '@/types/service'

const STORAGE_KEY = 'africonnect.services.v1'

export interface ServicesState {
  services: Service[]
  items: CatalogItem[]
}

export const EMPTY_SERVICES_STATE: ServicesState = { services: [], items: [] }

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

/**
 * Lit l'état sauvegardé ; toute donnée absente ou corrompue donne un état vide.
 * Les services enregistrés par une version précédente sont complétés (`normalizeService`).
 */
export function loadServicesState(): ServicesState {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return EMPTY_SERVICES_STATE
    const parsed: unknown = JSON.parse(raw)
    if (!isRecord(parsed)) return EMPTY_SERVICES_STATE
    const { services, items } = parsed
    if (!Array.isArray(services) || !Array.isArray(items)) return EMPTY_SERVICES_STATE
    return {
      services: services
        .filter(
          (s): s is Record<string, unknown> => isRecord(s) && typeof s['id'] === 'string',
        )
        .map(normalizeService),
      items: items
        .filter(
          (i): i is CatalogItem =>
            isRecord(i) &&
            typeof i['id'] === 'string' &&
            typeof i['serviceId'] === 'string',
        )
        .map((i) => ({
          ...i,
          allowMerchantCredit: i.allowMerchantCredit === true,
        })),
    }
  } catch {
    return EMPTY_SERVICES_STATE
  }
}

/** Sauvegarde l'état. Échec silencieux si le stockage est plein ou indisponible. */
export function saveServicesState(state: ServicesState): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {
    // Quota dépassé (images volumineuses) ou navigation privée : l'état reste en mémoire.
  }
}

/** @deprecated Préférer `@/lib/ids` — conservé pour compatibilité. */
export { createId } from '@/lib/ids'
