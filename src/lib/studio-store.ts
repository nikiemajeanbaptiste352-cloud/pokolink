/**
 * STOCKAGE TEMPORAIRE du Creator Studio : les événements créés ou modifiés dans l'interface sont
 * gardés dans le localStorage de cet appareil pour pouvoir essayer le parcours complet. Tant
 * qu'on n'a rien changé, les exemples (`placeholder-studio.ts`) sont affichés.
 *
 * À remplacer par l'API : seuls ce fichier et `hooks/use-studio.ts` le connaissent. Ce que fait
 * le créateur ici (enregistrer un brouillon, envoyer pour validation, retirer la demande,
 * supprimer un brouillon) reste de simples demandes : la validation, la publication, le calcul
 * du facteur ou de l'indice, le pool et tout montant sont décidés par le SERVEUR. Aucun
 * événement n'est jamais « validé » ni « publié » par ce fichier.
 */
import { TEMP_STUDIO_EVENTS } from '@/lib/placeholder-studio'
import { createId } from '@/lib/ids'
import { canDelete, canSubmit, canWithdraw } from '@/lib/studio'
import type { StudioEvent } from '@/types/studio'

const STORAGE_KEY = 'africonnect.studio.v1'

type Listener = () => void

interface StudioState {
  /** Événements créés ou modifiés (remplacent l'exemple de même identifiant). */
  events: Record<string, StudioEvent>
  /** Brouillons supprimés. */
  removed: string[]
}

let state: StudioState | null = null
let list: readonly StudioEvent[] | null = null
const listeners = new Set<Listener>()

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function load(): StudioState {
  if (state) return state
  state = { events: {}, removed: [] }
  try {
    const parsed: unknown = JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? 'null')
    if (isRecord(parsed)) {
      const events = parsed['events']
      if (isRecord(events)) {
        for (const [id, value] of Object.entries(events)) {
          if (isRecord(value) && typeof value['caption'] === 'string') {
            state.events[id] = value as unknown as StudioEvent
          }
        }
      }
      const removed = parsed['removed']
      if (Array.isArray(removed)) {
        state.removed = removed.filter((id): id is string => typeof id === 'string')
      }
    }
  } catch {
    // Données illisibles : on repart des exemples.
  }
  return state
}

function commit(next: StudioState) {
  state = next
  list = null
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  } catch {
    // Quota dépassé (image de couverture volumineuse) : l'état reste en mémoire.
  }
  listeners.forEach((listener) => listener())
}

/** Tous les événements du créateur, du plus récent au plus ancien. */
export function getStudioEvents(): readonly StudioEvent[] {
  if (list) return list
  const current = load()
  const byId = new Map<string, StudioEvent>()
  for (const event of TEMP_STUDIO_EVENTS) {
    if (!current.removed.includes(event.id)) byId.set(event.id, event)
  }
  for (const [id, event] of Object.entries(current.events)) {
    if (!current.removed.includes(id)) byId.set(id, event)
  }
  list = [...byId.values()].sort((a, b) => b.updatedAt - a.updatedAt)
  return list
}

export function subscribeStudio(listener: Listener): () => void {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

function find(id: string): StudioEvent | undefined {
  return getStudioEvents().find((event) => event.id === id)
}

function put(event: StudioEvent) {
  const current = load()
  commit({ ...current, events: { ...current.events, [event.id]: event } })
}

/** Données du formulaire : tout sauf ce que seul le serveur décide. */
export type StudioDraftInput = Pick<
  StudioEvent,
  | 'kind'
  | 'caption'
  | 'hashtags'
  | 'videoName'
  | 'videoSize'
  | 'cover'
  | 'startsAt'
  | 'durationHours'
  | 'maxCoins'
  | 'coinPrice'
  | 'partnershipLink'
>

/** Enregistre un brouillon (nouveau ou existant, si l'événement est encore modifiable). */
export function saveStudioDraft(
  id: string | undefined,
  input: StudioDraftInput,
  now: number,
): StudioEvent | null {
  const existing = id ? find(id) : undefined
  if (existing && !canSubmit(existing)) return null
  const next: StudioEvent = {
    ...(existing ?? { id: createId(), createdAt: now }),
    ...input,
    // Un événement refusé qui est modifié redevient un brouillon.
    status: 'draft',
    updatedAt: now,
  }
  // Un coin n'a pas de nombre ni de prix sur une cote.
  if (input.kind === 'factor') {
    delete next.maxCoins
    delete next.coinPrice
  }
  if (!input.partnershipLink) delete next.partnershipLink
  delete next.reason
  delete next.reviewedAt
  put(next)
  return next
}

/**
 * Envoie l'événement pour validation.
 * Démo frontend : publication immédiate (`scheduled` / `live`) pour qu’il apparaisse
 * sur le profil public Creator. En production le serveur restera en `in_review`.
 */
export function submitStudioEvent(id: string, now: number): StudioEvent | null {
  const existing = find(id)
  if (!existing || !canSubmit(existing)) return null
  const published = existing.startsAt <= now ? 'live' : 'scheduled'
  const next: StudioEvent = {
    ...existing,
    status: published,
    submittedAt: now,
    reviewedAt: now,
    updatedAt: now,
    stats: existing.stats ?? {
      views: 0,
      participants: 0,
      likes: 0,
      comments: 0,
      shares: 0,
      viewsSeries: [0],
    },
  }
  delete next.reason
  put(next)
  return next
}

/** Retire la demande en attente : l'événement redevient un brouillon modifiable. */
export function withdrawStudioEvent(id: string, now: number): StudioEvent | null {
  const existing = find(id)
  if (!existing || !canWithdraw(existing)) return null
  const next: StudioEvent = { ...existing, status: 'draft', updatedAt: now }
  delete next.submittedAt
  put(next)
  return next
}

/** Supprime un brouillon. Les autres statuts ne peuvent pas être supprimés par le créateur. */
export function deleteStudioDraft(id: string): boolean {
  const existing = find(id)
  if (!existing || !canDelete(existing)) return false
  const current = load()
  const events = { ...current.events }
  delete events[id]
  commit({ events, removed: [...current.removed, id] })
  return true
}
