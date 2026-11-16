/**
 * Types du module Rewards (points de fidélité), distinct du Wallet FCFA.
 * Le serveur reste la source de vérité : le frontend n'émet, ne dépense ni ne transfère
 * jamais de points, il affiche ce que le serveur lui renvoie.
 */

/** Types d'opérations du journal (rapport Rewards, section 13.2). */
export type RewardsOperationKind =
  'EARN' | 'RESERVE' | 'RELEASE' | 'SPEND' | 'TRANSFER_OUT' | 'TRANSFER_IN' | 'REVERSE'

/**
 * État d'une opération :
 *   pending   : en attente de la réponse du serveur
 *   confirmed : confirmée par le serveur
 *   refused   : refusée (solde insuffisant, règle non respectée…)
 *   cancelled : annulée
 */
export type RewardsOperationStatus = 'pending' | 'confirmed' | 'refused' | 'cancelled'

export interface RewardsBalances {
  /** Points utilisables. */
  available: number
  /** Points réservés par une opération en cours (achat ou transfert en attente). */
  pending: number
}

/** Une ligne du journal : toujours accompagnée d'une référence et d'un statut. */
export interface RewardsOperation {
  id: string
  /** Référence unique de l'opération. */
  reference: string
  kind: RewardsOperationKind
  /** Nombre de points, toujours positif : le sens vient du type d'opération. */
  points: number
  title: string
  detail?: string
  /** Date de l'opération (ms). */
  at: number
  status: RewardsOperationStatus
}
