import { Check } from 'lucide-react'

import { cn } from '@/lib/utils'
import type { CoinEvent } from '@/types/coin-market'

import { getLifecycleStep, LIFECYCLE_STEPS } from './coin-utils'

/**
 * Parcours de l'événement en quatre étapes. On distingue la fermeture des achats, la
 * clôture du mécanisme et le règlement des détenteurs restants.
 */
export function CoinLifecycle({ event }: { event: CoinEvent }) {
  const current = getLifecycleStep(event)
  if (current === null) return null

  return (
    <ol aria-label="Étapes de l’événement" className="grid grid-cols-4 gap-1 sm:gap-1.5">
      {LIFECYCLE_STEPS.map((step, index) => {
        const done = index < current
        const active = index === current
        return (
          <li
            key={step.id}
            aria-current={active ? 'step' : undefined}
            className="flex min-w-0 flex-col items-center gap-1 text-center"
          >
            <span
              className={cn(
                'grid size-8 place-items-center rounded-full text-caption font-bold',
                done && 'bg-primary text-primary-foreground',
                active && 'bg-accent text-brand ring-2 ring-primary',
                !done && !active && 'bg-muted text-muted-foreground',
              )}
            >
              {done ? <Check className="size-4" aria-hidden="true" /> : index + 1}
            </span>
            <span className="line-clamp-2 text-[10px] leading-tight font-bold sm:text-caption">
              {step.label}
            </span>
            <span className="hidden text-[10px] leading-tight text-muted-foreground sm:line-clamp-2 sm:block sm:text-caption">
              <span className="sr-only">
                {done ? 'Terminé. ' : active ? 'Étape actuelle. ' : 'À venir. '}
              </span>
              {step.hint}
            </span>
            <span className="sr-only sm:hidden">
              {done ? 'Terminé. ' : active ? 'Étape actuelle. ' : 'À venir. '}
              {step.hint}
            </span>
          </li>
        )
      })}
    </ol>
  )
}
