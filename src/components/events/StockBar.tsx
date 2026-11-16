import { cn } from '@/lib/utils'
import type { EventOffer } from '@/types/event'

/** Barre de stock restant. Passe à l'orange sous 25 % du stock de départ. */
export function StockBar({
  offer,
  className,
}: {
  offer: EventOffer
  className?: string
}) {
  const { stockLeft, stockTotal } = offer
  const ratio = stockTotal > 0 ? Math.min(Math.max(stockLeft / stockTotal, 0), 1) : 0
  const low = ratio < 0.25

  return (
    <div className={cn('space-y-1', className)}>
      <div
        role="progressbar"
        aria-label="Stock restant"
        aria-valuemin={0}
        aria-valuemax={stockTotal}
        aria-valuenow={stockLeft}
        aria-valuetext={`${stockLeft} restants sur ${stockTotal}`}
        className="h-2 overflow-hidden rounded-full bg-muted"
      >
        <div
          className={cn('h-full rounded-full', low ? 'bg-warning' : 'bg-brand')}
          style={{ width: `${ratio * 100}%` }}
        />
      </div>
      <p className="text-caption text-muted-foreground">
        {stockLeft > 0
          ? `${stockLeft} restant${stockLeft > 1 ? 's' : ''} sur ${stockTotal}`
          : 'Stock épuisé'}
      </p>
    </div>
  )
}
