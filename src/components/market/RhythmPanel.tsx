import { cn } from '@/lib/utils'
import type { CreatorMarket } from '@/types/market'

import { formatRate, formatSignal } from './market-utils'

function Bar({
  label,
  value,
  max,
  className,
}: {
  label: string
  value: number
  max: number
  className: string
}) {
  const width = max > 0 ? Math.min(Math.max(value / max, 0), 1) * 100 : 0
  return (
    <div className="space-y-1">
      <div className="flex items-baseline justify-between gap-3 text-body">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-bold tabular-nums">{formatRate(value)}</span>
      </div>
      <div aria-hidden="true" className="h-2 overflow-hidden rounded-full bg-muted">
        <div
          className={cn('h-full rounded-full', className)}
          style={{ width: `${width}%` }}
        />
      </div>
    </div>
  )
}

function getSentence(market: CreatorMarket): string {
  if (market.status === 'upcoming') {
    return 'Le rythme des vues sera comparé à la moyenne dès l’ouverture.'
  }
  if (market.updateState === 'warmup') {
    return 'La moyenne de référence n’est pas encore fiable : aucune comparaison pour le moment.'
  }
  const closed = market.status === 'closed'
  const suspended = market.updateState === 'suspended'
  const prefix = closed
    ? 'À la clôture, le rythme '
    : suspended
      ? 'Aux dernières valeurs fiables, le rythme '
      : 'Le rythme actuel '
  if (market.signal === 0) {
    return `${prefix}était identique à la moyenne : le facteur reste stable.`
  }
  const above = market.signal > 0
  const effect =
    closed || suspended
      ? ''
      : ` : le facteur ${above ? 'monte' : 'baisse'} à la prochaine mise à jour`
  return `${prefix}${closed || suspended ? 'était' : 'est'} ${above ? 'supérieur' : 'inférieur'} à la moyenne${effect}.`
}

/** Compare le rythme récent des vues à la moyenne de référence et affiche le signal. */
export function RhythmPanel({ market }: { market: CreatorMarket }) {
  const hasData = market.status !== 'upcoming' && market.updateState !== 'warmup'
  const max = Math.max(market.recentRate, market.referenceRate)

  return (
    <section
      aria-label="Rythme des vues"
      className="space-y-3 rounded-2xl border bg-card p-4 shadow-card"
    >
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-body font-bold">Rythme des vues validées</h3>
        {hasData ? (
          <p className="text-caption text-muted-foreground">
            Signal{' '}
            <strong className="text-body text-foreground tabular-nums">
              {formatSignal(market.signal)}
            </strong>
          </p>
        ) : null}
      </div>

      {hasData ? (
        <div className="space-y-3">
          <Bar
            label="Période récente"
            value={market.recentRate}
            max={max}
            className="bg-brand"
          />
          <Bar
            label="Moyenne de référence"
            value={market.referenceRate}
            max={max}
            className="bg-muted-foreground/60"
          />
        </div>
      ) : null}

      <p className="text-body text-muted-foreground">{getSentence(market)}</p>
    </section>
  )
}
