import { ScanLine } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { useSearchParams } from 'react-router-dom'

import { Field } from '@/components/form/Field'
import { FlashMessage, StatusPill } from '@/components/pro/shared'
import { RubriquePage } from '@/components/services/RubriquePage'
import { QrScanner } from '@/components/scanner/QrScanner'
import { ScanResult } from '@/components/scanner/ScanResult'
import { TicketStatusPill } from '@/components/tickets/TicketStatusPill'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useCurrentService } from '@/hooks/use-current-service'
import { useFlash } from '@/hooks/use-flash'
import { useNow } from '@/hooks/use-now'
import {
  useServiceSubscriptionCards,
  useSubscriptionCards,
} from '@/hooks/use-subscription-cards'
import { useServiceTickets, useTickets } from '@/hooks/use-tickets'
import { extractScanCode, lookupScan } from '@/lib/scan-lookup'
import {
  formatCardNumber,
  getCardStatus,
  SUBSCRIPTION_STATUS,
} from '@/lib/subscription-labels'
import { formatTicketNumber } from '@/lib/ticket-labels'
import { validateTicket } from '@/lib/tickets-store'

/**
 * Scanner de l'Espace Pro : le prestataire scanne (caméra) ou saisit le code d'un ticket de
 * paiement ou d'une carte d'abonnement, et lit tout de suite si le document est VALIDE ou
 * NON VALIDE. Un QR code ouvert depuis l'appareil photo du téléphone arrive ici avec le code
 * dans l'adresse (`?code=`).
 *
 * Le verdict affiché est déduit des données connues du frontend (exemples). En réel, le
 * serveur vérifie le document, applique la règle d'usage unique et répond.
 */
export function ServiceScannerPage() {
  const service = useCurrentService()
  const [searchParams] = useSearchParams()
  const deepLink =
    searchParams.get('code') ?? searchParams.get('ticket') ?? searchParams.get('carte') ?? ''
  // Remount quand le deep-link change (QR caméra) — évite setState dans un effect.
  return (
    <ServiceScannerInner
      key={deepLink || 'manual'}
      serviceId={service.id}
      deepLink={deepLink}
    />
  )
}

function ServiceScannerInner({
  serviceId,
  deepLink,
}: {
  serviceId: string
  deepLink: string
}) {
  const service = useCurrentService()
  // Tous les documents : pour distinguer « introuvable » et « autre établissement ».
  const allTickets = useTickets()
  const allCards = useSubscriptionCards()
  // Liste d’essai : uniquement ceux de cet établissement.
  const tickets = useServiceTickets(serviceId)
  const cards = useServiceSubscriptionCards(serviceId)
  const now = useNow(30_000)
  const { message, flash } = useFlash()
  const initial = deepLink ? extractScanCode(deepLink) : ''
  const [input, setInput] = useState(initial)
  const [submitted, setSubmitted] = useState(initial)

  const lookup = lookupScan(allTickets, allCards, serviceId, submitted)

  function check(value: string) {
    const code = extractScanCode(value)
    setInput(code)
    setSubmitted(code)
    // Le résultat s'affiche sous le formulaire : on y amène l'écran.
    window.requestAnimationFrame(() =>
      document
        .getElementById('scan-result')
        ?.scrollIntoView({ behavior: 'smooth', block: 'start' }),
    )
  }

  function submit(event: FormEvent) {
    event.preventDefault()
    check(input)
  }

  function validate() {
    if (lookup.kind !== 'ticket') return
    // eslint-disable-next-line react-hooks/purity -- horodatage au clic de validation
    const result = validateTicket(lookup.ticket, Date.now())
    flash(
      result.ok
        ? 'Prestation validée : ce ticket ne peut plus être utilisé.'
        : result.reason === 'already_validated'
          ? 'Refusé : ce ticket a déjà été validé.'
          : 'Refusé : ce ticket est annulé.',
    )
    // Resoumettre le même code pour afficher le statut à jour (VALIDÉ).
    if (result.ok) setSubmitted(lookup.ticket.verificationCode)
  }

  return (
    <RubriquePage
      toolId="scanner"
      subtitle={`Tickets et cartes d’abonnement · ${service.name}`}
    >
      <div className="space-y-4 px-4">
        <QrScanner onScan={check} />

        <form
          noValidate
          onSubmit={submit}
          className="space-y-3 rounded-2xl border border-border/70 bg-card/95 p-4 shadow-[0_8px_24px_-20px_rgba(15,23,42,0.3)]"
        >
          <Field id="scan-code" label="Numéro ou code (ticket ou carte)">
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
          <Button type="submit" size="lg" variant="outline" className="w-full">
            <ScanLine aria-hidden="true" />
            Vérifier
          </Button>
        </form>
      </div>

      <FlashMessage message={message} />

      <div id="scan-result" aria-live="polite" className="scroll-mt-40 px-4">
        {lookup.kind === 'empty' ? null : (
          <ScanResult lookup={lookup} now={now} onValidateTicket={validate} />
        )}
      </div>

      <section
        aria-labelledby="try-title"
        className="space-y-2 border-t border-border/60 pt-4"
      >
        <div className="px-4">
          <h2 id="try-title" className="text-title font-bold tracking-tight">
            Pour essayer
          </h2>
          <p className="text-body text-muted-foreground">
            Touchez un exemple pour voir le résultat du scan.
          </p>
        </div>
        <ul className="divide-y divide-border/60">
          {cards.map((card) => (
            <li key={card.id}>
              <button
                type="button"
                onClick={() => check(card.number)}
                className="flex min-h-16 w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-muted/70"
              >
                <span className="min-w-0 flex-1 space-y-0.5">
                  <span className="block truncate text-body font-bold">
                    Carte · {card.holderName}
                  </span>
                  <span className="block truncate text-caption text-muted-foreground">
                    {card.planName} · {formatCardNumber(card.number)}
                  </span>
                </span>
                <StatusPill>
                  {SUBSCRIPTION_STATUS[getCardStatus(card, now)].label}
                </StatusPill>
              </button>
            </li>
          ))}
          {tickets.map((ticket) => (
            <li key={ticket.id}>
              <button
                type="button"
                onClick={() => check(ticket.number)}
                className="flex min-h-16 w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-muted/70"
              >
                <span className="min-w-0 flex-1 space-y-0.5">
                  <span className="block truncate text-body font-bold">
                    Ticket · {ticket.clientName}
                  </span>
                  <span className="block truncate text-caption text-muted-foreground">
                    {ticket.itemLabel} · {formatTicketNumber(ticket.number)}
                  </span>
                </span>
                <TicketStatusPill status={ticket.status} />
              </button>
            </li>
          ))}
        </ul>
      </section>
    </RubriquePage>
  )
}
