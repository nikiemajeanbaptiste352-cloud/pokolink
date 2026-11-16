/**
 * STOCKAGE TEMPORAIRE des validations de tickets faites par un prestataire : gardées dans le
 * localStorage de cet appareil pour pouvoir essayer le parcours complet (le client voit son
 * ticket passer à « Validé », un ticket déjà validé est refusé la seconde fois).
 *
 * À remplacer par l'API : la validation, son unicité (une seule utilisation par ticket) et
 * les droits du prestataire sont décidés et appliqués par le SERVEUR. Seul le statut de
 * l'opération est concerné ici : aucun solde ni montant n'est jamais modifié.
 */
import type { PaymentTicket, TicketStatus } from '@/types/ticket'

const STORAGE_KEY = 'africonnect.tickets.v1'

type Listener = () => void

interface TicketOverride {
  status: TicketStatus
  validatedAt?: number
}

export type TicketOverrides = Readonly<Record<string, TicketOverride>>

let overrides: TicketOverrides | null = null
const listeners = new Set<Listener>()

const STATUSES: readonly TicketStatus[] = [
  'paid',
  'pending_validation',
  'validated',
  'cancelled',
]

export function getTicketOverrides(): TicketOverrides {
  if (overrides) return overrides
  const loaded: Record<string, TicketOverride> = {}
  try {
    const parsed: unknown = JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? 'null')
    if (typeof parsed === 'object' && parsed !== null) {
      for (const [id, value] of Object.entries(parsed)) {
        const entry = value as Partial<TicketOverride> | null
        if (entry && entry.status && STATUSES.includes(entry.status)) {
          loaded[id] =
            typeof entry.validatedAt === 'number'
              ? { status: entry.status, validatedAt: entry.validatedAt }
              : { status: entry.status }
        }
      }
    }
  } catch {
    // Données illisibles : aucune validation enregistrée.
  }
  overrides = loaded
  return overrides
}

export function subscribeTickets(listener: Listener): () => void {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

/** Ticket tel qu'il est maintenant, avec la validation enregistrée s'il y en a une. */
export function applyOverride(
  ticket: PaymentTicket,
  all: TicketOverrides,
): PaymentTicket {
  const override = all[ticket.id]
  if (!override) return ticket
  const next: PaymentTicket = { ...ticket, status: override.status }
  if (override.validatedAt !== undefined) next.validatedAt = override.validatedAt
  return next
}

export type ValidationResult =
  | { ok: true; validatedAt: number }
  | { ok: false; reason: 'already_validated' | 'cancelled' }

/**
 * Valide un ticket. Refusé s'il est déjà validé ou annulé : c'est la protection contre la
 * double utilisation (le serveur la fera de la même façon, de manière atomique).
 */
export function validateTicket(ticket: PaymentTicket, now: number): ValidationResult {
  const current = applyOverride(ticket, getTicketOverrides())
  if (current.status === 'validated') return { ok: false, reason: 'already_validated' }
  if (current.status === 'cancelled') return { ok: false, reason: 'cancelled' }

  overrides = {
    ...getTicketOverrides(),
    [ticket.id]: { status: 'validated', validatedAt: now },
  }
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(overrides))
  } catch {
    // Quota dépassé : l'état reste en mémoire.
  }
  listeners.forEach((listener) => listener())
  return { ok: true, validatedAt: now }
}
