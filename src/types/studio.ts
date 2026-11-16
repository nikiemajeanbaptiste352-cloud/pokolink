/**
 * Creator Studio : l'espace du créateur pour proposer ses propres événements Creator Market
 * (cotes OUI / NON ou coins), suivre leur historique et leurs statistiques.
 *
 * Le créateur PROPOSE un événement ; il ne le publie jamais lui-même. La validation, le calcul
 * du facteur ou de l'indice, le pool et tout montant sont décidés par le serveur.
 */

/** `factor` = cotes OUI / NON ; `coins` = achat d'un nombre limité de coins. */
export type StudioEventKind = 'factor' | 'coins'

/**
 * Cycle de vie vu par le créateur (le statut est décidé par le serveur, sauf les passages
 * brouillon ↔ en revue qui sont des actions du créateur) :
 * - draft     : brouillon, modifiable ;
 * - in_review : envoyé pour validation, en attente de la décision d'AfriConnect ;
 * - rejected  : refusé avec un motif ; modifiable puis renvoyable ;
 * - scheduled : validé, programmé (les achats s'ouvrent pour les coins) ;
 * - live      : en cours ;
 * - ended     : terminé ;
 * - suspended : gelé par AfriConnect (anomalie, fraude), données conservées.
 */
export type StudioEventStatus =
  'draft' | 'in_review' | 'rejected' | 'scheduled' | 'live' | 'ended' | 'suspended'

/** Chiffres d'audience d'un événement : tous fournis par le serveur. */
export interface StudioEventStats {
  /** Vues validées depuis le début de l'événement. */
  views: number
  participants: number
  likes: number
  comments: number
  shares: number
  /** Vues validées par période, de la plus ancienne à la plus récente. */
  viewsSeries: readonly number[]
  /**
   * Volume total de l’événement (mises / ventes), en FCFA.
   * Le revenu créateur = 2 % de ce montant.
   */
  collected?: number
  /**
   * Revenu créateur (2 % du volume), en FCFA.
   * Préférable de le recalculer via `getCreatorCommission` ; ce champ peut rester
   * pour l’API.
   */
  revenue?: number
  /** Coins vendus (événements coins uniquement). */
  soldCoins?: number
}

export interface StudioEvent {
  id: string
  kind: StudioEventKind
  status: StudioEventStatus
  /** Légende de la vidéo. */
  caption: string
  /** Mots-clés sans « # ». */
  hashtags: readonly string[]
  /** Nom du fichier vidéo choisi (le fichier lui-même n'est pas conservé en démonstration). */
  videoName: string
  videoSize: number
  /** Image de couverture (data URL), facultative. */
  cover: string
  /** Lien de partenariat collé sous la vidéo. */
  partnershipLink?: string
  /** Début, en millisecondes. */
  startsAt: number
  /** Durée de l'événement en heures. */
  durationHours: number
  /** Coins : nombre maximal et prix initial d'un coin en FCFA. */
  maxCoins?: number
  coinPrice?: number
  createdAt: number
  updatedAt: number
  submittedAt?: number
  reviewedAt?: number
  /** Motif d'un refus ou d'une suspension, écrit par AfriConnect. */
  reason?: string
  /** Absent tant que l'événement n'a pas commencé. */
  stats?: StudioEventStats
}
