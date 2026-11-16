/**
 * STOCKAGE TEMPORAIRE des demandes de paiement interne envoyées depuis le Wallet : gardées
 * dans le localStorage de cet appareil pour pouvoir essayer le parcours complet (la demande
 * apparaît dans Wallet → En cours).
 *
 * À remplacer par l'API : le solde, le débit, le crédit du bénéficiaire, l'unicité de la
 * demande (clé d'idempotence) et le résultat sont décidés et appliqués par le SERVEUR. Ici,
 * aucun solde ni montant n'est jamais modifié.
 */
import { createId } from '@/lib/ids'
import type {
  WalletPaymentDomain,
  WalletPaymentPurpose,
  WalletPaymentRequest,
} from '@/types/wallet'

const STORAGE_KEY = 'africonnect.wallet-payments.v1'
/** Évite qu'un appareil d'essai garde une liste sans fin. */
const MAX_REQUESTS = 50

type Listener = () => void

let requests: readonly WalletPaymentRequest[] | null = null
const listeners = new Set<Listener>()

const PURPOSES: readonly WalletPaymentPurpose[] = [
  'position',
  'coins',
  'subscription',
  'advertising',
  'purchase',
  'event',
  'p2p_send',
  'p2p_request',
]

const DOMAINS: readonly WalletPaymentDomain[] = [
  'afrilearn',
  'pro',
  'market',
  'studio',
  'event',
  'p2p',
]

function isRequest(value: unknown): value is WalletPaymentRequest {
  if (typeof value !== 'object' || value === null) return false
  const item = value as Partial<WalletPaymentRequest>
  if (
    !(
      typeof item.id === 'string' &&
      typeof item.title === 'string' &&
      typeof item.amount === 'number' &&
      Number.isInteger(item.amount) &&
      item.amount > 0 &&
      typeof item.createdAt === 'number' &&
      item.purpose !== undefined &&
      PURPOSES.includes(item.purpose)
    )
  ) {
    return false
  }
  if (item.domain !== undefined && !DOMAINS.includes(item.domain)) return false
  return true
}

/** Demandes envoyées, de la plus récente à la plus ancienne. */
export function getWalletPayments(): readonly WalletPaymentRequest[] {
  if (requests) return requests
  let loaded: WalletPaymentRequest[] = []
  try {
    const parsed: unknown = JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? 'null')
    if (Array.isArray(parsed)) {
      loaded = parsed.filter(isRequest).map((item) => ({
        ...item,
        transferKind: item.transferKind ?? 'internal_wallet',
      }))
    }
  } catch {
    // Données illisibles : aucune demande enregistrée.
  }
  requests = loaded
  return requests
}

export function subscribeWalletPayments(listener: Listener): () => void {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

export type NewPayment = {
  purpose: WalletPaymentPurpose
  domain?: WalletPaymentDomain
  title: string
  detail?: string
  recipient?: string
  amount: number
  payerName?: string
  payerHandle?: string
  payerAddress?: string
  payerPhone?: string
  beneficiaryHandle?: string
  beneficiaryName?: string
  beneficiaryServiceId?: string
  beneficiaryBusiness?: string
  quantity?: number
  unitPrice?: number
}

/**
 * Enregistre une demande « en attente » avec l’identification acheteur + vendeur
 * pour le transfert interne (débit / crédit Wallet côté serveur).
 */
export function addWalletPayment(payment: NewPayment, now: number): WalletPaymentRequest {
  const id = createId()
  const year = new Date(now).getFullYear()
  const digits = Array.from(
    crypto.getRandomValues(new Uint8Array(6)),
    (byte) => byte % 10,
  ).join('')
  const request: WalletPaymentRequest = {
    id,
    purpose: payment.purpose,
    title: payment.title,
    amount: payment.amount,
    createdAt: now,
    transferKind: 'internal_wallet',
    provisionalReference: `TRX-${year}-${digits}`,
    ...(payment.domain ? { domain: payment.domain } : {}),
    ...(payment.detail ? { detail: payment.detail } : {}),
    ...(payment.recipient ? { recipient: payment.recipient } : {}),
    ...(payment.payerName ? { payerName: payment.payerName } : {}),
    ...(payment.payerHandle ? { payerHandle: payment.payerHandle } : {}),
    ...(payment.payerAddress ? { payerAddress: payment.payerAddress } : {}),
    ...(payment.payerPhone ? { payerPhone: payment.payerPhone } : {}),
    ...(payment.beneficiaryHandle
      ? { beneficiaryHandle: payment.beneficiaryHandle }
      : {}),
    ...(payment.beneficiaryName ? { beneficiaryName: payment.beneficiaryName } : {}),
    ...(payment.beneficiaryServiceId
      ? { beneficiaryServiceId: payment.beneficiaryServiceId }
      : {}),
    ...(payment.beneficiaryBusiness
      ? { beneficiaryBusiness: payment.beneficiaryBusiness }
      : {}),
    ...(payment.quantity !== undefined ? { quantity: payment.quantity } : {}),
    ...(payment.unitPrice !== undefined ? { unitPrice: payment.unitPrice } : {}),
  }
  requests = [request, ...getWalletPayments()].slice(0, MAX_REQUESTS)
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(requests))
  } catch {
    // Quota dépassé : la demande reste en mémoire.
  }
  listeners.forEach((listener) => listener())
  return request
}
