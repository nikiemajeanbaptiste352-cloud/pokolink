import { ChevronRight, ShoppingBag } from 'lucide-react'
import { Link } from 'react-router-dom'

import { StatusPill } from '@/components/pro/shared'
import { formatPrice } from '@/lib/format'
import { formatDateTime } from '@/lib/pro-labels'
import { PURCHASE_STATUS } from '@/lib/purchase-labels'
import { toneSoft } from '@/lib/tones'
import { cn } from '@/lib/utils'
import { paths } from '@/routes/paths'
import type { Purchase } from '@/types/purchase'

/** Ligne de « Mes achats » : vendeur, articles, total et état de la commande. */
export function PurchaseRow({ purchase }: { purchase: Purchase }) {
  const count = purchase.lines.reduce((sum, line) => sum + line.quantity, 0)
  const summary = purchase.lines.map((line) => line.name).join(', ')

  return (
    <Link
      to={paths.purchase(purchase.id)}
      className="flex min-h-18 items-center gap-3 px-4 py-3"
    >
      <span
        className={cn(
          'grid size-11 shrink-0 place-items-center rounded-full',
          toneSoft.gold,
        )}
      >
        <ShoppingBag className="size-5" aria-hidden="true" />
      </span>
      <span className="min-w-0 flex-1 space-y-0.5">
        <span className="block truncate text-body font-bold">{purchase.sellerName}</span>
        <span className="block truncate text-caption text-muted-foreground">
          {count} article{count > 1 ? 's' : ''} · {summary}
        </span>
        <span className="block truncate text-caption text-muted-foreground">
          {formatDateTime(purchase.createdAt)}
        </span>
        <StatusPill className="mt-1">{PURCHASE_STATUS[purchase.status].label}</StatusPill>
      </span>
      <span className="shrink-0 text-body font-extrabold tabular-nums">
        {formatPrice(purchase.total)}
      </span>
      <ChevronRight
        className="size-5 shrink-0 text-muted-foreground"
        aria-hidden="true"
      />
    </Link>
  )
}
