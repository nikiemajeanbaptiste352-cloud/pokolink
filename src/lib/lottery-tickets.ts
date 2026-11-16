import { formatTicketNumber } from '@/lib/ticket-labels'
import { lotteryValueBreakdown } from '@/lib/lottery-rules'
import type { EventLottery, LotteryDrawTicket, MarketEvent } from '@/types/event'

/** Préfixe des tickets de loterie marketing. */
export const LOTTERY_TICKET_PREFIX = 'LT'

/** Affiche « #LT-2026-004821 ». */
export function formatLotteryTicketNumber(number: string): string {
  return formatTicketNumber(number)
}

/** Construit un numéro de ticket loterie stable (démo / affichage). */
export function buildLotteryTicketNumber(
  eventId: string,
  sequence: number,
  year = new Date().getFullYear(),
): string {
  const seed = Array.from(eventId).reduce((sum, ch) => sum + ch.charCodeAt(0), 0)
  const digits = String((seed * 7919 + sequence * 97) % 1_000_000).padStart(6, '0')
  return `${LOTTERY_TICKET_PREFIX}-${year}-${digits}`
}

/**
 * Échantillon de tickets pour l’UI (carte marketing / fin de session).
 * Le serveur fournit la liste réelle ; ici on illustre le parcours.
 */
export function sampleLotteryDrawTickets(
  event: MarketEvent,
  limit = 8,
): readonly LotteryDrawTicket[] {
  const lottery = event.lottery
  if (!lottery) return []
  if (lottery.drawTickets && lottery.drawTickets.length > 0) {
    return lottery.drawTickets
  }

  const rules = lotteryValueBreakdown(lottery)
  const count = Math.min(
    limit,
    Math.max(0, event.participants) * rules.entriesPerPerson,
    rules.eligiblePeople * rules.entriesPerPerson,
  )
  if (count <= 0) return []

  const holders = [
    'Awa K.',
    'Ibrahim S.',
    'Fatou B.',
    'Moussa D.',
    'Mariam T.',
    'Serge O.',
    'Grace N.',
    'Paul Y.',
  ]
  const winning = new Set(lottery.winningTicketNumbers ?? [])
  const tickets: LotteryDrawTicket[] = []
  for (let i = 0; i < count; i += 1) {
    const number = buildLotteryTicketNumber(event.id, i + 1)
    tickets.push({
      number,
      holderLabel: holders[i % holders.length]!,
      winner: winning.has(number) || undefined,
    })
  }
  return tickets
}

/** Tickets gagnants à afficher en fin de session. */
export function lotteryWinningTickets(
  lottery: EventLottery,
  pool: readonly LotteryDrawTicket[],
): readonly LotteryDrawTicket[] {
  if (lottery.winningTicketNumbers?.length) {
    const set = new Set(lottery.winningTicketNumbers)
    const matched = pool.filter((t) => set.has(t.number))
    if (matched.length > 0) return matched
  }
  return pool.filter((t) => t.winner)
}

/** Total de tickets (= chances) attendus si toutes les places sont prises. */
export function lotteryTotalTicketSlots(lottery: EventLottery): number {
  const rules = lotteryValueBreakdown(lottery)
  return rules.eligiblePeople * rules.entriesPerPerson
}
