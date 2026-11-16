export type MarketStatus = 'open' | 'upcoming' | 'closed'

export type MarketPosition = 'yes' | 'no'

/**
 * État du calcul du facteur (décidé par le serveur) :
 * - warmup    : démarrage neutre, la moyenne de référence n'est pas encore fiable ;
 * - active    : le facteur est mis à jour à chaque période ;
 * - suspended : données indisponibles ou incohérentes, le facteur est figé.
 */
export type MarketUpdateState = 'warmup' | 'active' | 'suspended'

/**
 * Liquidité du pool de l'événement (décidée par le serveur) :
 * - covered   : les retraits sont payés à 100 % ;
 * - limited   : les retraits sont payés au taux de couverture, nouvelles positions bloquées ;
 * - suspended : aucun paiement, les positions et les montants dus sont conservés.
 */
export type PoolState = 'covered' | 'limited' | 'suspended'

/** Paramètres de simulation du facteur. Valeurs à tester, pas des valeurs optimales prouvées. */
export interface MarketParams {
  factorMin: number
  factorMax: number
  /** Sensibilité : variation maximale du facteur par mise à jour (0,02 = 2 %). */
  maxStep: number
  /** Nombre de périodes précédentes servant à calculer la moyenne de référence. */
  referencePeriods: number
  updateEveryMinutes: number
}

/**
 * Événement du Creator Performance Market : le facteur (la « cote ») suit l'accélération
 * ou le ralentissement des vues validées d'un créateur. Toutes les valeurs de calcul sont
 * fournies par le serveur : le frontend ne les calcule jamais.
 */
export interface CreatorMarket {
  id: string
  creatorName: string
  creatorHandle: string
  creatorAvatar?: string
  /** Ex. « Vues validées sur 24 h ». */
  title: string
  /** Légende de la vidéo du créateur. */
  caption: string
  hashtags: readonly string[]
  /** Vidéo du créateur. Sans `videoSrc`, un fond provisoire est affiché. */
  videoSrc?: string
  posterSrc?: string
  /** Lien de partenariat collé sous la vidéo. */
  partnershipLink?: string
  status: MarketStatus
  updateState: MarketUpdateState
  /** Motif affiché quand le calcul est suspendu. */
  suspendedReason?: string
  /** Périodes de référence déjà écoulées (sur `referencePeriods`) pendant le démarrage neutre. */
  referencePeriodsDone: number
  /** Facteur actuel (la cote). */
  cote: number
  /** Facteur à l'ouverture de l'événement (point de comparaison). */
  openingCote: number
  /** Facteurs successifs, un par période, du plus ancien au plus récent. */
  history: readonly number[]
  poolState: PoolState
  /**
   * Taux de couverture du pool : part des montants demandés réellement payable maintenant
   * (1 = tout est couvert). Identique pour tous les participants au même instant.
   */
  coverageRatio: number
  /** Mises / entrées confirmées dans le pool (FCFA). */
  poolCollected: number
  /** Retraits de position déjà payés (FCFA). */
  poolPaid: number
  /** Solde distribuable actuel du pool (FCFA). */
  poolBalance: number
  /**
   * Flux récents du pool (mises et retraits), du plus récent au plus ancien.
   * Affiché sur la carte détail ; fourni par le serveur.
   */
  poolFlow?: readonly MarketPoolFlowEntry[]
  /** Vues validées par heure pendant la période récente (G). */
  recentRate: number
  /** Moyenne des vues validées par heure sur les périodes précédentes (A). */
  referenceRate: number
  /** Signal de variation (G − A) / (G + A), entre −1 et +1, fourni par le serveur. */
  signal: number
  /** Vues validées depuis l'ouverture (le compteur démarre à 0). */
  validatedViews: number
  participants: number
  likes: number
  comments: number
  shares: number
  /** Texte d'échéance, ex. « Clôture dans 2 h 15 ». */
  timeLabel: string
  /** Prochaine mise à jour du facteur, ex. « dans 23 min ». Absent si non applicable. */
  nextUpdateLabel?: string
}

/** Une ligne du flux dynamique du pool (mise ou retrait). */
export interface MarketPoolFlowEntry {
  id: string
  kind: 'stake' | 'withdraw'
  /** Montant en FCFA. */
  amount: number
  /** Libellé court, ex. « Mise OUI · Awa K. ». */
  label: string
  /** Horodatage ms (affichage relatif côté UI). */
  at: number
}

/**
 * Position d'un participant. Les montants (FCFA, entiers) sont tous calculés par le serveur :
 * valeur théorique, net demandé et montant payable maintenant sont trois chiffres distincts.
 */
export interface UserPosition {
  id: string
  marketId: string
  side: MarketPosition
  /** Mise initiale. */
  stake: number
  /** Facteur au moment de l'entrée. */
  entryCote: number
  /** Valeur théorique actuelle de la position. */
  theoreticalValue: number
  /** Gain (positif) ou perte (négatif) latent : valeur théorique moins mise. */
  latent: number
  /** Montant net demandé au retrait (après frais éventuels). */
  netValue: number
  /** Montant effectivement payable maintenant, compte tenu de la liquidité du pool. */
  payableNow: number
}
