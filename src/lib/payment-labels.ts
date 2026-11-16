import type { WalletPaymentPurpose, WalletTransactionKind } from '@/types/wallet'

/** Motif affiché d'un paiement, selon la nature de l'action payante. */
export const PAYMENT_MOTIVE: Record<WalletPaymentPurpose, string> = {
  purchase: 'Achat',
  position: 'Participation à un événement (position)',
  coins: 'Achat de coins',
  subscription: 'Abonnement',
  advertising: 'Publicité',
  event: 'Market Event',
  p2p_send: 'Envoi d’argent',
  p2p_request: 'Demande d’argent',
}

/**
 * Rewards (option design) : désactivés pour Market Event, publicité et Creator Market.
 * Activés pour achat boutique, abonnement et P2P.
 */
export function paymentRewardsEnabled(purpose: WalletPaymentPurpose): boolean {
  return (
    purpose === 'purchase' ||
    purpose === 'subscription' ||
    purpose === 'p2p_send' ||
    purpose === 'p2p_request'
  )
}

/** Libellé de la nature d'une ligne du journal Wallet. */
export const TRANSACTION_KIND_LABEL: Record<WalletTransactionKind, string> = {
  deposit: 'Dépôt',
  withdrawal: 'Retrait',
  payment: 'Paiement',
  credit: 'Crédit reçu',
  commission: 'Commission',
  refund: 'Remboursement',
  cancellation: 'Annulation',
}

/** Découpe un nom complet en prénom (premier mot) et nom (le reste). */
export function splitName(fullName: string): { firstName: string; lastName: string } {
  const [first = '', ...rest] = fullName.trim().split(/\s+/)
  return { firstName: first, lastName: rest.join(' ') }
}

/** Le Wallet reçoit la commission éventuelle : son montant et son taux viennent du serveur. */
export const COMMISSION_NOTE = 'Déterminée par le serveur selon la catégorie'
