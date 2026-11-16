import { ORDER_STATUS } from '@/lib/orders'
import { toneSoft } from '@/lib/tones'
import { cn } from '@/lib/utils'
import type { OrderStatus } from '@/types/order'

/** Statut d'une commande : texte lisible (fond neutre) et icône teintée. */
export function OrderStatusBadge({
  status,
  className,
}: {
  status: OrderStatus
  className?: string
}) {
  const meta = ORDER_STATUS[status]
  const Icon = meta.icon
  return (
    <span
      className={cn(
        'inline-flex shrink-0 items-center gap-1.5 rounded-full bg-muted py-1 pr-2.5 pl-1.5 text-caption font-bold text-foreground',
        className,
      )}
    >
      <span
        className={cn('grid size-5 place-items-center rounded-full', toneSoft[meta.tone])}
      >
        <Icon className="size-3.5" aria-hidden="true" />
      </span>
      {meta.label}
    </span>
  )
}
