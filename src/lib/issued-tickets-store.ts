/**
 * STOCKAGE TEMPORAIRE des tickets émis après confirmation PIN du formulaire de paiement.
 * Sert à démontrer le parcours « paiement confirmé → ticket avec logo de l'espace pro ».
 *
 * À remplacer par l'API : seul le serveur crée le ticket définitif après débit réussi.
 * Ici, aucun solde n'est modifié.
 */
import { createId } from '@/lib/ids'
import type { PaymentTicket } from '@/types/ticket'

const STORAGE_KEY = 'africonnect.issued-tickets.v1'
const MAX_TICKETS = 50

type Listener = () => void

let tickets: readonly PaymentTicket[] | null = null
const listeners = new Set<Listener>()

function isTicket(value: unknown): value is PaymentTicket {
  if (typeof value !== 'object' || value === null) return false
  const item = value as Partial<PaymentTicket>
  return (
    typeof item.id === 'string' &&
    typeof item.number === 'string' &&
    typeof item.serviceId === 'string' &&
    typeof item.proRef === 'string' &&
    typeof item.clientName === 'string' &&
    typeof item.itemLabel === 'string' &&
    typeof item.amount === 'number' &&
    typeof item.paidAt === 'number' &&
    typeof item.transactionRef === 'string' &&
    typeof item.verificationCode === 'string' &&
    item.mine === true &&
    item.method === 'wallet'
  )
}

export function getIssuedTickets(): readonly PaymentTicket[] {
  if (tickets) return tickets
  let loaded: PaymentTicket[] = []
  try {
    const parsed: unknown = JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? 'null')
    if (Array.isArray(parsed)) loaded = parsed.filter(isTicket)
  } catch {
    // Données illisibles.
  }
  tickets = loaded
  return tickets
}

export function subscribeIssuedTickets(listener: Listener): () => void {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

export function findIssuedTicket(id: string | undefined): PaymentTicket | undefined {
  if (!id) return undefined
  return getIssuedTickets().find((ticket) => ticket.id === id)
}

export type NewIssuedTicket = {
  serviceId: string
  proRef: string
  providerName: string
  providerLogo?: string
  clientName: string
  clientPhone?: string
  itemLabel: string
  itemReference?: string
  quantity?: number
  itemImageSrc?: string
  amount: number
  originalAmount?: number
  rewardsPointsUsed?: number
  rewardsDiscountFcfa?: number
  creditAmount?: number
  remainingDue?: number
  paymentStatusLabel?: string
  transactionRef: string
}

/** Émet un ticket local immédiatement après la confirmation PIN (démonstration). */
export function issuePaymentTicket(input: NewIssuedTicket, now: number): PaymentTicket {
  const year = new Date(now).getFullYear()
  const digits = Array.from(
    crypto.getRandomValues(new Uint8Array(6)),
    (byte) => byte % 10,
  ).join('')
  const txDigits = Array.from(
    crypto.getRandomValues(new Uint8Array(9)),
    (byte) => byte % 10,
  ).join('')
  const code = Array.from(crypto.getRandomValues(new Uint8Array(4)), (byte) =>
    (byte % 36).toString(36).toUpperCase(),
  ).join('')
  const ticket: PaymentTicket = {
    id: createId(),
    number: `AF-${year}-${digits}`,
    serviceId: input.serviceId,
    proRef: input.proRef,
    providerName: input.providerName,
    ...(input.providerLogo ? { providerLogo: input.providerLogo } : {}),
    clientName: input.clientName,
    ...(input.clientPhone ? { clientPhone: input.clientPhone } : {}),
    mine: true,
    itemLabel: input.itemLabel,
    ...(input.itemReference ? { itemReference: input.itemReference } : {}),
    ...(input.quantity !== undefined ? { quantity: input.quantity } : {}),
    ...(input.itemImageSrc ? { itemImageSrc: input.itemImageSrc } : {}),
    amount: input.amount,
    ...(input.originalAmount !== undefined
      ? { originalAmount: input.originalAmount }
      : {}),
    ...(input.rewardsPointsUsed
      ? { rewardsPointsUsed: input.rewardsPointsUsed }
      : {}),
    ...(input.rewardsDiscountFcfa
      ? { rewardsDiscountFcfa: input.rewardsDiscountFcfa }
      : {}),
    ...(input.creditAmount !== undefined && input.creditAmount > 0
      ? { creditAmount: input.creditAmount }
      : {}),
    ...(input.remainingDue !== undefined && input.remainingDue > 0
      ? { remainingDue: input.remainingDue }
      : {}),
    ...(input.paymentStatusLabel
      ? { paymentStatusLabel: input.paymentStatusLabel }
      : {}),
    paidAt: now,
    method: 'wallet',
    transactionRef: input.transactionRef.startsWith('AC-')
      ? input.transactionRef
      : `AC-${txDigits}`,
    status: 'pending_validation',
    verificationCode: `VK-${code}-${digits.slice(0, 4)}`,
    local: true,
  }
  tickets = [ticket, ...getIssuedTickets()].slice(0, MAX_TICKETS)
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(tickets))
  } catch {
    // Quota dépassé : le ticket reste en mémoire.
  }
  listeners.forEach((listener) => listener())
  return ticket
}
