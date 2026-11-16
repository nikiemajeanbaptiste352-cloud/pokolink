/**
 * Dettes crédit commerçant (démo localStorage).
 * Une dette = un couple client × boutique. Les remboursements ne créent pas de vente.
 */
import { createId } from '@/lib/ids'
import type {
  MerchantCreditMovement,
  MerchantDebt,
  MerchantDebtStatus,
} from '@/types/merchant-credit'

const STORAGE_KEY = 'africonnect.merchant-credits.v1'
const MAX_DEBTS = 80

type Listener = () => void

let debts: readonly MerchantDebt[] | null = null
const listeners = new Set<Listener>()

function statusOf(balance: number, principal: number): MerchantDebtStatus {
  if (balance <= 0) return 'settled'
  if (balance < principal) return 'partial'
  return 'open'
}

function isDebt(value: unknown): value is MerchantDebt {
  if (typeof value !== 'object' || value === null) return false
  const d = value as Partial<MerchantDebt>
  return (
    typeof d.id === 'string' &&
    typeof d.serviceId === 'string' &&
    typeof d.clientHandle === 'string' &&
    typeof d.balance === 'number' &&
    typeof d.principal === 'number' &&
    Array.isArray(d.movements)
  )
}

function load(): readonly MerchantDebt[] {
  if (debts) return debts
  let loaded: MerchantDebt[] = []
  try {
    const parsed: unknown = JSON.parse(
      window.localStorage.getItem(STORAGE_KEY) ?? 'null',
    )
    if (Array.isArray(parsed)) loaded = parsed.filter(isDebt)
  } catch {
    // ignore
  }
  debts = loaded
  return debts
}

function commit(next: readonly MerchantDebt[]) {
  debts = next
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  } catch {
    // quota
  }
  listeners.forEach((l) => l())
}

export function getMerchantDebts(): readonly MerchantDebt[] {
  return load()
}

export function subscribeMerchantDebts(listener: Listener): () => void {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

export function getOpenDebtForShop(
  clientHandle: string,
  serviceId: string,
): MerchantDebt | undefined {
  const handle = clientHandle.replace(/^@/, '').toLowerCase()
  return load().find(
    (d) =>
      d.serviceId === serviceId &&
      d.clientHandle.toLowerCase() === handle &&
      d.balance > 0,
  )
}

export function getDebtsForClient(clientHandle: string): MerchantDebt[] {
  const handle = clientHandle.replace(/^@/, '').toLowerCase()
  return load()
    .filter((d) => d.clientHandle.toLowerCase() === handle)
    .sort((a, b) => b.updatedAt - a.updatedAt)
}

export function getDebtsForService(serviceId: string): MerchantDebt[] {
  return load()
    .filter((d) => d.serviceId === serviceId)
    .sort((a, b) => b.balance - a.balance || b.updatedAt - a.updatedAt)
}

export function findMerchantDebt(id: string | undefined): MerchantDebt | undefined {
  if (!id) return undefined
  return load().find((d) => d.id === id)
}

export interface RecordMerchantSaleCreditInput {
  serviceId: string
  sellerName: string
  sellerLogo?: string
  proRef: string
  clientHandle: string
  clientName: string
  /** Montant reporté en crédit (dette créée / augmentée). */
  creditAmount: number
  reference: string
  purchaseId?: string
  ticketId?: string
}

/** Enregistre une nouvelle dette (ou augmente une existante) après confirmation. */
export function recordMerchantSaleCredit(
  input: RecordMerchantSaleCreditInput,
  now = Date.now(),
): MerchantDebt | undefined {
  const amount = Math.max(0, Math.floor(input.creditAmount))
  if (amount <= 0) return undefined

  const handle = input.clientHandle.replace(/^@/, '')
  const existing = getOpenDebtForShop(handle, input.serviceId)
  const movement: MerchantCreditMovement = {
    id: createId(),
    kind: 'sale',
    amount,
    reference: input.reference,
    ...(input.purchaseId ? { purchaseId: input.purchaseId } : {}),
    ...(input.ticketId ? { ticketId: input.ticketId } : {}),
    note: 'Achat à crédit',
    createdAt: now,
  }

  if (existing) {
    const principal = existing.principal + amount
    const balance = existing.balance + amount
    const next: MerchantDebt = {
      ...existing,
      sellerName: input.sellerName,
      ...(input.sellerLogo ? { sellerLogo: input.sellerLogo } : {}),
      proRef: input.proRef,
      clientName: input.clientName,
      principal,
      balance,
      status: statusOf(balance, principal),
      movements: [movement, ...existing.movements],
      updatedAt: now,
    }
    commit(load().map((d) => (d.id === existing.id ? next : d)))
    return next
  }

  const created: MerchantDebt = {
    id: createId(),
    serviceId: input.serviceId,
    sellerName: input.sellerName,
    ...(input.sellerLogo ? { sellerLogo: input.sellerLogo } : {}),
    proRef: input.proRef,
    clientHandle: handle,
    clientName: input.clientName,
    principal: amount,
    repaid: 0,
    balance: amount,
    status: 'open',
    movements: [movement],
    createdAt: now,
    updatedAt: now,
  }
  commit([created, ...load()].slice(0, MAX_DEBTS))
  return created
}

export interface RecordMerchantRepaymentInput {
  serviceId: string
  clientHandle: string
  amount: number
  reference: string
  ticketId?: string
  note?: string
}

/**
 * Rembourse une dette existante (même boutique uniquement).
 * Ne crée pas de vente / commission.
 */
export function recordMerchantRepayment(
  input: RecordMerchantRepaymentInput,
  now = Date.now(),
): MerchantDebt | undefined {
  const amount = Math.max(0, Math.floor(input.amount))
  if (amount <= 0) return undefined
  const debt = getOpenDebtForShop(input.clientHandle, input.serviceId)
  if (!debt || debt.balance <= 0) return undefined

  const applied = Math.min(amount, debt.balance)
  const movement: MerchantCreditMovement = {
    id: createId(),
    kind: 'repayment',
    amount: applied,
    reference: input.reference,
    ...(input.ticketId ? { ticketId: input.ticketId } : {}),
    note: input.note ?? 'Remboursement de dette',
    createdAt: now,
  }
  const repaid = debt.repaid + applied
  const balance = Math.max(0, debt.balance - applied)
  const next: MerchantDebt = {
    ...debt,
    repaid,
    balance,
    status: statusOf(balance, debt.principal),
    movements: [movement, ...debt.movements],
    updatedAt: now,
  }
  commit(load().map((d) => (d.id === debt.id ? next : d)))
  return next
}

export function clientCreditSummary(clientHandle: string): {
  totalBalance: number
  shopCount: number
} {
  const open = getDebtsForClient(clientHandle).filter((d) => d.balance > 0)
  return {
    totalBalance: open.reduce((s, d) => s + d.balance, 0),
    shopCount: open.length,
  }
}

export function serviceCreditSummary(serviceId: string): {
  totalBalance: number
  debtorCount: number
} {
  const open = getDebtsForService(serviceId).filter((d) => d.balance > 0)
  return {
    totalBalance: open.reduce((s, d) => s + d.balance, 0),
    debtorCount: open.length,
  }
}
