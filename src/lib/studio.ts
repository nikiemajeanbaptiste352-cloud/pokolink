import { ChartCandlestick, Coins, type LucideIcon } from 'lucide-react'

import { formatDateTime } from '@/lib/pro-labels'
import type {
  StudioEvent,
  StudioEventKind,
  StudioEventStats,
  StudioEventStatus,
} from '@/types/studio'

const HOUR = 60 * 60 * 1000

/**
 * LIMITES PROVISOIRES du formulaire : valeurs de test pour vérifier les messages d'erreur.
 * Le prix initial, le plafond d'achat et la durée sont encore des décisions ouvertes (voir
 * docs/creator-market-coins.md) : le serveur fixera et fera respecter les vraies limites.
 */
export const STUDIO_LIMITS = {
  captionMax: 150,
  hashtagsMax: 5,
  hashtagLength: 30,
  videoMaxMb: 200,
  coinsMin: 100,
  coinsMax: 100_000,
  priceMin: 100,
  priceMax: 10_000,
  /** Délai minimal entre l'envoi et le début, pour laisser le temps à la validation. */
  leadHours: 2,
} as const

export const STUDIO_DURATIONS: readonly { hours: number; label: string }[] = [
  { hours: 6, label: '6 heures' },
  { hours: 12, label: '12 heures' },
  { hours: 24, label: '24 heures' },
  { hours: 48, label: '2 jours' },
  { hours: 72, label: '3 jours' },
  { hours: 168, label: '7 jours' },
]

export function formatDuration(hours: number): string {
  return STUDIO_DURATIONS.find((d) => d.hours === hours)?.label ?? `${hours} heures`
}

interface KindMeta {
  label: string
  short: string
  description: string
  icon: LucideIcon
}

export const STUDIO_KINDS: Record<StudioEventKind, KindMeta> = {
  factor: {
    label: 'Cote OUI / NON',
    short: 'Cote',
    description:
      'Les participants prennent position sur le rythme des vues validées de votre vidéo. Le facteur est calculé par AfriConnect.',
    icon: ChartCandlestick,
  },
  coins: {
    label: 'Coins',
    short: 'Coins',
    description:
      'Les participants achètent un nombre limité de coins avant le début. La valeur suit un indice de popularité calculé par AfriConnect.',
    icon: Coins,
  },
}

interface StatusMeta {
  label: string
  /** Phrase qui dit au créateur où en est l'événement et ce qu'il peut faire. */
  message: string
}

export const STUDIO_STATUS: Record<StudioEventStatus, StatusMeta> = {
  draft: {
    label: 'Brouillon',
    message:
      'Cet événement n’est visible que par vous. Complétez-le puis envoyez-le pour validation.',
  },
  in_review: {
    label: 'En revue',
    message:
      'AfriConnect vérifie votre événement. Vous serez prévenu de la décision ; vous pouvez retirer la demande pour le modifier.',
  },
  rejected: {
    label: 'Refusé',
    message:
      'Votre événement n’a pas été validé. Corrigez ce qui est indiqué puis envoyez-le de nouveau.',
  },
  scheduled: {
    label: 'Programmé',
    message:
      'Votre événement est validé et programmé. Il n’est plus modifiable : contactez le support pour tout changement.',
  },
  live: {
    label: 'En cours',
    message:
      'Votre événement est en cours. Les chiffres ci-dessous sont mis à jour par AfriConnect.',
  },
  ended: {
    label: 'Terminé',
    message: 'Votre événement est terminé. Retrouvez ci-dessous ses résultats.',
  },
  suspended: {
    label: 'Suspendu',
    message:
      'AfriConnect a suspendu cet événement. Les données sont conservées ; le support vous contactera.',
  },
}

/** Statuts pour lesquels le créateur peut encore modifier l'événement. */
export function isEditable(event: StudioEvent): boolean {
  return event.status === 'draft' || event.status === 'rejected'
}

export function canSubmit(event: StudioEvent): boolean {
  return isEditable(event)
}

export function canWithdraw(event: StudioEvent): boolean {
  return event.status === 'in_review'
}

export function canDelete(event: StudioEvent): boolean {
  return event.status === 'draft'
}

export function getEndsAt(
  event: Pick<StudioEvent, 'startsAt' | 'durationHours'>,
): number {
  return event.startsAt + event.durationHours * HOUR
}

/**
 * Titre de l'événement tel que les PARTICIPANTS le voient : les cotes ont un intitulé fixe,
 * les coins prennent la légende de la vidéo.
 */
export function getMarketTitle(
  event: Pick<StudioEvent, 'kind' | 'caption' | 'durationHours'>,
): string {
  if (event.kind === 'factor') {
    const { durationHours: hours } = event
    return `Vues validées sur ${hours >= 48 ? `${hours / 24} jours` : `${hours} h`}`
  }
  return event.caption.trim() || 'Événement coins sans légende'
}

/** Titre dans les listes du créateur : sa légende, qui distingue ses événements entre eux. */
export function getEventTitle(
  event: Pick<StudioEvent, 'kind' | 'caption' | 'durationHours'>,
): string {
  return event.caption.trim() || getMarketTitle(event)
}
/** Date de début lisible : « 12 nov., 14:30 ». */
export function formatEventStart(event: Pick<StudioEvent, 'startsAt'>): string {
  return formatDateTime(event.startsAt)
}

/** « 12 mots-clés » → « #Cuisine #Dakar ». */
export function formatHashtags(hashtags: readonly string[]): string {
  return hashtags.map((tag) => `#${tag}`).join(' ')
}

/**
 * Transforme la saisie « #Cuisine, dakar  Afrique » en mots-clés propres : sans « # »,
 * sans doublon, tronqués. Les erreurs (trop de mots-clés) sont signalées par le schéma.
 */
export function parseHashtags(raw: string): string[] {
  const seen = new Set<string>()
  const tags: string[] = []
  for (const part of raw.split(/[\s,;]+/)) {
    const tag = part.replace(/^#+/, '').replace(/[^\p{L}\p{N}_]/gu, '')
    const key = tag.toLowerCase()
    if (!tag || seen.has(key)) continue
    seen.add(key)
    tags.push(tag)
  }
  return tags
}

export function formatFileSize(bytes: number): string {
  if (bytes >= 1024 * 1024) {
    return `${(bytes / (1024 * 1024)).toFixed(1).replace('.', ',')} Mo`
  }
  return `${Math.max(1, Math.round(bytes / 1024))} Ko`
}

/** Nombre maximal de coins × prix : indicatif, la collecte réelle est décidée par le serveur. */
export function getMaxCollection(event: Pick<StudioEvent, 'maxCoins' | 'coinPrice'>) {
  if (!event.maxCoins || !event.coinPrice) return null
  return event.maxCoins * event.coinPrice
}

/** Commission créateur : 2 % du volume de chaque événement. */
export const CREATOR_EVENT_COMMISSION_RATE = 0.02

/**
 * Volume de l’événement (FCFA) : `stats.collected`, ou coins vendus × prix.
 */
export function getEventCollected(event: StudioEvent): number | null {
  const stats = event.stats
  if (!stats) return null
  if (stats.collected !== undefined) return Math.max(0, Math.round(stats.collected))
  if (
    event.kind === 'coins' &&
    event.coinPrice !== undefined &&
    stats.soldCoins !== undefined
  ) {
    return Math.max(0, Math.round(stats.soldCoins * event.coinPrice))
  }
  return null
}

/** Revenu créateur = 2 % du volume de l’événement. */
export function getCreatorCommission(event: StudioEvent): number | null {
  const collected = getEventCollected(event)
  if (collected === null) return null
  return Math.floor(collected * CREATOR_EVENT_COMMISSION_RATE)
}

/** Somme d’affichage des chiffres (revenus = commissions 2 %). */
export function sumStats(events: readonly StudioEvent[]) {
  const total = {
    views: 0,
    participants: 0,
    likes: 0,
    comments: 0,
    shares: 0,
    revenue: 0,
    collected: 0,
  }
  for (const event of events) {
    const stats: StudioEventStats | undefined = event.stats
    if (!stats) continue
    total.views += stats.views
    total.participants += stats.participants
    total.likes += stats.likes
    total.comments += stats.comments
    total.shares += stats.shares
    const collected = getEventCollected(event)
    if (collected !== null) total.collected += collected
    const commission = getCreatorCommission(event)
    if (commission !== null) total.revenue += commission
  }
  return total
}

/** Événements qui ont des chiffres à montrer (déjà commencés). */
export function withStats(events: readonly StudioEvent[]): StudioEvent[] {
  return events.filter((event) => event.stats !== undefined)
}

export type StudioFilter =
  'all' | 'draft' | 'review' | 'upcoming' | 'live' | 'ended' | 'attention'

export const STUDIO_FILTERS: readonly { id: StudioFilter; label: string }[] = [
  { id: 'all', label: 'Tous' },
  { id: 'draft', label: 'Brouillons' },
  { id: 'review', label: 'En revue' },
  { id: 'upcoming', label: 'Programmés' },
  { id: 'live', label: 'En cours' },
  { id: 'ended', label: 'Terminés' },
  { id: 'attention', label: 'À corriger' },
]

/** « À corriger » regroupe ce qui demande une réaction du créateur : refusés et suspendus. */
export function matchesFilter(event: StudioEvent, filter: StudioFilter): boolean {
  switch (filter) {
    case 'all':
      return true
    case 'draft':
      return event.status === 'draft'
    case 'review':
      return event.status === 'in_review'
    case 'upcoming':
      return event.status === 'scheduled'
    case 'live':
      return event.status === 'live'
    case 'ended':
      return event.status === 'ended'
    case 'attention':
      return event.status === 'rejected' || event.status === 'suspended'
  }
}
