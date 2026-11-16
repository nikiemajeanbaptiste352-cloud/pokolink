import { useId, useState, type KeyboardEvent, type PointerEvent } from 'react'

import { formatCount } from '@/lib/format'
import { niceCeil, smoothPath, tickIndexes } from '@/lib/chart'
import { cn } from '@/lib/utils'

interface TrendChartProps {
  /** Une valeur par période, de la plus ancienne à la plus récente. */
  values: readonly number[]
  /** Libellé de chaque période (« 12 nov. »), même longueur que `values`. */
  labels: readonly string[]
  /** Valeur complète (info-bulle, lecteurs d'écran) : « 1 240 visiteurs ». */
  format: (value: number) => string
  axisFormat?: (value: number) => string
  /** Couleur de la courbe, via `text-*` (ex. `text-brand`). */
  colorClass: string
  /** Résumé lu par les lecteurs d'écran. */
  summary: string
  plotHeight?: string
  className?: string
}

/**
 * Courbe d'activité lissée avec aire, axes indicatifs et repère au toucher, à la souris
 * ou au clavier (flèches). Elle ne fait que tracer les chiffres reçus.
 */
export function TrendChart({
  values,
  labels,
  format,
  axisFormat = formatCount,
  colorClass,
  summary,
  plotHeight = 'h-40 sm:h-52',
  className,
}: TrendChartProps) {
  const gradientId = useId()
  const [picked, setPicked] = useState<number | null>(null)
  const last = values.length - 1
  const active = Math.min(picked ?? last, last)

  const axisMax = niceCeil(Math.max(0, ...values))
  const xOf = (index: number) => (last <= 0 ? 50 : (index / last) * 100)
  const yOf = (value: number) => 100 - (value / axisMax) * 100
  const points = values.map((value, index) => ({ x: xOf(index), y: yOf(value) }))
  const line = smoothPath(points)
  const area = points.length > 1 ? `${line} L100,100 L0,100 Z` : ''

  function pick(event: PointerEvent<HTMLDivElement>) {
    if (last < 1) return
    const box = event.currentTarget.getBoundingClientRect()
    const ratio = (event.clientX - box.left) / box.width
    setPicked(Math.min(last, Math.max(0, Math.round(ratio * last))))
  }

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const step = event.key === 'ArrowRight' ? 1 : event.key === 'ArrowLeft' ? -1 : 0
    if (step === 0) return
    event.preventDefault()
    setPicked((current) =>
      Math.min(last, Math.max(0, Math.min(current ?? last, last) + step)),
    )
  }

  if (values.length === 0) return null

  const activeValue = values[active] ?? 0
  const tipX = Math.min(88, Math.max(12, xOf(active)))

  return (
    <div className={cn('flex gap-2 pt-12', className)}>
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

      <div className="min-w-0 flex-1">
        <div
          role="slider"
          tabIndex={0}
          aria-label={summary}
          aria-valuemin={0}
          aria-valuemax={last}
          aria-valuenow={active}
          aria-valuetext={`${labels[active] ?? ''} : ${format(activeValue)}`}
          onPointerDown={pick}
          onPointerMove={(event) => {
            if (event.pointerType === 'mouse' || event.buttons > 0) pick(event)
          }}
          onKeyDown={onKeyDown}
          className={cn(
            'relative cursor-crosshair rounded-md focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none',
            colorClass,
            plotHeight,
          )}
          style={{ touchAction: 'pan-y' }}
        >
          <div aria-hidden="true" className="absolute inset-0">
            <span className="absolute inset-x-0 top-0 border-t border-dashed border-border" />
            <span className="absolute inset-x-0 top-1/2 border-t border-dashed border-border" />
            <span className="absolute inset-x-0 bottom-0 border-t border-border" />
          </div>
          <svg
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            aria-hidden="true"
            className="absolute inset-0 size-full overflow-visible"
          >
            <defs>
              <linearGradient id={gradientId} x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="currentColor" stopOpacity="0.28" />
                <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
              </linearGradient>
            </defs>
            {area ? <path d={area} fill={`url(#${gradientId})`} /> : null}
            <path
              d={line}
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              vectorEffect="non-scaling-stroke"
            />
          </svg>

          {/* Repère de la période choisie (par défaut la plus récente). */}
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 w-px bg-current opacity-30"
            style={{ left: `${xOf(active)}%` }}
          />
          <span
            aria-hidden="true"
            className="pointer-events-none absolute size-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-card bg-current shadow"
            style={{ left: `${xOf(active)}%`, top: `${yOf(activeValue)}%` }}
          />
          <span
            aria-hidden="true"
            className="pointer-events-none absolute -top-1 -translate-x-1/2 -translate-y-full rounded-lg bg-foreground px-2 py-1 text-center text-[11px] leading-4 font-bold whitespace-nowrap text-background shadow"
            style={{ left: `${tipX}%` }}
          >
            {labels[active]}
            <span className="block text-caption">{format(activeValue)}</span>
          </span>
        </div>

        <div
          aria-hidden="true"
          className="relative mt-1.5 h-4 text-[11px] text-muted-foreground"
        >
          {tickIndexes(values.length).map((index, order, all) => (
            <span
              key={index}
              className={cn(
                'absolute whitespace-nowrap',
                order === 0
                  ? 'left-0'
                  : order === all.length - 1
                    ? 'right-0'
                    : '-translate-x-1/2',
              )}
              style={
                order === 0 || order === all.length - 1
                  ? undefined
                  : { left: `${xOf(index)}%` }
              }
            >
              {labels[index]}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
