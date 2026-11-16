import { Check } from 'lucide-react'

import { cn } from '@/lib/utils'
import type { ParticipationStep } from '@/lib/participation'

/** Parcours de la campagne, de la publication à l'attribution ou à l'achat. */
export function ParticipationSteps({
  steps,
  current,
}: {
  steps: readonly ParticipationStep[]
  /** Index de l'étape active ; égal à `steps.length` quand tout est terminé. */
  current: number
}) {
  return (
    <ol aria-label="Étapes de la campagne" className="space-y-1">
      {steps.map((step, index) => {
        const done = index < current
        const active = index === current
        return (
          <li
            key={step.id}
            aria-current={active ? 'step' : undefined}
            className="flex min-h-11 items-center gap-3"
          >
            <span
              aria-hidden="true"
              className={cn(
                'grid size-8 shrink-0 place-items-center rounded-full text-caption font-bold',
                done && 'bg-primary text-primary-foreground',
                active && 'bg-accent text-brand ring-2 ring-primary',
                !done && !active && 'bg-muted text-muted-foreground',
              )}
            >
              {done ? <Check className="size-4" /> : index + 1}
            </span>
            <span className="min-w-0 flex-1">
              <span
                className={cn(
                  'block text-body',
                  active ? 'font-extrabold' : 'font-semibold',
                )}
              >
                {step.label}
              </span>
              <span className="block text-caption text-muted-foreground">
                <span className="sr-only">
                  {done ? 'Terminé. ' : active ? 'Étape actuelle. ' : 'À venir. '}
                </span>
                {step.hint}
              </span>
            </span>
          </li>
        )
      })}
    </ol>
  )
}
