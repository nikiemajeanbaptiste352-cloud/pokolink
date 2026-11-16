import { Check, X } from 'lucide-react'

import { AD_JOURNEY } from '@/lib/ad-packs'
import { cn } from '@/lib/utils'
import type { AdCampaignStatus } from '@/types/ads'

/**
 * Parcours d'une campagne : paiement, validation, diffusion, terminée. L'étape active est celle
 * que le serveur a atteinte ; une campagne refusée s'arrête à la validation.
 */
export function AdJourney({ status }: { status: AdCampaignStatus }) {
  const refused = status === 'refused'
  const current = refused ? 1 : AD_JOURNEY.findIndex((step) => step.id === status)

  return (
    <ol aria-label="Étapes de la campagne" className="flex gap-2">
      {AD_JOURNEY.map((step, index) => {
        const done = index < current || (status === 'finished' && index === current)
        const active = index === current && !done
        const blocked = refused && index === current
        return (
          <li
            key={step.id}
            aria-current={active ? 'step' : undefined}
            className="flex min-w-0 flex-1 flex-col items-center gap-1 text-center"
          >
            <span
              className={cn(
                'h-1.5 w-full rounded-full',
                blocked ? 'bg-danger' : done || active ? 'bg-brand' : 'bg-muted',
              )}
              aria-hidden="true"
            />
            <span
              className={cn(
                'inline-flex items-center gap-1 text-caption font-bold',
                active || blocked ? 'text-foreground' : 'text-muted-foreground',
              )}
            >
              {done ? (
                <Check className="size-3.5 text-brand" aria-hidden="true" />
              ) : blocked ? (
                <X className="size-3.5 text-danger" aria-hidden="true" />
              ) : null}
              {blocked ? 'Refusée' : step.label}
            </span>
          </li>
        )
      })}
    </ol>
  )
}
