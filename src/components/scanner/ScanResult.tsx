import { CircleCheck, CircleX } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { formatPrice } from '@/lib/format'
import { formatDateTime } from '@/lib/pro-labels'
import type { ScanLookup } from '@/lib/scan-lookup'
import { PAYMENT_METHODS } from '@/lib/service-types'
import {
  formatCardNumber,
  formatValidity,
  getCardStatus,
  SUBSCRIPTION_STATUS,
} from '@/lib/subscription-labels'
import { formatTicketNumber, TICKET_STATUS } from '@/lib/ticket-labels'
import { cn } from '@/lib/utils'
import { PLAN_DURATION_LABEL } from '@/lib/pro-labels'

interface Verdict {
  valid: boolean
  /** Une phrase qui dit pourquoi, et quoi faire. */
  reason: string
  /** Document contrôlé (numéro), s'il a été retrouvé. */
  subject?: string
  rows: readonly [string, string][]
}

/** Lit un résultat de recherche comme un verdict « valide » ou « non valide ». */
function getVerdict(
  lookup: Exclude<ScanLookup, { kind: 'empty' }>,
  now: number,
): Verdict {
  switch (lookup.kind) {
    case 'not_found':
      return {
        valid: false,
        reason: 'Aucun ticket ni aucune carte ne correspond à ce code. Ne remettez rien.',
        rows: [],
      }
    case 'other_service':
      return {
        valid: false,
        reason:
          'Ce document n’a pas été payé auprès de votre établissement. Ne remettez rien.',
        rows: [],
      }
    case 'ticket': {
      const { ticket } = lookup
      const valid = ticket.status === 'paid' || ticket.status === 'pending_validation'
      const method =
        PAYMENT_METHODS.find((item) => item.id === ticket.method)?.label ?? ticket.method
      return {
        valid,
        reason: valid
          ? 'Paiement confirmé : le ticket est authentique et n’a pas encore servi.'
          : ticket.status === 'validated'
            ? 'Ce ticket a déjà été utilisé : ne remettez rien.'
            : 'Ce ticket est annulé : ne remettez rien.',
        subject: `Ticket ${formatTicketNumber(ticket.number)}`,
        rows: [
          ['Client', ticket.clientName],
          ['Prestation', ticket.itemLabel],
          ['Montant', formatPrice(ticket.amount)],
          ['Payé le', formatDateTime(ticket.paidAt)],
          ['Paiement', method],
          ['Statut', TICKET_STATUS[ticket.status].label],
          ...(ticket.validatedAt
            ? ([['Utilisé le', formatDateTime(ticket.validatedAt)]] as [string, string][])
            : []),
        ],
      }
    }
    case 'card': {
      const { card } = lookup
      const status = getCardStatus(card, now)
      const meta = SUBSCRIPTION_STATUS[status]
      return {
        valid: meta.valid,
        reason:
          status === 'active'
            ? 'Abonnement en cours de validité : accordez les avantages du forfait.'
            : status === 'pending_payment'
              ? 'Le paiement de cette carte n’est pas confirmé : elle n’est pas encore valable.'
              : status === 'expired'
                ? 'Cet abonnement est expiré : la carte n’est plus valable.'
                : 'Cette carte est annulée : elle n’est plus valable.',
        subject: `Carte ${formatCardNumber(card.number)}`,
        rows: [
          ['Titulaire', card.holderName],
          ['Forfait', card.planName],
          ['Durée', PLAN_DURATION_LABEL[card.planDuration]],
          ['Validité', formatValidity(card)],
          ['Statut', meta.label],
        ],
      }
    }
  }
}

/**
 * Résultat d'un scan : un grand verdict VALIDE ou NON VALIDE, la raison, puis le détail du
 * document. Un ticket valable peut être validé une fois (« Valider la prestation »).
 * Le verdict est calculé ici d'après les données connues du frontend ; en réel, c'est le
 * serveur qui répond à la vérification.
 */
export function ScanResult({
  lookup,
  now,
  onValidateTicket,
}: {
  lookup: Exclude<ScanLookup, { kind: 'empty' }>
  now: number
  onValidateTicket: () => void
}) {
  const verdict = getVerdict(lookup, now)
  const Icon = verdict.valid ? CircleCheck : CircleX

  return (
    <article
      aria-label="Résultat du scan"
      className={cn(
        'space-y-3 rounded-2xl border-2 bg-card p-4 shadow-card',
        verdict.valid ? 'border-brand' : 'border-destructive',
      )}
    >
      <div
        role={verdict.valid ? 'status' : 'alert'}
        className={cn(
          'flex items-center gap-3 rounded-xl p-3',
          verdict.valid
            ? 'bg-brand text-brand-foreground'
            : 'bg-destructive text-destructive-foreground',
        )}
      >
        <Icon className="size-10 shrink-0" aria-hidden="true" />
        <div className="min-w-0">
          <p className="text-headline leading-none font-extrabold">
            {verdict.valid ? 'VALIDE' : 'NON VALIDE'}
          </p>
          {verdict.subject ? (
            <p className="mt-1 truncate text-caption font-semibold">{verdict.subject}</p>
          ) : null}
        </div>
      </div>

      <p className="text-body font-semibold">{verdict.reason}</p>

      {verdict.rows.length > 0 ? (
        <dl className="divide-y">
          {verdict.rows.map(([label, value]) => (
            <div key={label} className="flex items-baseline justify-between gap-3 py-1.5">
              <dt className="text-body text-muted-foreground">{label}</dt>
              <dd className="min-w-0 text-right text-body font-semibold break-words">
                {value}
              </dd>
            </div>
          ))}
        </dl>
      ) : null}

      {lookup.kind === 'ticket' && verdict.valid ? (
        <>
          <Button type="button" size="lg" className="w-full" onClick={onValidateTicket}>
            Valider la prestation
          </Button>
          <p className="text-caption text-muted-foreground">
            Validez seulement après avoir remis le produit ou réalisé la prestation : un
            ticket ne peut servir qu’une seule fois.
          </p>
        </>
      ) : null}
    </article>
  )
}
