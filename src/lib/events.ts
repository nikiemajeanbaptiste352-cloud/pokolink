import {
  Dices,
  Gift,
  Percent,
  Radio,
  Rocket,
  Ticket,
  TrendingDown,
  Users,
  Zap,
} from 'lucide-react'

import type { EventKind, EventKindMeta, EventState, MarketEvent } from '@/types/event'

export const EVENT_KINDS: Record<EventKind, EventKindMeta> = {
  flash: { label: 'Vente flash', plural: 'Ventes flash', icon: Zap, tone: 'amber' },
  live: { label: 'Live commerce', plural: 'Lives', icon: Radio, tone: 'red' },
  launch: { label: 'Lancement', plural: 'Lancements', icon: Rocket, tone: 'violet' },
  promo: { label: 'Promotion', plural: 'Promotions', icon: Percent, tone: 'brand' },
  community: { label: 'Communauté', plural: 'Communauté', icon: Users, tone: 'info' },
  game: { label: 'Jeu promotionnel', plural: 'Jeux', icon: Gift, tone: 'gold' },
  draw: { label: 'Tirage au sort', plural: 'Tirages', icon: Ticket, tone: 'gold' },
  lottery: { label: 'Loterie marketing', plural: 'Loteries', icon: Dices, tone: 'gold' },
  collective: {
    label: 'Réduction collective',
    plural: 'Réductions collectives',
    icon: TrendingDown,
    tone: 'brand',
  },
}

/** Teintes des fonds provisoires (tant qu'aucune vidéo ou image n'est fournie). */
export const EVENT_HUES: Record<EventKind, number> = {
  flash: 24,
  live: 350,
  launch: 285,
  promo: 150,
  community: 205,
  game: 45,
  draw: 45,
  lottery: 32,
  collective: 165,
}

/** Image de secours par format si l’événement n’en a pas (maquette). */
export const EVENT_KIND_FALLBACK_IMAGE: Partial<Record<EventKind, string>> = {
  flash:
    'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=800&h=500&fit=crop',
  live: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&h=500&fit=crop',
  lottery:
    'https://images.unsplash.com/photo-1513885535751-8b9238bd345a?w=800&h=500&fit=crop',
  collective:
    'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=800&h=500&fit=crop',
  promo:
    'https://images.unsplash.com/photo-1607083206869-4c7672e72a8a?w=800&h=500&fit=crop',
  launch:
    'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&h=500&fit=crop',
  community:
    'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800&h=500&fit=crop',
  game: 'https://images.unsplash.com/photo-1513885535751-8b9238bd345a?w=800&h=500&fit=crop',
  draw: 'https://images.unsplash.com/photo-1513885535751-8b9238bd345a?w=800&h=500&fit=crop',
}

/** Pour les rubriques de filtre : regroupe jeux et tirages. */
export type EventFilter =
  | 'all'
  | 'flash'
  | 'live'
  | 'launch'
  | 'promo'
  | 'community'
  | 'games'
  | 'lottery'
  | 'collective'

export const EVENT_FILTERS: readonly { id: EventFilter; label: string }[] = [
  { id: 'all', label: 'Tous' },
  { id: 'flash', label: 'Ventes flash' },
  { id: 'lottery', label: 'Loteries' },
  { id: 'collective', label: 'Réductions' },
  { id: 'live', label: 'Lives' },
  { id: 'launch', label: 'Lancements' },
  { id: 'promo', label: 'Promotions' },
  { id: 'community', label: 'Communauté' },
  { id: 'games', label: 'Jeux & tirages' },
]

export function matchesFilter(event: MarketEvent, filter: EventFilter): boolean {
  if (filter === 'all') return true
  if (filter === 'games') return event.kind === 'game' || event.kind === 'draw'
  return event.kind === filter
}

/**
 * Tous les formats Market Event ouvrent le panneau de participation
 * (informations + progression + action), adapté au type d’événement.
 */
export function hasParticipationPage(event: MarketEvent): boolean {
  return event.kind !== undefined
}

/** Principe de chaque format, affiché sur la page de l'événement. */
export const EVENT_RULES: Record<EventKind, string> = {
  flash:
    'Offre limitée dans le temps et en quantité : elle se termine à la fin du compte à rebours ou quand le stock est épuisé.',
  live: 'Le direct (vidéo, chat, achat sans quitter le live) arrivera avec le module Live. En attendant, la page présente l’offre et le compte à rebours.',
  launch: 'Offre de lancement, limitée au stock indiqué et à la durée de l’événement.',
  promo: 'Réduction valable pendant la période indiquée, dans la limite du stock.',
  community:
    'Activité ouverte à tous les participants ; la récompense est annoncée par l’organisateur.',
  game: 'La récompense dépend des règles fixées par l’organisateur, publiées avant le début de l’événement.',
  draw: 'Les gagnants sont désignés automatiquement par le serveur selon des règles publiées avant le début du tirage. L’organisateur ne choisit pas les gagnants.',
  lottery:
    'Un lot est mis en jeu. Chaque participation reçoit des tickets numérotés (chances calculées d’après la valeur du produit). En fin de session, le serveur tire au sort parmi ces numéros — affichés sur les cartes loterie marketing.',
  collective:
    'Les contributions de tous les participants font baisser le prix du produit, selon la règle annoncée. À la clôture, le prix est arrêté : le produit est ensuite proposé à ce prix, dans la limite du stock.',
}

export const HOST_TYPE_LABEL = {
  creator: 'Créateur',
  merchant: 'Commerçant',
  brand: 'Marque',
} as const

export const EVENT_STATE_LABEL: Record<EventState, string> = {
  upcoming: 'À venir',
  live: 'En cours',
  ended: 'Terminé',
}

/** État d'un événement à l'instant `now` (en millisecondes). */
export function getEventState(event: MarketEvent, now: number): EventState {
  if (now < event.startsAt) return 'upcoming'
  if (now >= event.endsAt) return 'ended'
  return 'live'
}

/** Compte à rebours : « 12:05 », « 02:15:30 » ou « 1 j 04 h » pour les longues durées. */
export function formatCountdown(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 1000))
  const days = Math.floor(total / 86400)
  const hours = Math.floor((total % 86400) / 3600)
  const minutes = Math.floor((total % 3600) / 60)
  const seconds = total % 60
  const two = (n: number) => String(n).padStart(2, '0')

  if (days > 0) return `${days} j ${two(hours)} h`
  if (hours > 0) return `${two(hours)}:${two(minutes)}:${two(seconds)}`
  return `${two(minutes)}:${two(seconds)}`
}

/** Temps restant en toutes lettres : « 6 h restantes », « 4 j restants », « 25 min restantes ». */
export function formatRemaining(ms: number): string {
  const minutes = Math.max(0, Math.ceil(ms / 60_000))
  if (minutes >= 2 * 24 * 60) return `${Math.floor(minutes / (24 * 60))} j restants`
  if (minutes >= 60) return `${Math.floor(minutes / 60)} h restantes`
  return `${minutes} min restantes`
}

/** Pourcentage de réduction affiché entre le prix habituel et le prix de l'événement. */
export function getDiscountPercent(normalPrice: number, eventPrice: number): number {
  if (normalPrice <= 0 || eventPrice >= normalPrice) return 0
  return Math.round((1 - eventPrice / normalPrice) * 100)
}
