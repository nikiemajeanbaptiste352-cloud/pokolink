/**
 * Participations enregistrées sur cet appareil (démonstration) :
 * Market Event, Cotes (factor) et Coins. Le serveur confirmera places et paiements.
 */
import { createLocalStore } from '@/lib/local-store'

export type EventParticipationSource = 'market-event' | 'factor' | 'coins'

export interface EventParticipationRecord {
  eventId: string
  /** Horodatage de la demande. */
  at: number
  kind: 'rsvp' | 'remind'
  /** Origine : Market Event, cotes OUI/NON, ou coins. */
  source: EventParticipationSource
}

function isSource(value: unknown): value is EventParticipationSource {
  return value === 'market-event' || value === 'factor' || value === 'coins'
}

function isRecord(value: unknown): value is EventParticipationRecord {
  if (typeof value !== 'object' || value === null) return false
  const v = value as Record<string, unknown>
  return (
    typeof v.eventId === 'string' &&
    typeof v.at === 'number' &&
    (v.kind === 'rsvp' || v.kind === 'remind') &&
    (v.source === undefined || isSource(v.source))
  )
}

function normalize(raw: EventParticipationRecord): EventParticipationRecord {
  return {
    eventId: raw.eventId,
    at: raw.at,
    kind: raw.kind,
    source: raw.source ?? 'market-event',
  }
}

const store = createLocalStore<readonly EventParticipationRecord[]>(
  'africonnect.event-participations.v2',
  (raw) => (Array.isArray(raw) ? raw.filter(isRecord).map(normalize) : []),
)

export function getEventParticipations(): readonly EventParticipationRecord[] {
  return store.get()
}

export function getEventParticipationsBySource(
  source: EventParticipationSource,
): readonly EventParticipationRecord[] {
  return store.get().filter((item) => item.source === source)
}

export function hasEventParticipation(eventId: string): boolean {
  return store.get().some((item) => item.eventId === eventId)
}

export function addEventParticipation(
  eventId: string,
  kind: EventParticipationRecord['kind'],
  now: number,
  source: EventParticipationSource = 'market-event',
): void {
  if (!eventId) return
  const rest = store.get().filter((item) => !(item.eventId === eventId && item.source === source))
  store.set([{ eventId, kind, at: now, source }, ...rest])
}

export const subscribeEventParticipations = store.subscribe

