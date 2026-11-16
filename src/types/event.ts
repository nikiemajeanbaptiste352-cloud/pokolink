import type { LucideIcon } from 'lucide-react'

import type { Tone } from '@/lib/tones'

/** Formats d'événements commerciaux. */
export type EventKind =
  | 'flash'
  | 'live'
  | 'launch'
  | 'promo'
  | 'community'
  | 'game'
  | 'draw'
  | 'lottery'
  | 'collective'

export type EventHostType = 'creator' | 'merchant' | 'brand'

export type EventState = 'upcoming' | 'live' | 'ended'

export interface EventHost {
  name: string
  /** Nom d'utilisateur public de son profil professionnel, s'il en a un. */
  proRef?: string
  type: EventHostType
  verified?: boolean
  avatarSrc?: string
}

/** Produit mis en avant pendant l'événement. */
export interface EventOffer {
  productName: string
  /** Prix habituel, en francs CFA. */
  normalPrice: number
  /** Prix pendant l'événement, en francs CFA. */
  eventPrice: number
  stockLeft: number
  stockTotal: number
}

/**
 * Règles publiées de l'événement (transparence du rapport : conditions, financement,
 * remise ou achat, remboursement). Textes fournis par le serveur.
 */
export interface EventTerms {
  /** Conditions de participation. */
  conditions: string
  /** Règles de financement : à quoi servent les sommes versées. */
  funding: string
  /** Loterie : remise des lots. Réduction collective : conditions d'achat. */
  delivery: string
  /** Conditions de remboursement. */
  refund: string
}

/** Loterie : `selection` = tirage en cours de traitement, `awarded` = lots attribués. */
export type LotteryPhase = 'selection' | 'awarded'

/**
 * Ticket de loterie marketing : numéro inscrit au tirage.
 * Une participation peut générer plusieurs tickets (= chances).
 */
export interface LotteryDrawTicket {
  /** Numéro affiché sur la carte (ex. LT-2026-004821). */
  number: string
  /** Nom abrégé du participant (serveur). */
  holderLabel: string
  /** Vrai si ce numéro a été tiré gagnant. */
  winner?: boolean
}

/** Loterie marketing : un lot mis en jeu, des gagnants désignés par tirage au sort. */
export interface EventLottery {
  prizeName: string
  /** Valeur du lot, en francs CFA. */
  prizeValue: number
  /** Participation en francs CFA ; 0 = participation gratuite. */
  entryFee: number
  /**
   * Plafond de places — dérivé du système (valeur du lot ÷ participation),
   * pas un choix libre du vendeur. Recalculé via `resolveLotteryRules`.
   */
  maxParticipants: number
  winnersCount: number
  /** Mécanisme de tirage annoncé. */
  drawMethod: string
  /** Moment du tirage, réalisé par le serveur après la clôture (ms). */
  drawAt: number
  /**
   * Chances par participant — dérivé de la valeur du lot (pas choisi par le vendeur).
   * Recalculé via `resolveLotteryRules`.
   */
  entriesPerPerson: number
  /** Référence publique du journal du tirage (empreinte), publiée une fois le tirage fait. */
  proofRef?: string
  /** Montant déjà collecté, calculé par le serveur. */
  collected: number
  /** Après la clôture seulement. */
  phase?: LotteryPhase
  /** Gagnants annoncés (noms abrégés), une fois les lots attribués. */
  winners?: readonly string[]
  /**
   * Numéros de tickets inscrits au tirage (échantillon / résultat public).
   * Le tirage de fin de session se fait exclusivement sur ces numéros.
   */
  drawTickets?: readonly LotteryDrawTicket[]
  /** Numéros gagnants (raccourci), une fois le tirage publié. */
  winningTicketNumbers?: readonly string[]
}

/** Palier de réduction : à partir de `collected` FCFA collectés, le prix devient `price`. */
export interface PriceTier {
  collected: number
  price: number
}

/**
 * Réduction collective : les contributions font baisser le prix ; à la clôture le prix est
 * arrêté, puis le produit est proposé à ce prix dans la limite du stock. La formule de
 * réduction est définie à l'avance et appliquée par le serveur ; le frontend l'affiche.
 */
export interface EventCollective {
  productName: string
  initialPrice: number
  /** Prix actuel (figé après la clôture). */
  currentPrice: number
  /** Montant d'une contribution, en francs CFA. */
  entryFee: number
  /** Montant total collecté, calculé par le serveur. */
  collected: number
  /** Paliers annoncés, du premier au dernier. */
  tiers: readonly PriceTier[]
  stockLeft: number
  stockTotal: number
}

export interface MarketEvent {
  id: string
  kind: EventKind
  title: string
  description: string
  host: EventHost
  /** Début et fin, en millisecondes (horodatage). */
  startsAt: number
  endsAt: number
  offer?: EventOffer
  /** Présent pour une loterie marketing (`kind: 'lottery'`). */
  lottery?: EventLottery
  /** Présent pour une réduction collective (`kind: 'collective'`). */
  collective?: EventCollective
  terms?: EventTerms
  /** Récompense annoncée (jeux, tirages, événements communautaires). */
  reward?: string
  participants: number
  imageSrc?: string
  /** Lien de partenariat collé (affiliation, forfait, pub…). */
  partnershipLink?: string
}

export interface EventKindMeta {
  label: string
  /** Libellé au pluriel pour les filtres. */
  plural: string
  icon: LucideIcon
  tone: Tone
}
