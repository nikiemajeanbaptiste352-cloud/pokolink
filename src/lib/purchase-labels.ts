import type { PurchaseStatus } from '@/types/purchase'

export const PURCHASE_STATUS: Record<PurchaseStatus, { label: string; message: string }> =
  {
    pending_payment: {
      label: 'Paiement en attente',
      message:
        'Votre demande est envoyée. Le serveur vérifie votre solde puis débite votre Wallet : tant qu’il n’a pas répondu, rien n’est payé ni transmis au vendeur.',
    },
    paid: {
      label: 'Payé',
      message: 'Paiement confirmé. Votre commande est transmise au vendeur.',
    },
    preparing: {
      label: 'En préparation',
      message: 'Le vendeur a accepté votre commande et la prépare.',
    },
    ready: {
      label: 'Prête',
      message: 'Votre commande est prête. Voyez avec le vendeur comment la recevoir.',
    },
    completed: {
      label: 'Remise',
      message: 'Votre commande vous a été remise.',
    },
    cancelled: {
      label: 'Annulée',
      message:
        'La commande est annulée. Le remboursement éventuel est décidé par le serveur et apparaît dans votre Wallet.',
    },
  }

/** Étapes du parcours d'un achat, dans l'ordre. */
export const PURCHASE_JOURNEY: readonly { id: PurchaseStatus; label: string }[] = [
  { id: 'pending_payment', label: 'Paiement' },
  { id: 'paid', label: 'Payé' },
  { id: 'preparing', label: 'Préparation' },
  { id: 'ready', label: 'Prête' },
  { id: 'completed', label: 'Remise' },
]
