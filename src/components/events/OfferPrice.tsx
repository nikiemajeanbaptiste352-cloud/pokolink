import { formatPrice } from '@/lib/format'
import { getDiscountPercent } from '@/lib/events'
import { cn } from '@/lib/utils'
import type { EventOffer } from '@/types/event'

/** Prix de l'événement, ancien prix barré et pourcentage de réduction. */
export function OfferPrice({
  offer,
  className,
}: {
  offer: EventOffer
  className?: string
}) {
  const percent = getDiscountPercent(offer.normalPrice, offer.eventPrice)

  return (
    <p className={cn('flex flex-wrap items-baseline gap-x-2 gap-y-0.5', className)}>
      <span className="text-title font-extrabold text-brand">
        {formatPrice(offer.eventPrice)}
      </span>
      {percent > 0 ? (
        <>
          <s className="text-caption text-muted-foreground">
            <span className="sr-only">Prix habituel : </span>
            {formatPrice(offer.normalPrice)}
          </s>
          <span className="rounded-full bg-destructive/12 px-2 py-0.5 text-caption font-bold text-danger">
            −{percent} %
          </span>
        </>
      ) : null}
    </p>
  )
}
