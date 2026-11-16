import { Minus, TrendingDown, TrendingUp } from 'lucide-react'

import { cn } from '@/lib/utils'
import type { CreatorMarket } from '@/types/market'

import { formatPercent, getTrend } from './market-utils'

/** Variante pour fond vidéo sombre : couleurs pleines, texte blanc (contraste AA). */
const darkStyles = {
  up: 'bg-[#15803d] text-white',
  down: 'bg-[#b91c1c] text-white',
  flat: 'bg-white/25 text-white',
} as const

const styles = {
  up: { icon: TrendingUp, label: 'En hausse', classes: 'bg-accent text-brand' },
  down: {
    icon: TrendingDown,
    label: 'En baisse',
    classes: 'bg-destructive/12 text-danger',
  },
  flat: { icon: Minus, label: 'Stable', classes: 'bg-muted text-muted-foreground' },
} as const

/** Évolution du facteur depuis l'ouverture : icône, sens en toutes lettres et écart en %. */
export function TrendBadge({
  market,
  onDark = false,
  className,
}: {
  market: CreatorMarket
  onDark?: boolean
  className?: string
}) {
  const { trend, ratio } = getTrend(market)
  const { icon: Icon, label, classes } = styles[trend]

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-caption font-bold',
        onDark ? darkStyles[trend] : classes,
        className,
      )}
    >
      <Icon className="size-4" aria-hidden="true" />
      {trend === 'flat' ? (
        label
      ) : (
        <>
          <span className="sr-only">{label} depuis l’ouverture : </span>
          {formatPercent(ratio)}
        </>
      )}
    </span>
  )
}
