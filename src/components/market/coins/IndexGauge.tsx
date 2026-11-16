import { TEMP_COIN_PARAMS } from '@/lib/placeholder-coin-markets'

import { formatIndex } from './coin-utils'

/** Position de l'indice dans sa plage (50 à 150), avec le point de départ à 100. */
export function IndexGauge({ index }: { index: number }) {
  const { indexMin: min, indexMax: max } = TEMP_COIN_PARAMS
  const toPercent = (value: number) =>
    `${Math.min(Math.max((value - min) / (max - min), 0), 1) * 100}%`

  return (
    <div>
      <div
        role="meter"
        aria-label="Position de l’indice"
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuenow={index}
        aria-valuetext={`${formatIndex(index)}, sur une plage de ${min} à ${max}`}
        className="relative h-2 rounded-full bg-muted"
      >
        <span
          aria-hidden="true"
          className="absolute top-1/2 h-4 w-0.5 -translate-x-1/2 -translate-y-1/2 bg-muted-foreground/60"
          style={{ left: toPercent(100) }}
        />
        <span
          aria-hidden="true"
          className="absolute top-1/2 size-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-background bg-brand shadow-card"
          style={{ left: toPercent(index) }}
        />
      </div>
      <div
        aria-hidden="true"
        className="mt-1.5 flex justify-between text-caption text-muted-foreground"
      >
        <span>{min}</span>
        <span>100 · départ</span>
        <span>{max}</span>
      </div>
    </div>
  )
}
