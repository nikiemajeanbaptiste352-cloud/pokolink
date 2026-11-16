import { Star } from 'lucide-react'

import { formatCount, formatRating } from '@/lib/format'
import { cn } from '@/lib/utils'

interface RatingProps {
  value: number
  /** Nombre d'avis, affiché entre parenthèses. */
  count?: number
  className?: string
}

/** Note sur 5 avec étoile dorée et nombre d'avis facultatif. */
export function Rating({ value, count, className }: RatingProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 text-caption font-semibold',
        className,
      )}
    >
      <Star className="size-3.5 fill-gold text-gold" aria-hidden="true" />
      <span>{formatRating(value)}</span>
      {count !== undefined ? (
        <span className="font-normal text-muted-foreground">({formatCount(count)})</span>
      ) : null}
      <span className="sr-only">sur 5</span>
    </span>
  )
}
