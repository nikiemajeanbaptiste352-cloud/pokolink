import { resolveProviderAvatar } from '@/lib/receipts'
import type { Purchase } from '@/types/purchase'
import type { PaymentTicket } from '@/types/ticket'

/**
 * Transforme un achat dont le paiement est confirmé en ticket affichable.
 * Le serveur génère le vrai ticket ; ici on expose la preuve locale avec le logo
 * de l'espace pro dès que le statut n'est plus « en attente ».
 */
export function ticketFromPurchase(purchase: Purchase): PaymentTicket | undefined {
  if (purchase.status === 'pending_payment' || purchase.status === 'cancelled')
    return undefined

  const pendingValidation =
    purchase.status === 'paid' ||
    purchase.status === 'preparing' ||
    purchase.status === 'ready'

  return {
    id: `purchase-ticket-${purchase.id}`,
    number: purchase.reference.replace(/^ACH-/, 'AC-'),
    serviceId: purchase.serviceId,
    proRef: purchase.proRef,
    clientName: `${purchase.buyer.firstName} ${purchase.buyer.lastName}`.trim(),
    mine: true,
    itemLabel: purchase.lines.map((line) => `${line.name} × ${line.quantity}`).join(', '),
    amount: purchase.total,
    paidAt: purchase.createdAt,
    method: 'wallet',
    transactionRef: purchase.walletPaymentId
      ? `W-${purchase.walletPaymentId.slice(0, 8).toUpperCase()}`
      : purchase.reference,
    status:
      purchase.status === 'completed'
        ? 'validated'
        : pendingValidation
          ? 'pending_validation'
          : 'paid',
    verificationCode: `AC-${purchase.reference.replace(/[^A-Z0-9]/gi, '').slice(-12)}`,
    ...(purchase.status === 'completed' ? { validatedAt: purchase.createdAt } : {}),
  }
}

/** Logo à afficher sur le ticket lié à un achat. */
export function logoForPurchase(purchase: Purchase): string | undefined {
  return resolveProviderAvatar(purchase.proRef, purchase.sellerLogo)
}
