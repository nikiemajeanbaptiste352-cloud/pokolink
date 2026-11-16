import { Link } from 'react-router-dom'

import { formatCount } from '@/lib/format'
import { niceCeil } from '@/lib/chart'
import { cn } from '@/lib/utils'

export interface ColumnItem {
  id: string
  /** Valeur tracée, `undefined` tant que la donnée manque (un trait est tracé à la place). */
  value: number | undefined
  /** Valeur courte écrite sous l'axe (première ligne, en gras). */
  valueLabel: string
  /** Lignes secondaires sous la valeur (date, type…). */
  labels?: readonly string[]
  /** Phrase lue par les lecteurs d'écran : « Titre : 12 000 vues ». */
  aria: string
  /** Si présent, la colonne est un lien. */
  to?: string
}

interface ColumnChartProps {
  items: readonly ColumnItem[]
  /** Classe de couleur des barres (contraste ≥ 3:1 avec le fond de la carte). */
  barClass: string
  axisFormat?: (value: number) => string
  /** Largeur minimale d'une colonne, en rem : en dessous, le graphique défile. */
  columnRem?: number
  plotHeight?: string
  className?: string
}

/**
 * Histogramme responsive : une colonne par élément, axe vertical indicatif, valeurs sous
 * l'axe. Chaque colonne est lisible par les lecteurs d'écran (`aria`). Il ne fait que
 * tracer les chiffres reçus.
 */
export function ColumnChart({
  items,
  barClass,
  axisFormat = formatCount,
  columnRem = 2.5,
  plotHeight = 'h-44 sm:h-56',
  className,
}: ColumnChartProps) {
  const values = items.flatMap((item) => (item.value === undefined ? [] : [item.value]))
  const axisMax = niceCeil(Math.max(0, ...values))

  return (
    <div role="group" className={cn('flex gap-2 pt-2', className)}>
      {/* Axe vertical : repères indicatifs, sans valeur lue par les lecteurs d'écran. */}
      <div
        aria-hidden="true"
        className={cn(
          'relative w-10 shrink-0 text-right text-[11px] text-muted-foreground tabular-nums',
          plotHeight,
        )}
      >
        {[1, 0.5, 0].map((ratio) => (
          <span
            key={ratio}
            className="absolute right-0 -translate-y-1/2 leading-none"
            style={{ top: `${(1 - ratio) * 100}%` }}
          >
            {axisFormat(axisMax * ratio)}
          </span>
        ))}
      </div>

      <div className="min-w-0 flex-1 overflow-x-auto">
        <div style={{ minWidth: `${items.length * columnRem}rem` }}>
          <div className={cn('relative', plotHeight)}>
            <div aria-hidden="true" className="absolute inset-0">
              <span className="absolute inset-x-0 top-0 border-t border-dashed" />
              <span className="absolute inset-x-0 top-1/2 border-t border-dashed" />
              <span className="absolute inset-x-0 bottom-0 border-t" />
            </div>
            <ol className="absolute inset-0 flex gap-0.5">
              {items.map((item) => {
                const height =
                  item.value === undefined ? 0 : Math.max(3, (item.value / axisMax) * 100)
                const column = (
                  <>
                    {item.value === undefined ? (
                      <span
                        aria-hidden="true"
                        className="mb-px h-0.5 w-3 rounded-full bg-muted-foreground/40"
                      />
                    ) : (
                      <span
                        aria-hidden="true"
                        className={cn(
                          'w-full max-w-9 rounded-t-md transition-opacity group-hover:opacity-80',
                          barClass,
                        )}
                        style={{ height: `${height}%` }}
                      />
                    )}
                  </>
                )
                const columnClass =
                  'group flex h-full items-end justify-center rounded-md hover:bg-muted/60'
                return (
                  <li key={item.id} className="min-w-0 flex-1">
                    {item.to ? (
                      <Link to={item.to} aria-label={item.aria} className={columnClass}>
                        {column}
                      </Link>
                    ) : (
                      <div role="img" aria-label={item.aria} className={columnClass}>
                        {column}
                      </div>
                    )}
                  </li>
                )
              })}
            </ol>
          </div>

          <ol aria-hidden="true" className="mt-1.5 flex gap-0.5">
            {items.map((item) => (
              <li key={item.id} className="min-w-0 flex-1 text-center">
                <span className="block truncate text-[11px] leading-4 font-bold tabular-nums">
                  {item.value === undefined ? '–' : item.valueLabel}
                </span>
                {item.labels?.map((label, index) => (
                  <span
                    key={index}
                    className="block truncate text-[11px] leading-4 text-muted-foreground"
                  >
                    {label}
                  </span>
                ))}
              </li>
            ))}
          </ol>
        </div>
      </div>
    </div>
  )
}
