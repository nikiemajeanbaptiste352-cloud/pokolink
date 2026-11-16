import { cn } from '@/lib/utils'

interface SparklineProps {
  values: readonly number[]
  className?: string
  /** Valeur de référence tracée en pointillés (ex. 1 pour le facteur neutre). */
  baseline?: number
  /**
   * Échelle verticale minimale. La courbe n'est jamais agrandie au-delà de cette plage :
   * un facteur qui bouge de 0,4 % reste visiblement presque plat.
   */
  minSpan?: number
}

/** Courbe d'évolution du facteur. Décorative : le texte voisin porte l'information. */
export function Sparkline({
  values,
  className,
  baseline,
  minSpan = 0.2,
}: SparklineProps) {
  const width = 120
  const height = 40
  const pad = 3

  const dataMin = Math.min(...values)
  const dataMax = Math.max(...values)
  const center = baseline ?? (dataMin + dataMax) / 2
  // Plage symétrique autour de la référence, élargie si les valeurs sortent de la plage minimale.
  const half = Math.max(
    minSpan / 2,
    Math.abs(dataMax - center),
    Math.abs(dataMin - center),
  )
  const low = center - half
  const high = center + half
  const toY = (value: number) =>
    height - pad - ((value - low) / (high - low)) * (height - pad * 2)

  const baselineY = baseline === undefined ? null : toY(baseline)

  const points = values
    .map((value, index) => {
      const x =
        values.length < 2 ? pad : pad + (index / (values.length - 1)) * (width - pad * 2)
      return `${x.toFixed(1)},${toY(value).toFixed(1)}`
    })
    .join(' ')

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="none"
      aria-hidden="true"
      className={cn('h-10 w-full text-brand', className)}
    >
      {baselineY === null ? null : (
        <line
          x1={pad}
          x2={width - pad}
          y1={baselineY}
          y2={baselineY}
          stroke="currentColor"
          strokeDasharray="3 3"
          strokeWidth="1"
          opacity="0.4"
          vectorEffect="non-scaling-stroke"
        />
      )}
      {values.length < 2 ? (
        <circle cx={pad + 2} cy={toY(values[0] ?? center)} r="2.5" fill="currentColor" />
      ) : (
        <polyline
          points={points}
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
        />
      )}
    </svg>
  )
}
