import type { SubscriptionCard } from '@/types/subscription'
import type { PaymentTicket } from '@/types/ticket'

export type ScanLookup =
  | { kind: 'empty' }
  | { kind: 'not_found' }
  /** Le document existe mais appartient à un autre établissement : aucun détail n'est montré. */
  | { kind: 'other_service' }
  | { kind: 'ticket'; ticket: PaymentTicket }
  | { kind: 'card'; card: SubscriptionCard }

/** Majuscules, sans « # », espaces ni tirets : « #ab-2026-004217 » → « AB2026004217 ». */
export function cleanScanCode(text: string): string {
  return text.replace(/[#\s-]/g, '').toUpperCase()
}

/**
 * Accepte un numéro, un code de vérification ou l'adresse lue dans un QR code (ticket :
 * `?ticket=…`, carte / saisie : `?code=…` / `?carte=…`). Gère aussi une URL complète.
 */
export function extractScanCode(input: string): string {
  const trimmed = input.trim()
  const match = /[?&](?:ticket|code|carte)=([^&\s#]+)/i.exec(trimmed)
  if (match?.[1]) {
    try {
      return decodeURIComponent(match[1])
    } catch {
      return match[1]
    }
  }
  // Ancien format justificatif `AC:REF` → on garde la référence.
  if (/^AC:/i.test(trimmed)) return trimmed.slice(3)
  return trimmed
}

function matchesTicket(ticket: PaymentTicket, wanted: string): boolean {
  return (
    cleanScanCode(ticket.number) === wanted ||
    cleanScanCode(ticket.verificationCode) === wanted ||
    cleanScanCode(ticket.transactionRef) === wanted
  )
}

function matchesCard(card: SubscriptionCard, wanted: string): boolean {
  return (
    cleanScanCode(card.number) === wanted ||
    cleanScanCode(card.verificationCode) === wanted
  )
}

/**
 * Retrouve un ticket ou une carte d'abonnement à partir de ce que scanne ou saisit le
 * prestataire. Passer **tous** les tickets / cartes connus (pas seulement ceux de
 * l’établissement) : un document d'un autre établissement renvoie `other_service` sans
 * révéler ses détails.
 */
export function lookupScan(
  tickets: readonly PaymentTicket[],
  cards: readonly SubscriptionCard[],
  serviceId: string,
  input: string,
): ScanLookup {
  const wanted = cleanScanCode(extractScanCode(input))
  if (wanted === '') return { kind: 'empty' }

  const ticket = tickets.find((item) => matchesTicket(item, wanted))
  if (ticket) {
    return ticket.serviceId === serviceId
      ? { kind: 'ticket', ticket }
      : { kind: 'other_service' }
  }

  const card = cards.find((item) => matchesCard(item, wanted))
  if (card) {
    return card.serviceId === serviceId
      ? { kind: 'card', card }
      : { kind: 'other_service' }
  }

  return { kind: 'not_found' }
}
