import { TICKET_STATUS } from '@/lib/ticket-labels'
import { cn } from '@/lib/utils'
import type { TicketStatus } from '@/types/ticket'

const DOT: Record<TicketStatus, string> = {
  paid: 'bg-brand',
  pending_validation: 'bg-warning',
  validated: 'bg-info',
  cancelled: 'bg-destructive',
}

/** Pastille de statut : point coloré + libellé, sur fond neutre (contraste AA). */
export function TicketStatusPill({
  status,
  className,
}: {
  status: TicketStatus
  className?: string
}) {
  return (
    <span
      className={cn(
        'inline-flex shrink-0 items-center gap-1.5 rounded-full bg-muted px-2.5 py-1 text-caption font-bold text-foreground',
        className,
      )}
    >
      <span aria-hidden="true" className={cn('size-2 rounded-full', DOT[status])} />
      {TICKET_STATUS[status].label}
    </span>
  )
}
