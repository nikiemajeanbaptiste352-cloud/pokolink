import { ChevronRight, Ticket } from 'lucide-react'
import { Link } from 'react-router-dom'

import { Avatar } from '@/components/common/Avatar'
import { TicketStatusPill } from '@/components/tickets/TicketStatusPill'
import { useTicketPro } from '@/hooks/use-tickets'
import { formatPrice } from '@/lib/format'
import { formatDateTime } from '@/lib/pro-labels'
import { formatTicketNumber } from '@/lib/ticket-labels'
import { cn } from '@/lib/utils'
import { paths } from '@/routes/paths'
import type { PaymentTicket } from '@/types/ticket'

/** Ligne de la liste « Mes tickets » : Service Pro, prestation, montant et statut. */
export function TicketRow({ ticket }: { ticket: PaymentTicket }) {
  const pro = useTicketPro(ticket)
  const cancelled = ticket.status === 'cancelled'

  return (
    <Link
      to={paths.ticket(ticket.id)}
      className={cn(
        'mx-3 flex items-center gap-3 rounded-2xl border bg-card px-3.5 py-3 shadow-sm transition-colors',
        'hover:bg-muted/60 active:scale-[0.995]',
        cancelled && 'opacity-80',
      )}
    >
      <span className="relative shrink-0">
        <Avatar name={pro.name} src={pro.logo} size="lg" />
        <span
          aria-hidden="true"
          className="absolute -right-1 -bottom-1 grid size-5 place-items-center rounded-full bg-brand text-brand-foreground ring-2 ring-card"
        >
          <Ticket className="size-3" />
        </span>
      </span>
      <span className="min-w-0 flex-1 space-y-0.5">
        <span className="block truncate text-body font-bold">{pro.name}</span>
        <span className="block truncate text-caption text-muted-foreground">
          {ticket.itemLabel} · {formatTicketNumber(ticket.number)}
        </span>
        <span className="block truncate text-caption text-muted-foreground">
          {formatDateTime(ticket.paidAt)}
        </span>
        <TicketStatusPill status={ticket.status} className="mt-1" />
      </span>
      <span className="flex shrink-0 flex-col items-end gap-1">
        <span className="text-body font-extrabold text-brand tabular-nums">
          {formatPrice(ticket.amount)}
        </span>
        <ChevronRight
          className="size-4 text-muted-foreground"
          aria-hidden="true"
        />
      </span>
    </Link>
  )
}
