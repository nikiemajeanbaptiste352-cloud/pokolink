/**
 * Tickets de loterie marketing émis localement après participation (démo).
 * Chaque participation crée `entriesPerPerson` numéros inscrits au tirage.
 */
import { createId } from '@/lib/ids'
import { buildLotteryTicketNumber } from '@/lib/lottery-tickets'
import { resolveLotteryRules } from '@/lib/lottery-rules'
import type { EventLottery } from '@/types/event'

export interface MyLotteryTicket {
  id: string
  eventId: string
  /** Numéro inscrit au tirage (carte loterie). */
  number: string
  prizeName: string
  issuedAt: number
  /** Lien vers le ticket de paiement Wallet, s’il existe. */
  paymentTicketId?: string
}

const STORAGE_KEY = 'africonnect.lottery-tickets.v1'
const MAX = 80

type Listener = () => void

let cache: readonly MyLotteryTicket[] | null = null
const listeners = new Set<Listener>()

function isTicket(value: unknown): value is MyLotteryTicket {
  if (typeof value !== 'object' || value === null) return false
  const item = value as Partial<MyLotteryTicket>
  return (
    typeof item.id === 'string' &&
    typeof item.eventId === 'string' &&
    typeof item.number === 'string' &&
    typeof item.prizeName === 'string' &&
    typeof item.issuedAt === 'number'
  )
}

export function getMyLotteryTickets(): readonly MyLotteryTicket[] {
  if (cache) return cache
  let loaded: MyLotteryTicket[] = []
  try {
    const parsed: unknown = JSON.parse(
      window.localStorage.getItem(STORAGE_KEY) ?? 'null',
    )
    if (Array.isArray(parsed)) loaded = parsed.filter(isTicket)
  } catch {
    // ignore
  }
  cache = loaded
  return cache
}

export function subscribeMyLotteryTickets(listener: Listener): () => void {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

export function getMyLotteryTicketsForEvent(
  eventId: string,
): readonly MyLotteryTicket[] {
  return getMyLotteryTickets().filter((t) => t.eventId === eventId)
}

/**
 * Émet les numéros de tickets loterie pour une participation.
 * `entriesPerPerson` tickets = chances inscrites au tirage.
 */
export function issueLotteryTickets(input: {
  eventId: string
  lottery: EventLottery
  paymentTicketId?: string
  now: number
}): readonly MyLotteryTicket[] {
  const rules = resolveLotteryRules(input.lottery)
  const existing = getMyLotteryTickets()
  const already = existing.filter((t) => t.eventId === input.eventId).length
  const issued: MyLotteryTicket[] = []

  for (let i = 0; i < rules.entriesPerPerson; i += 1) {
    const sequence = already + i + 1 + existing.length * 3
    issued.push({
      id: createId(),
      eventId: input.eventId,
      number: buildLotteryTicketNumber(input.eventId, sequence, new Date(input.now).getFullYear()),
      prizeName: rules.prizeName,
      issuedAt: input.now,
      ...(input.paymentTicketId
        ? { paymentTicketId: input.paymentTicketId }
        : {}),
    })
  }

  cache = [...issued, ...existing].slice(0, MAX)
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(cache))
  } catch {
    // mémoire seule
  }
  listeners.forEach((l) => l())
  return issued
}
