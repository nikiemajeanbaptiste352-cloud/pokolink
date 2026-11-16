import { CircleAlert, CircleCheck, CircleX, ScanLine } from 'lucide-react'
import { useState, type FormEvent } from 'react'

import { Field } from '@/components/form/Field'
import { FlashMessage } from '@/components/pro/shared'
import { TicketStatusPill } from '@/components/tickets/TicketStatusPill'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useFlash } from '@/hooks/use-flash'
import { PAYMENT_METHODS } from '@/lib/service-types'
import { formatPrice } from '@/lib/format'
import { formatDateTime } from '@/lib/pro-labels'
import { findTicket } from '@/lib/ticket-lookup'
import { formatTicketNumber, TICKET_STATUS } from '@/lib/ticket-labels'
import { validateTicket } from '@/lib/tickets-store'
import { cn } from '@/lib/utils'
import type { PaymentTicket } from '@/types/ticket'

interface TicketVerifierProps {
  serviceId: string
  /** Tickets déjà connus (avec les validations enregistrées). */
  tickets: readonly PaymentTicket[]
  /**
   * Code affiché au départ (lu dans le QR code ou choisi dans la liste). Pour en proposer un
   * autre, le parent change la key du composant.
   */
  initial: string
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-3 py-1.5">
      <dt className="text-body text-muted-foreground">{label}</dt>
      <dd className="min-w-0 text-right text-body font-semibold break-words">{value}</dd>
    </div>
  )
}

/**
 * Vérification d'un ticket par le prestataire : retrouver le ticket (numéro ou code du QR),
 * contrôler le paiement, le client et la prestation, puis valider une seule fois.
 * La validation et son unicité sont décidées par le serveur ; ici, un stockage temporaire
 * permet d'essayer le parcours (voir `tickets-store.ts`).
 */
export function TicketVerifier({ serviceId, tickets, initial }: TicketVerifierProps) {
  const [input, setInput] = useState(initial)
  const [submitted, setSubmitted] = useState(initial)
  const { message, flash } = useFlash()

  const lookup = findTicket(tickets, serviceId, submitted)

  function submit(event: FormEvent) {
    event.preventDefault()
    setSubmitted(input)
  }

  function validate(ticket: PaymentTicket) {
    const result = validateTicket(ticket, Date.now())
    flash(
      result.ok
        ? 'Prestation validée : ce ticket ne peut plus être utilisé.'
        : result.reason === 'already_validated'
          ? 'Refusé : ce ticket a déjà été validé.'
          : 'Refusé : ce ticket est annulé.',
    )
  }

  return (
    <section aria-labelledby="verify-title" className="space-y-3">
      <div className="px-4">
        <h2 id="verify-title" className="text-title font-bold">
          Vérifier un ticket
        </h2>
        <p className="text-body text-muted-foreground">
          Scannez le QR code du client avec l’appareil photo, ou saisissez le numéro du
          ticket.
        </p>
      </div>

      <form noValidate onSubmit={submit} className="space-y-3 px-4">
        <Field id="ticket-code" label="Numéro ou code du ticket">
          {(control) => (
            <Input
              {...control}
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder="Ex. AC-2026-008421"
              autoComplete="off"
              autoCapitalize="characters"
              spellCheck={false}
            />
          )}
        </Field>
        <Button type="submit" size="lg" className="w-full">
          <ScanLine aria-hidden="true" />
          Vérifier
        </Button>
      </form>

      <FlashMessage message={message} />

      <div aria-live="polite" className="px-4">
        {lookup.state === 'not_found' ? (
          <p
            role="alert"
            className="flex items-start gap-2 rounded-xl bg-destructive/10 p-3.5 text-body"
          >
            <CircleX
              className="mt-0.5 size-5 shrink-0 text-destructive"
              aria-hidden="true"
            />
            Aucun ticket ne correspond à cette saisie. Vérifiez le numéro avec le client.
          </p>
        ) : null}
        {lookup.state === 'other_service' ? (
          <p
            role="alert"
            className="flex items-start gap-2 rounded-xl bg-destructive/10 p-3.5 text-body"
          >
            <CircleX
              className="mt-0.5 size-5 shrink-0 text-destructive"
              aria-hidden="true"
            />
            Ce ticket n’a pas été payé auprès de votre établissement : ne remettez rien.
          </p>
        ) : null}
        {lookup.state === 'found' ? (
          <TicketResult
            ticket={lookup.ticket}
            onValidate={() => validate(lookup.ticket)}
          />
        ) : null}
      </div>
    </section>
  )
}

function TicketResult({
  ticket,
  onValidate,
}: {
  ticket: PaymentTicket
  onValidate: () => void
}) {
  const meta = TICKET_STATUS[ticket.status]
  const method =
    PAYMENT_METHODS.find((m) => m.id === ticket.method)?.label ?? ticket.method
  const canValidate = ticket.status === 'paid' || ticket.status === 'pending_validation'
  const Icon = canValidate
    ? CircleCheck
    : ticket.status === 'validated'
      ? CircleAlert
      : CircleX

  return (
    <article
      aria-label={`Ticket ${formatTicketNumber(ticket.number)}`}
      className="space-y-3 rounded-2xl border bg-card p-4 shadow-card"
    >
      <div
        className={cn(
          'flex items-start gap-3 rounded-xl p-3',
          canValidate && 'bg-success/15',
          ticket.status === 'validated' && 'bg-warning/20',
          ticket.status === 'cancelled' && 'bg-destructive/10',
        )}
      >
        <Icon
          className={cn(
            'mt-0.5 size-6 shrink-0',
            canValidate && 'text-brand',
            ticket.status === 'cancelled' && 'text-destructive',
          )}
          aria-hidden="true"
        />
        <div className="space-y-1">
          <p className="text-body font-extrabold">
            {canValidate
              ? 'Paiement confirmé : ticket authentique'
              : ticket.status === 'validated'
                ? 'Ticket déjà validé : ne remettez rien'
                : 'Ticket annulé : ne remettez rien'}
          </p>
          <TicketStatusPill status={ticket.status} className="bg-background" />
        </div>
      </div>

      <dl className="divide-y">
        <Row label="Numéro" value={formatTicketNumber(ticket.number)} />
        <Row label="Client" value={ticket.clientName} />
        <Row label="Prestation" value={ticket.itemLabel} />
        <Row label="Montant" value={formatPrice(ticket.amount)} />
        <Row label="Date" value={formatDateTime(ticket.paidAt)} />
        <Row label="Paiement" value={method} />
        <Row label="Référence" value={ticket.transactionRef} />
        {ticket.validatedAt ? (
          <Row label="Validé le" value={formatDateTime(ticket.validatedAt)} />
        ) : null}
      </dl>

      {canValidate ? (
        <Button type="button" size="lg" className="w-full" onClick={onValidate}>
          Valider la prestation
        </Button>
      ) : null}
      <p className="text-caption text-muted-foreground">
        {canValidate
          ? 'Validez uniquement après avoir remis le produit ou réalisé la prestation : un ticket ne peut être validé qu’une seule fois.'
          : meta.message}
      </p>
    </article>
  )
}
