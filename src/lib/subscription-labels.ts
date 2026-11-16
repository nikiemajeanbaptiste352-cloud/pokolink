import { formatDate } from '@/lib/pro-labels'
import type { SubscriptionCard, SubscriptionCardStatus } from '@/types/subscription'

export interface SubscriptionStatusMeta {
  label: string
  /** Mention affichée en tête de la carte. */
  headline: string
  /** Explication destinée au titulaire. */
  message: string
  /** Ce statut donne droit aux avantages du forfait. */
  valid: boolean
}

export const SUBSCRIPTION_STATUS: Record<SubscriptionCardStatus, SubscriptionStatusMeta> =
  {
    pending_payment: {
      label: 'Paiement en attente',
      headline: 'Paiement en attente de confirmation',
      message:
        'Votre demande est envoyée. Le serveur confirme le paiement puis active la carte : tant qu’il n’a pas répondu, elle n’est pas valable.',
      valid: false,
    },
    active: {
      label: 'Active',
      headline: 'Abonnement actif',
      message:
        'Présentez cette carte au prestataire : il scannera le QR code pour vérifier que votre abonnement est valable.',
      valid: true,
    },
    expired: {
      label: 'Expirée',
      headline: 'Abonnement expiré',
      message: 'La période de ce forfait est terminée : la carte n’est plus valable.',
      valid: false,
    },
    cancelled: {
      label: 'Annulée',
      headline: 'Carte annulée',
      message:
        'Cette carte est annulée : elle ne donne plus droit aux avantages du forfait. Les conditions de remboursement sont définies par le serveur.',
      valid: false,
    },
  }

export const SUBSCRIPTION_STATUS_ORDER: readonly SubscriptionCardStatus[] = [
  'active',
  'pending_payment',
  'expired',
  'cancelled',
]

/**
 * Statut tel qu'il se lit à `now` : une carte « active » dont la fin est passée est expirée,
 * même si le serveur n'a pas encore mis son statut à jour. C'est un simple affichage ; la
 * décision de validité appartient au serveur.
 */
export function getCardStatus(
  card: SubscriptionCard,
  now: number,
): SubscriptionCardStatus {
  if (card.status === 'active' && card.endsAt !== undefined && card.endsAt <= now) {
    return 'expired'
  }
  return card.status
}

/** Numéro tel qu'il est affiché : « #AB-2026-004217 ». */
export function formatCardNumber(number: string): string {
  return `#${number}`
}

/** Ligne de validité : « Du 12 nov. 2026 au 12 déc. 2026 » ou la raison de son absence. */
export function formatValidity(card: SubscriptionCard): string {
  if (card.startsAt === undefined) return 'Dates fixées à la confirmation du paiement'
  const start = formatDate(card.startsAt)
  return card.endsAt === undefined
    ? `Depuis le ${start} · sans date de fin`
    : `Du ${start} au ${formatDate(card.endsAt)}`
}
