import { CircleCheck, CircleX, Clock, TriangleAlert } from 'lucide-react'

import type { Outcome, StatusMeta } from '@/lib/wallet-labels'
import { cn } from '@/lib/utils'

const OUTCOME_ICON = {
  progress: Clock,
  success: CircleCheck,
  problem: TriangleAlert,
  failure: CircleX,
} as const

/** Fond de la carte et couleur de l'icône (le texte reste en couleur normale : contraste AA). */
const OUTCOME_STYLE: Record<Outcome, { card: string; icon: string }> = {
  progress: { card: 'bg-info/10', icon: 'text-info' },
  success: { card: 'bg-success/15', icon: 'text-brand' },
  problem: { card: 'bg-warning/20', icon: 'text-foreground' },
  failure: { card: 'bg-destructive/10', icon: 'text-destructive' },
}

/** Pastille d'état : point coloré + libellé, sur fond neutre. */
export function StatusPill({
  meta,
  className,
}: {
  meta: StatusMeta
  className?: string
}) {
  const dot: Record<Outcome, string> = {
    progress: 'bg-info',
    success: 'bg-brand',
    problem: 'bg-warning',
    failure: 'bg-destructive',
  }
  return (
    <span
      className={cn(
        'inline-flex shrink-0 items-center gap-1.5 rounded-full bg-muted px-2.5 py-1 text-caption font-bold text-foreground',
        className,
      )}
    >
      <span aria-hidden="true" className={cn('size-2 rounded-full', dot[meta.outcome])} />
      {meta.label}
    </span>
  )
}

/** Carte d'état d'une demande : icône, libellé et explication en langage simple. */
export function StatusCard({ meta }: { meta: StatusMeta }) {
  const Icon = OUTCOME_ICON[meta.outcome]
  const style = OUTCOME_STYLE[meta.outcome]
  return (
    <section
      aria-label="État de la demande"
      className={cn('mx-4 flex items-start gap-3 rounded-2xl p-4', style.card)}
    >
      <Icon className={cn('mt-0.5 size-6 shrink-0', style.icon)} aria-hidden="true" />
      <div className="space-y-1">
        <p className="text-title font-extrabold">{meta.label}</p>
        <p className="text-body">{meta.message}</p>
      </div>
    </section>
  )
}
