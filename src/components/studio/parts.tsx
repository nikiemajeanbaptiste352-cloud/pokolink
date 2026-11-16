import type { ReactNode } from 'react'

import { cn } from '@/lib/utils'

/** Barre de proportion : `value` sur `max`, avec un libellé lisible par les lecteurs d'écran. */
export function ProgressBar({
  value,
  max,
  label,
  className,
}: {
  value: number
  max: number
  label: string
  className?: string
}) {
  const ratio = max > 0 ? Math.min(Math.max(value / max, 0), 1) : 0
  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={max}
      aria-valuenow={Math.min(value, max)}
      className={cn('h-2 overflow-hidden rounded-full bg-muted', className)}
    >
      <div
        className="h-full rounded-full bg-primary"
        style={{ width: `${(ratio * 100).toFixed(1)}%` }}
      />
    </div>
  )
}

/** Bloc titré d'une page du Studio. */
export function StudioSection({
  title,
  description,
  children,
  className,
}: {
  title: string
  description?: string
  children: ReactNode
  className?: string
}) {
  return (
    <section className={cn('space-y-3 px-4', className)}>
      <div>
        <h2 className="text-title font-extrabold">{title}</h2>
        {description ? (
          <p className="text-body text-muted-foreground">{description}</p>
        ) : null}
      </div>
      {children}
    </section>
  )
}

/** Ligne « libellé — valeur » d'une liste de paramètres. */
export function DetailRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-4 py-2.5">
      <dt className="shrink-0 text-body text-muted-foreground">{label}</dt>
      <dd className="min-w-0 text-right text-body font-semibold break-words">
        {children}
      </dd>
    </div>
  )
}
