import { cn } from '@/lib/utils'
import type { MarketStatus } from '@/types/market'

import { STATUS_LABEL } from './market-utils'

const classes: Record<MarketStatus, string> = {
  open: 'bg-accent text-brand',
  upcoming: 'bg-warning/20 text-foreground',
  closed: 'bg-muted text-muted-foreground',
}

export function StatusBadge({ status }: { status: MarketStatus }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-1 text-caption font-bold',
        classes[status],
      )}
    >
      {STATUS_LABEL[status]}
    </span>
  )
}
