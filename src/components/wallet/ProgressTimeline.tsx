import { Check } from 'lucide-react'

import type { Outcome } from '@/lib/wallet-labels'
import { cn } from '@/lib/utils'

interface ProgressTimelineProps {
  steps: readonly string[]
  /** Index de l'étape atteinte. */
  reached: number
  outcome: Outcome
  label: string
}

/**
 * Frise des étapes d'une demande. L'étape atteinte est mise en avant ; en cas de succès,
 * toutes les étapes sont terminées ; en cas de problème ou d'échec, la frise s'arrête là.
 */
export function ProgressTimeline({
  steps,
  reached,
  outcome,
  label,
}: ProgressTimelineProps) {
  return (
    <ol aria-label={label} className="space-y-0 px-4">
      {steps.map((step, index) => {
        const done = index < reached || (outcome === 'success' && index === reached)
        const current = index === reached && outcome !== 'success'
        const stopped = current && (outcome === 'problem' || outcome === 'failure')
        return (
          <li
            key={step}
            aria-current={current ? 'step' : undefined}
            className="relative flex min-h-12 gap-3 pb-3 last:pb-0"
          >
            {index < steps.length - 1 ? (
              <span
                aria-hidden="true"
                className={cn(
                  'absolute top-8 bottom-0 left-4 -ml-px w-0.5',
                  done ? 'bg-brand' : 'bg-border',
                )}
              />
            ) : null}
            <span
              aria-hidden="true"
              className={cn(
                'relative grid size-8 shrink-0 place-items-center rounded-full border-2 text-caption font-bold',
                done && 'border-brand bg-brand text-brand-foreground',
                current && !stopped && 'border-brand bg-background text-brand',
                stopped && outcome === 'problem' && 'border-warning bg-warning/20',
                stopped &&
                  outcome === 'failure' &&
                  'border-destructive bg-destructive/10',
                !done && !current && 'border-border bg-background text-muted-foreground',
              )}
            >
              {done ? <Check className="size-4" /> : index + 1}
            </span>
            <span className="min-w-0 pt-1">
              <span
                className={cn(
                  'block text-body',
                  done || current ? 'font-bold' : 'text-muted-foreground',
                )}
              >
                {step}
              </span>
              <span className="sr-only">
                {done ? ' (terminée)' : current ? ' (étape actuelle)' : ' (à venir)'}
              </span>
            </span>
          </li>
        )
      })}
    </ol>
  )
}
