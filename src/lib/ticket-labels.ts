import { formatClock } from '@/lib/format'
import type { TicketStatus } from '@/types/ticket'

export interface TicketStatusMeta {
  /** Libellé court du statut. */
  label: string
  /** Mention affichée en tête du ticket. */
  headline: string
  /** Explication destinée au client. */
  message: string
  /** Le paiement est confirmé (tout statut sauf « annulé »). */
  confirmed: boolean
}

export const TICKET_STATUS: Record<TicketStatus, TicketStatusMeta> = {
  paid: {
    label: 'Payé',
    headline: 'Paiement confirmé',
    message:
      'Présentez ce ticket au prestataire : il scannera le QR code pour vérifier le paiement avant de remettre le produit ou de réaliser la prestation.',
    confirmed: true,
  },
  pending_validation: {
    label: 'En attente de validation',
    headline: 'Paiement confirmé',
    message:
      'Le paiement est confirmé. Le prestataire doit encore valider l’opération : conservez ce ticket.',
    confirmed: true,
  },
  validated: {
    label: 'Validé',
    headline: 'Paiement confirmé',
    message:
      'Le prestataire a validé la prestation ou la remise du produit. Ce ticket ne peut plus être utilisé une seconde fois.',
    confirmed: true,
  },
  cancelled: {
    label: 'Annulé',
    headline: 'Ticket annulé',
    message:
      'Ce ticket est annulé : il ne donne plus droit à la prestation. Les conditions de remboursement sont définies par le serveur.',
    confirmed: false,
  },
}

export const TICKET_STATUS_ORDER: readonly TicketStatus[] = [
  'paid',
  'pending_validation',
  'validated',
  'cancelled',
]

/** Numéro tel qu'il est affiché : « #AC-2026-008421 ». */
export function formatTicketNumber(number: string): string {
  return `#${number}`
}

const dateFormatter = new Intl.DateTimeFormat('fr-FR', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
})

/** « 12 novembre 2026 ». */
export function formatTicketDate(ms: number): string {
  return dateFormatter.format(new Date(ms))
}

/** « 14 h 32 ». */
export const formatTicketTime = formatClock
