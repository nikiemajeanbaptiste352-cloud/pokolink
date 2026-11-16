import { ChevronRight } from 'lucide-react'

import { formatPrice } from '@/lib/format'
import {
  formatAgo,
  getPaymentLabel,
  ORDER_MODE_LABEL,
  summarizeOrder,
} from '@/lib/orders'
import type { ServiceOrder } from '@/types/order'

import { OrderStatusBadge } from './OrderStatusBadge'

interface OrderCardProps {
  order: ServiceOrder
  now: number
  onOpen: (order: ServiceOrder) => void
}

/** Une commande dans une liste : numéro, client, résumé, total et statut. */
export function OrderCard({ order, now, onOpen }: OrderCardProps) {
  return (
    <button
      type="button"
      onClick={() => onOpen(order)}
      className="block w-full space-y-2 rounded-xl border bg-card p-4 text-left shadow-card transition-colors hover:bg-muted"
    >
      <span className="flex items-center justify-between gap-3">
        <span className="min-w-0 truncate text-body font-bold">
          {order.reference} · {order.customerName}
        </span>
        <OrderStatusBadge status={order.status} />
      </span>
      <span className="block truncate text-body text-muted-foreground">
        {summarizeOrder(order)}
      </span>
      <span className="flex items-center justify-between gap-3">
        <span className="min-w-0 text-caption text-muted-foreground">
          {ORDER_MODE_LABEL[order.mode]} · {formatAgo(order.createdAt, now)} ·{' '}
          {getPaymentLabel(order)}
        </span>
        <span className="flex shrink-0 items-center gap-1">
          <span className="text-body font-extrabold">{formatPrice(order.total)}</span>
          <ChevronRight className="size-5 text-muted-foreground" aria-hidden="true" />
        </span>
      </span>
    </button>
  )
}
