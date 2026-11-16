/**
 * STOCKAGE TEMPORAIRE des rubriques Canal, Avis, Abonnements et Événements de l'Espace Pro.
 * Les modifications faites dans l'interface sont gardées dans le localStorage du navigateur,
 * service par service, pour pouvoir tester les formulaires. Tant qu'un service n'a rien modifié,
 * ses exemples (`pro-extras-seed.ts`) sont affichés sans rien écrire.
 * À remplacer par l'API (TanStack Query) : seuls `hooks/use-pro-extras.ts` et ce fichier le connaissent.
 */
import { buildProExtrasSeed } from '@/lib/pro-extras-seed'
import type { ProExtras } from '@/types/pro'
import type { CatalogItem, Service } from '@/types/service'

const STORAGE_KEY = 'africonnect.pro-extras.v1'

type Listener = () => void

/** Services dont les données ont été modifiées (et sont donc sauvegardées). */
let saved: Record<string, ProExtras> | null = null
/** Exemples déjà fabriqués : conservés pour que `getSnapshot` renvoie toujours la même référence. */
const seeds = new Map<string, ProExtras>()
const listeners = new Set<Listener>()
/** Incrémenté à chaque écriture — snapshot stable pour Accueil / Explorer. */
let revision = 0

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function load(): Record<string, ProExtras> {
  if (saved) return saved
  saved = {}
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    const parsed: unknown = raw ? JSON.parse(raw) : null
    if (isRecord(parsed)) {
      for (const [id, value] of Object.entries(parsed)) {
        if (isRecord(value) && Array.isArray(value['posts'])) {
          saved[id] = value as unknown as ProExtras
        }
      }
    }
  } catch {
    // Données illisibles : on repart des exemples.
  }
  return saved
}

function persist() {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(load()))
  } catch {
    // Quota dépassé (images volumineuses) : l'état reste en mémoire.
  }
}

/**
 * Enregistre un jeu d’exemples déjà curaté (ex. DEMO_PROS avec `customize`).
 * Évite que `getProExtras` régénère un seed générique (mauvais ids de forfaits).
 */
export function registerProExtrasSeed(serviceId: string, extras: ProExtras): void {
  if (!seeds.has(serviceId) && !load()[serviceId]) {
    seeds.set(serviceId, extras)
  }
}

/** État courant d'un service : ses modifications, sinon ses exemples. */
export function getProExtras(service: Service, items: readonly CatalogItem[]): ProExtras {
  const existing = load()[service.id]
  if (existing) return existing
  let seed = seeds.get(service.id)
  if (!seed) {
    seed = buildProExtrasSeed(service, items)
    seeds.set(service.id, seed)
  }
  return seed
}

/** Applique une modification à un service et prévient les écrans. */
export function updateProExtras(
  service: Service,
  items: readonly CatalogItem[],
  mutate: (current: ProExtras) => ProExtras,
): void {
  const store = load()
  store[service.id] = mutate(getProExtras(service, items))
  revision += 1
  persist()
  listeners.forEach((listener) => listener())
}

export function subscribeProExtras(listener: Listener): () => void {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

/** Snapshot pour `useSyncExternalStore` (Accueil, Explorer, rails d’adhésion). */
export function getProExtrasRevision(): number {
  return revision
}
