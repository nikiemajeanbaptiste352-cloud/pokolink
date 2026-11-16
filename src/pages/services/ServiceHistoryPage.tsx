import { ReceiptText } from 'lucide-react'
import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'

import { EmptyState } from '@/components/common/EmptyState'
import { SectionHeader } from '@/components/common/SectionHeader'
import { StatTile } from '@/components/pro/shared'
import { RubriquePage } from '@/components/services/RubriquePage'
import { TicketStatusPill } from '@/components/tickets/TicketStatusPill'
import { TicketVerifier } from '@/components/tickets/TicketVerifier'
import { useCurrentService } from '@/hooks/use-current-service'
import { useServiceTickets, useTickets } from '@/hooks/use-tickets'
import { extractScanCode } from '@/lib/scan-lookup'
import { formatPrice } from '@/lib/format'
import { formatDateTime } from '@/lib/pro-labels'
import { formatTicketNumber } from '@/lib/ticket-labels'

/**
 * Historique de l'Espace Pro : les paiements reçus par cet établissement et leurs tickets,
 * avec la vérification d'un ticket (QR code) et sa validation. C'est ici que vivent les
 * informations financières de l'établissement, depuis la suppression de la rubrique Caisse.
 */
export function ServiceHistoryPage() {
  const service = useCurrentService()
  const tickets = useServiceTickets(service.id)
  const allTickets = useTickets()
  const [searchParams] = useSearchParams()
  // Code venu du QR code (`?ticket=` / `?code=`) ou choisi dans la liste ci-dessous.
  const [picked, setPicked] = useState<{ code: string; seq: number }>({
    code: extractScanCode(
      searchParams.get('ticket') ?? searchParams.get('code') ?? '',
    ),
    seq: 0,
  })

  const toValidate = tickets.filter(
    (t) => t.status === 'paid' || t.status === 'pending_validation',
  ).length
  const validated = tickets.filter((t) => t.status === 'validated').length
  const received = tickets
    .filter((t) => t.status !== 'cancelled')
    .reduce((sum, t) => sum + t.amount, 0)

  return (
    <RubriquePage
      toolId="history"
      subtitle={`Paiements et tickets · ${service.name}`}
    >
      <dl className="grid grid-cols-3 gap-3 px-4">
        <StatTile label="À valider" value={String(toValidate)} />
        <StatTile label="Validés" value={String(validated)} />
        <StatTile label="Reçu" value={formatPrice(received)} />
      </dl>

      <TicketVerifier
        key={`${picked.code}-${picked.seq}`}
        serviceId={service.id}
        tickets={allTickets}
        initial={picked.code}
      />

      <section
        aria-labelledby="tickets-title"
        className="space-y-2 border-t border-border/60 pt-4"
      >
        <SectionHeader
          title={<span id="tickets-title">Paiements reçus</span>}
          description="Touchez un ticket pour le vérifier"
        />
        {tickets.length === 0 ? (
          <EmptyState
            icon={ReceiptText}
            title="Aucun paiement pour l’instant"
            description="Les paiements confirmés de vos clients et leurs tickets apparaîtront ici."
            className="py-8"
          />
        ) : (
          <ul className="divide-y divide-border/60">
            {tickets.map((ticket) => (
              <li key={ticket.id}>
                <button
                  type="button"
                  onClick={() => {
                    setPicked((current) => ({
                      code: ticket.number,
                      seq: current.seq + 1,
                    }))
                    // Le résultat s'affiche au-dessus de la liste : on y remonte.
                    window.requestAnimationFrame(() =>
                      document
                        .getElementById('verify-title')
                        ?.scrollIntoView({ behavior: 'smooth', block: 'start' }),
                    )
                  }}
                  className="flex min-h-16 w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-muted/70"
                >
                  <span className="min-w-0 flex-1 space-y-0.5">
                    <span className="block truncate text-body font-bold">
                      {ticket.clientName} · {ticket.itemLabel}
                    </span>
                    <span className="block truncate text-caption text-muted-foreground">
                      {formatTicketNumber(ticket.number)} ·{' '}
                      {formatDateTime(ticket.paidAt)}
                    </span>
                    <TicketStatusPill status={ticket.status} className="mt-1" />
                  </span>
                  <span className="shrink-0 text-body font-extrabold tabular-nums">
                    {formatPrice(ticket.amount)}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
        <p className="px-4 text-caption text-muted-foreground">
          Les remboursements et le détail des ventes seront listés ici avec le module de
          paiement.
        </p>
      </section>
    </RubriquePage>
  )
}
