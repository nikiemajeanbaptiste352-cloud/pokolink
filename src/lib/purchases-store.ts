/**
 * STOCKAGE TEMPORAIRE des achats demandés depuis cet appareil : gardés dans le localStorage
 * pour pouvoir essayer le parcours complet (panier, formulaire, paiement Wallet, suivi).
 *
 * À remplacer par l'API : la référence, la confirmation du paiement, le transfert vers le
 * vendeur et chaque changement de statut sont décidés par le SERVEUR. Un achat créé ici est
 * toujours « en attente de paiement » : le frontend ne le marque jamais payé et ne touche à
 * aucun solde.
 */
import { createId } from '@/lib/ids'
import type { Purchase, PurchaseStatus } from '@/types/purchase'

const STORAGE_KEY = 'africonnect.purchases.v1'
const MAX_PURCHASES = 50

type Listener = () => void

let purchases: readonly Purchase[] | null = null
const listeners = new Set<Listener>()

const STATUSES: readonly PurchaseStatus[] = [
  'pending_payment',
  'paid',
  'preparing',
  'ready',
  'completed',
  'cancelled',
]

function isPurchase(value: unknown): value is Purchase {
  if (typeof value !== 'object' || value === null) return false
  const item = value as Partial<Purchase>
  return (
    typeof item.id === 'string' &&
    typeof item.reference === 'string' &&
    typeof item.serviceId === 'string' &&
    typeof item.proRef === 'string' &&
    typeof item.sellerName === 'string' &&
    typeof item.total === 'number' &&
    typeof item.createdAt === 'number' &&
    Array.isArray(item.lines) &&
    typeof item.buyer === 'object' &&
    item.buyer !== null &&
    item.status !== undefined &&
    STATUSES.includes(item.status)
  )
}

/** Achats demandés sur cet appareil, du plus récent au plus ancien. */
export function getStoredPurchases(): readonly Purchase[] {
  if (purchases) return purchases
  let loaded: Purchase[] = []
  try {
    const parsed: unknown = JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? 'null')
    if (Array.isArray(parsed)) loaded = parsed.filter(isPurchase)
  } catch {
    // Données illisibles : aucun achat enregistré.
  }
  purchases = loaded
  return purchases
}

export function subscribePurchases(listener: Listener): () => void {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

export type NewPurchase = Pick<
  Purchase,
  'serviceId' | 'proRef' | 'sellerName' | 'lines' | 'total' | 'buyer' | 'note'
> & {
  walletPaymentId?: string
  sellerLogo?: string
  paidAmount?: number
  creditAmount?: number
  remainingDue?: number
}

/** Enregistre un achat « en attente de paiement ». La référence est provisoire. */
export function addPurchase(purchase: NewPurchase, now: number): Purchase {
  const digits = Array.from(
    crypto.getRandomValues(new Uint8Array(6)),
    (byte) => byte % 10,
  ).join('')
  const created: Purchase = {
    serviceId: purchase.serviceId,
    proRef: purchase.proRef,
    sellerName: purchase.sellerName,
    lines: purchase.lines,
    total: purchase.total,
    buyer: purchase.buyer,
    note: purchase.note,
    ...(purchase.walletPaymentId ? { walletPaymentId: purchase.walletPaymentId } : {}),
    ...(purchase.sellerLogo ? { sellerLogo: purchase.sellerLogo } : {}),
    ...(purchase.paidAmount !== undefined ? { paidAmount: purchase.paidAmount } : {}),
    ...(purchase.creditAmount !== undefined
      ? { creditAmount: purchase.creditAmount }
      : {}),
    ...(purchase.remainingDue !== undefined
      ? { remainingDue: purchase.remainingDue }
      : {}),
    id: createId(),
    reference: `ACH-${new Date(now).getFullYear()}-${digits}`,
    status:
      purchase.creditAmount && purchase.creditAmount > 0
        ? 'pending_payment'
        : purchase.paidAmount !== undefined &&
            purchase.paidAmount >= purchase.total
          ? 'paid'
          : 'pending_payment',
    createdAt: now,
    local: true,
  }
  purchases = [created, ...getStoredPurchases()].slice(0, MAX_PURCHASES)
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(purchases))
  } catch {
    // Quota dépassé : l'achat reste en mémoire.
  }
  listeners.forEach((listener) => listener())
  return created
}
