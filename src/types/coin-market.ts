/**
 * Creator Performance Market, 2e type d'événement : les « coins ».
 * Le participant achète un nombre limité de coins avant le début ; ensuite la valeur
 * théorique du coin suit un indice de popularité de la vidéo, et les retraits sont payés
 * par le pool (somme des achats). Toutes les valeurs de calcul viennent du serveur : le
 * frontend ne calcule jamais l'indice, la valeur d'un coin, le pool ni un montant payable.
 */

/**
 * États du cycle de vie (décidés par le serveur) :
 * - purchases_open   : achats ouverts, l'événement n'a pas commencé ;
 * - purchases_closed : plus aucun achat (coins épuisés), l'événement attend son heure ;
 * - running          : l'indice évolue, les retraits sont ouverts ;
 * - closing          : clôture en cours (ex. pool épuisé), demandes en cours de traitement ;
 * - closed           : mécanisme arrêté ;
 * - suspended        : gelé (anomalie, fraude), données et historiques conservés.
 * (Le brouillon n'existe que côté créateur.)
 */
export type CoinEventState =
  'purchases_open' | 'purchases_closed' | 'running' | 'closing' | 'closed' | 'suspended'

/** Motif d'une clôture, enregistré avec l'heure par le serveur. */
export type CoinCloseReason = 'pool_exhausted' | 'time_elapsed'

/**
 * Règlement des détenteurs restants, distinct de la clôture (rapport, section 15) :
 * `pending` = des demandes ou des droits restent à traiter ; `done` = tout est réglé.
 */
export type CoinSettlement = 'pending' | 'done'

export interface CoinEvent {
  id: string
  creatorName: string
  creatorHandle: string
  creatorAvatar?: string
  /** Légende de la vidéo du créateur. */
  caption: string
  hashtags: readonly string[]
  /** Vidéo du créateur. Sans `videoSrc`, un fond provisoire est affiché dans le fil. */
  videoSrc?: string
  posterSrc?: string
  likes: number
  shares: number
  state: CoinEventState
  /** Motif affiché quand l'événement est suspendu. */
  suspendedReason?: string
  closeReason?: CoinCloseReason
  settlement?: CoinSettlement

  /** Nombre maximal de coins (N max). */
  maxCoins: number
  /** Coins déjà attribués (N vendus). */
  soldCoins: number
  /** Prix initial d'un coin en FCFA (c0), visible avant l'achat. */
  coinPrice: number
  /** Texte de début, ex. « Début demain à 08:00 ». */
  startLabel: string

  /** Indice normalisé X, borné entre 50 et 150 (100 = point de départ). */
  index: number
  /** Indices successifs, un par période, du plus ancien au plus récent. */
  indexHistory: readonly number[]
  /** Valeur théorique actuelle d'un coin en FCFA (c), arrondie vers le bas par le serveur. */
  coinValue: number
  /** Vues validées cumulées (V). */
  validatedViews: number
  /** Nouvelles vues validées sur la dernière période (G). */
  recentViews: number
  /** Moyenne des nouvelles vues sur les périodes précédentes (A). */
  referenceViews: number
  /** Signal de croissance (G − A) / (G + A), entre −1 et +1. */
  signal: number
  participants: number

  /** Pool : paiements d'achat confirmés (C). */
  poolCollected: number
  /** Retraits effectivement payés (W). */
  poolPaid: number
  /** Montants réservés par des demandes de retrait en cours de traitement. */
  poolReserved: number
  /** Solde distribuable restant : C − W − réservé (B), fourni par le serveur. */
  poolBalance: number
  /** Coins encore détenus par les participants (non retirés). */
  heldCoins: number
  /** Valeur théorique totale de ces coins : indique si le pool peut tout couvrir. */
  heldTheoreticalValue: number
}

/** Position d'un participant sur un événement. Montants en FCFA entiers, venant du serveur. */
export interface CoinPosition {
  id: string
  eventId: string
  /** Coins détenus et libres (hors demande en cours). */
  coins: number
  /** Total payé à l'achat de tous les coins achetés. */
  spent: number
  /** Valeur théorique des coins libres. Pas une somme garantie. */
  theoreticalValue: number
  /** Montant payable maintenant compte tenu du pool (peut être inférieur ou nul). */
  payableNow: number
  /** Coins dont le retrait est en cours de traitement (non payé, non terminé). */
  pendingCoins: number
  pendingAmount: number
  /** Coins déjà retirés et payés. */
  withdrawnCoins: number
  withdrawnAmount: number
}
