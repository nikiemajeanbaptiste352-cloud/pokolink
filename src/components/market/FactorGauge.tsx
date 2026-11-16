import { formatCote } from '@/components/market/market-utils'
import type { CreatorMarket, MarketParams } from '@/types/market'

const oneDecimal = (value: number) => value.toFixed(1).replace('.', ',')

/**
 * Position du facteur dans sa plage autorisée (min à max), avec le point neutre à 1,0.
 * Montre à quel point le facteur reste proche de la neutralité.
 */
export function FactorGauge({
  market,
  params,
}: {
  market: CreatorMarket
  params: MarketParams
}) {
  const { factorMin: min, factorMax: max } = params
  const toPercent = (value: number) =>
    `${Math.min(Math.max((value - min) / (max - min), 0), 1) * 100}%`

  return (
    <div>
      <div
        role="meter"
        aria-label="Position du facteur"
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuenow={market.cote}
        aria-valuetext={`${formatCote(market.cote)}, sur une plage de ${oneDecimal(min)} à ${oneDecimal(max)}`}
        className="relative h-2 rounded-full bg-muted"
      >
        <span
          aria-hidden="true"
          className="absolute top-1/2 h-4 w-0.5 -translate-x-1/2 -translate-y-1/2 bg-muted-foreground/60"
          style={{ left: toPercent(1) }}
        />
        <span
          aria-hidden="true"
          className="absolute top-1/2 size-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-background bg-brand shadow-card"
          style={{ left: toPercent(market.cote) }}
        />
      </div>
      <div
        aria-hidden="true"
        className="mt-1.5 flex justify-between text-caption text-muted-foreground"
      >
        <span>{oneDecimal(min)}</span>
        <span>1,0 · neutre</span>
        <span>{oneDecimal(max)}</span>
      </div>
    </div>
  )
}
