import { cleanScanCode, extractScanCode } from '@/lib/scan-lookup'
import type { PaymentTicket } from '@/types/ticket'

export type TicketLookup =
  | { state: 'empty' }
  | { state: 'not_found' }
  /** Le ticket existe mais a été payé à un autre établissement : aucun détail n'est montré. */
  | { state: 'other_service' }
  | { state: 'found'; ticket: PaymentTicket }

/**
 * Retrouve un ticket à partir de ce que saisit ou scanne le prestataire. Passer **tous**
 * les tickets connus : un ticket d'un autre établissement n'est jamais révélé.
 */
export function findTicket(
  tickets: readonly PaymentTicket[],
  serviceId: string,
  input: string,
): TicketLookup {
  const wanted = cleanScanCode(extractScanCode(input))
  if (wanted === '') return { state: 'empty' }
  const ticket = tickets.find(
    (item) =>
      cleanScanCode(item.number) === wanted ||
      cleanScanCode(item.verificationCode) === wanted ||
      cleanScanCode(item.transactionRef) === wanted,
  )
  if (!ticket) return { state: 'not_found' }
  if (ticket.serviceId !== serviceId) return { state: 'other_service' }
  return { state: 'found', ticket }
}
