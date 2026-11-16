import type { ReactNode } from 'react'

import { cn } from '@/lib/utils'

export interface InfoRow {
  term: string
  value: ReactNode
}

/** Liste « libellé : valeur » (récapitulatif d'une demande). */
export function InfoList({
  rows,
  label,
  className,
}: {
  rows: readonly InfoRow[]
  label: string
  className?: string
}) {
  return (
    <dl
      aria-label={label}
      className={cn('mx-4 divide-y rounded-2xl border bg-card px-4', className)}
    >
      {rows.map((row) => (
        <div key={row.term} className="flex items-start justify-between gap-4 py-3">
          <dt className="text-body text-muted-foreground">{row.term}</dt>
          <dd className="min-w-0 text-right text-body font-semibold break-words">
            {row.value}
          </dd>
        </div>
      ))}
    </dl>
  )
}
