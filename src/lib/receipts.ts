import { findDemoPro } from '@/lib/directory'
import { TEMP_TICKETS } from '@/lib/placeholder-tickets'
import { findTransaction } from '@/lib/placeholder-wallet'
import { getProfile } from '@/lib/profile-store'
import { splitName } from '@/lib/payment-labels'
import { paths } from '@/routes/paths'
import type { Purchase } from '@/types/purchase'
import type { WalletDocumentKind, WalletTransaction } from '@/types/wallet'

function originBase(): string {
  return typeof window !== 'undefined' ? window.location.origin : ''
}

/** Même code que le ticket d’achat (`purchase-tickets`) pour un QR scannable. */
function purchaseVerificationCode(reference: string): string {
  return `AC-${reference.replace(/[^A-Z0-9]/gi, '').slice(-12)}`
}

/**
 * Justificatif de paiement ou ticket. Le serveur ne le génère QU'APRÈS la confirmation
 * effective du paiement : une demande « en attente » n'en produit jamais.
 *
 *   receipt : simple preuve de paiement, sans validation physique (pas de QR code)
 *   ticket  : preuve à présenter au prestataire, qui la valide en scannant le QR code
 *
 * Le ticket / justificatif affiche toujours le logo ou la photo de profil de l'espace pro
 * lorsqu'ils sont connus.
 */
export interface ReceiptData {
  kind: WalletDocumentKind
  transactionNumber: string
  ticketNumber?: string
  qrValue?: string
  /** Prestataire ou vendeur (photo / logo et nom). */
  provider: { name: string; handle?: string; avatarSrc?: string }
  payer: { firstName: string; lastName: string; handle?: string }
  beneficiaryHandle?: string
  nature: string
  designation: string
  amount: number
  commission?: number
  at: number
  walletReference: string
  paymentStatus: string
  ticketStatus?: string
  backTo: string
}

const NATURE: Partial<Record<WalletTransaction['kind'], string>> = {
  payment: 'Paiement',
  credit: 'Vente',
  refund: 'Remboursement',
}

function natureOf(transaction: WalletTransaction): string {
  const head = transaction.title.split('·')[0]?.trim()
  return head || NATURE[transaction.kind] || 'Opération'
}

function ticketNumber(reference: string): string {
  return `TK-${reference.replace(/^[A-Z]+-/, '')}`
}

/** Logo ou photo de profil de l'espace pro, depuis l'annuaire si besoin. */
export function resolveProviderAvatar(
  proRef: string | undefined,
  fallback?: string,
): string | undefined {
  if (fallback) return fallback
  if (!proRef) return undefined
  const logo = findDemoPro(proRef)?.service.logo
  return logo || undefined
}

/** Justificatif d'une ligne du journal Wallet ; `undefined` si elle n'en produit pas. */
export function receiptForTransaction(id: string | undefined): ReceiptData | undefined {
  const transaction = findTransaction(id)
  if (!transaction?.document || !transaction.reference) return undefined
  const reference = transaction.reference
  const me = getProfile()
  const mine = splitName(me.name)
  const other = transaction.counterpart
  const otherName = splitName(other?.name ?? '')
  const incoming = transaction.kind === 'credit'
  const isTicket = transaction.document === 'ticket'
  const otherHandle = other?.handle
  const otherAvatar = resolveProviderAvatar(otherHandle)
  // Lier le QR au ticket connu (même référence) pour que le scanner Espace Pro soit précis.
  const linkedTicket = isTicket
    ? TEMP_TICKETS.find(
        (ticket) =>
          ticket.transactionRef === reference ||
          ticket.number === ticketNumber(reference),
      )
    : undefined
  const ticketQr = linkedTicket
    ? `${originBase()}${paths.serviceScanner(linkedTicket.serviceId, linkedTicket.verificationCode)}`
    : `AC:${reference}`

  return {
    kind: transaction.document,
    transactionNumber: reference,
    ...(isTicket
      ? {
          ticketNumber: linkedTicket?.number ?? ticketNumber(reference),
          qrValue: ticketQr,
          ticketStatus: 'À valider par le prestataire',
        }
      : {}),
    provider: incoming
      ? {
          name: me.name,
          handle: me.handle,
          ...(me.avatarSrc ? { avatarSrc: me.avatarSrc } : {}),
        }
      : {
          name: other?.name ?? 'AfriConnect',
          ...(otherHandle ? { handle: otherHandle } : {}),
          ...(otherAvatar ? { avatarSrc: otherAvatar } : {}),
        },
    payer: incoming
      ? { ...otherName, ...(otherHandle ? { handle: otherHandle } : {}) }
      : { ...mine, handle: me.handle },
    ...(incoming
      ? { beneficiaryHandle: me.handle }
      : otherHandle
        ? { beneficiaryHandle: otherHandle }
        : {}),
    nature: natureOf(transaction),
    designation: transaction.detail ?? transaction.title,
    amount: transaction.gross ?? Math.abs(transaction.amount),
    ...(transaction.commission !== undefined
      ? { commission: transaction.commission }
      : {}),
    at: transaction.at,
    walletReference: transaction.reference,
    paymentStatus: 'Confirmé',
    backTo: paths.walletOperation(transaction.id),
  }
}

/**
 * Justificatif / ticket d'un achat. Généré automatiquement dès que le paiement est
 * confirmé (pas en attente, pas annulé). Inclut le logo ou la photo de l'espace pro.
 */
export function receiptForPurchase(
  purchase: Purchase | undefined,
): ReceiptData | undefined {
  if (!purchase) return undefined
  if (purchase.status === 'pending_payment' || purchase.status === 'cancelled')
    return undefined
  const completed = purchase.status === 'completed'
  const avatarSrc = resolveProviderAvatar(purchase.proRef, purchase.sellerLogo)
  const ticketNo = purchase.reference.replace(/^ACH-/, 'AC-')
  // QR = scanner Espace Pro + code de vérification du ticket d’achat.
  const qrValue = !completed
    ? `${originBase()}${paths.serviceScanner(purchase.serviceId, purchaseVerificationCode(purchase.reference))}`
    : undefined

  return {
    kind: completed ? 'receipt' : 'ticket',
    transactionNumber: purchase.reference,
    ...(completed
      ? {}
      : {
          ticketNumber: ticketNo,
          ...(qrValue ? { qrValue } : {}),
          ticketStatus: 'À valider à la remise',
        }),
    provider: {
      name: purchase.sellerName,
      handle: purchase.proRef,
      ...(avatarSrc ? { avatarSrc } : {}),
    },
    payer: {
      firstName: purchase.buyer.firstName,
      lastName: purchase.buyer.lastName,
      handle: purchase.buyer.userId,
    },
    beneficiaryHandle: purchase.proRef,
    nature: 'Achat',
    designation: purchase.lines
      .map((line) => `${line.name} × ${line.quantity}`)
      .join(', '),
    amount: purchase.total,
    at: purchase.createdAt,
    walletReference: purchase.walletPaymentId
      ? `WALLET-${purchase.walletPaymentId.slice(0, 8).toUpperCase()}`
      : purchase.reference,
    paymentStatus: 'Confirmé',
    backTo: paths.purchase(purchase.id),
  }
}
