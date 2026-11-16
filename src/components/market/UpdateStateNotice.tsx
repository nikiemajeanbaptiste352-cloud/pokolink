import { CircleCheck, Hourglass, Pause, RefreshCw } from 'lucide-react'

import { cn } from '@/lib/utils'
import type { CreatorMarket, MarketParams } from '@/types/market'

import { formatCote } from './market-utils'

/** État du calcul du facteur : démarrage neutre, actif, suspendu, ou événement terminé. */
export function UpdateStateNotice({
  market,
  params,
}: {
  market: CreatorMarket
  params: MarketParams
}) {
  const every =
    params.updateEveryMinutes % 60 === 0
      ? params.updateEveryMinutes === 60
        ? 'toutes les heures'
        : `toutes les ${params.updateEveryMinutes / 60} h`
      : `toutes les ${params.updateEveryMinutes} min`

  let icon = RefreshCw
  let title = 'Facteur actif'
  let text = `Mis à jour ${every}${market.nextUpdateLabel ? ` · prochaine mise à jour ${market.nextUpdateLabel}` : ''}.`
  let tone = 'bg-muted'
  let progress: { done: number; total: number } | null = null

  if (market.status === 'upcoming') {
    icon = Hourglass
    title = 'Pas encore ouvert'
    text = `Le facteur démarrera à ${formatCote(market.openingCote)} à l’ouverture.`
  } else if (market.status === 'closed') {
    icon = CircleCheck
    title = 'Événement terminé'
    text = 'Le facteur n’évolue plus.'
  } else if (market.updateState === 'suspended') {
    icon = Pause
    title = 'Calcul suspendu'
    text = market.suspendedReason ?? 'Le facteur est figé.'
    tone = 'bg-warning/20'
  } else if (market.updateState === 'warmup') {
    icon = Hourglass
    title = 'Démarrage neutre'
    text = `Le facteur reste à ${formatCote(1)} tant que la moyenne de référence n’est pas fiable (${params.referencePeriods} périodes nécessaires).`
    progress = { done: market.referencePeriodsDone, total: params.referencePeriods }
  }

  const Icon = icon

  return (
    <div role="status" className={cn('flex items-start gap-3 rounded-xl p-3.5', tone)}>
      <Icon className="mt-0.5 size-5 shrink-0" aria-hidden="true" />
      <div className="min-w-0 flex-1 space-y-2">
        <p className="text-body font-bold">{title}</p>
        <p className="text-body">{text}</p>
        {progress ? (
          <div className="space-y-1">
            <div
              role="progressbar"
              aria-label="Périodes de référence écoulées"
              aria-valuemin={0}
              aria-valuemax={progress.total}
              aria-valuenow={progress.done}
              aria-valuetext={`${progress.done} périodes sur ${progress.total}`}
              className="h-2 overflow-hidden rounded-full bg-background"
            >
              <div
                className="h-full rounded-full bg-brand"
                style={{ width: `${(progress.done / progress.total) * 100}%` }}
              />
            </div>
            <p className="text-caption">
              {progress.done} période{progress.done > 1 ? 's' : ''} sur {progress.total}
            </p>
          </div>
        ) : null}
      </div>
    </div>
  )
}
