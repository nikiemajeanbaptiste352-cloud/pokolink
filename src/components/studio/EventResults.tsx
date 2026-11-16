import { Sparkline } from '@/components/market/Sparkline'
import { ProgressBar } from '@/components/studio/parts'
import { StatTile } from '@/components/pro/shared'
import { formatCount, formatNumber, formatPrice } from '@/lib/format'
import {
  CREATOR_EVENT_COMMISSION_RATE,
  getCreatorCommission,
  getEventCollected,
  getMaxCollection,
} from '@/lib/studio'
import type { StudioEvent } from '@/types/studio'

/** Part des participants qui ont réagi : indicatif, calculé d'après les chiffres reçus. */
function engagementRate(event: StudioEvent): string | null {
  const stats = event.stats
  if (!stats || stats.views <= 0) return null
  const reactions = stats.likes + stats.comments + stats.shares
  return `${((reactions / stats.views) * 100).toFixed(1).replace('.', ',')} %`
}

/** Chiffres d'un événement : audience, interactions, évolution des vues, coins vendus. */
export function EventResults({ event }: { event: StudioEvent }) {
  const stats = event.stats
  if (!stats) return null

  const rate = engagementRate(event)
  const hasViews = stats.views > 0 || stats.viewsSeries.length > 0
  const collection = getMaxCollection(event)
  const collected = getEventCollected(event)
  const commission = getCreatorCommission(event)
  const commissionPct = Math.round(CREATOR_EVENT_COMMISSION_RATE * 100)

  return (
    <div className="space-y-4">
      <dl className="grid grid-cols-2 gap-3">
        {hasViews ? (
          <StatTile label="Vues validées" value={formatCount(stats.views)} />
        ) : null}
        <StatTile label="Participants" value={formatCount(stats.participants)} />
        {hasViews ? (
          <>
            <StatTile label="J’aime" value={formatCount(stats.likes)} />
            <StatTile label="Commentaires" value={formatCount(stats.comments)} />
            <StatTile label="Partages" value={formatCount(stats.shares)} />
            <StatTile label="Réactions / vues" value={rate ?? '—'} />
          </>
        ) : null}
        {collected !== null ? (
          <StatTile label="Volume événement" value={formatPrice(collected)} />
        ) : null}
        {commission !== null ? (
          <StatTile
            label={`Votre commission (${commissionPct} %)`}
            value={formatPrice(commission)}
          />
        ) : null}
      </dl>

      {stats.viewsSeries.length >= 2 ? (
        <figure className="space-y-1 rounded-xl border bg-card p-3.5">
          <figcaption className="text-body font-semibold">
            Vues validées par période
          </figcaption>
          <Sparkline values={stats.viewsSeries} minSpan={1} />
          <p className="text-caption text-muted-foreground">
            Dernière période :{' '}
            {formatNumber(stats.viewsSeries[stats.viewsSeries.length - 1] ?? 0)} vues.
            Maximum sur une période : {formatNumber(Math.max(...stats.viewsSeries))}.
          </p>
        </figure>
      ) : null}

      {event.kind === 'coins' && stats.soldCoins !== undefined && event.maxCoins ? (
        <div className="space-y-2 rounded-xl border bg-card p-3.5">
          <p className="flex items-baseline justify-between gap-3 text-body">
            <span className="font-semibold">Coins vendus</span>
            <span>
              {formatNumber(stats.soldCoins)} / {formatNumber(event.maxCoins)}
            </span>
          </p>
          <ProgressBar
            value={stats.soldCoins}
            max={event.maxCoins}
            label="Coins vendus"
          />
          {collection !== null ? (
            <p className="text-caption text-muted-foreground">
              Capacité d’achat de {formatPrice(collection)} si tous les coins sont vendus.
              Votre revenu = {commissionPct} % du volume réellement collecté.
            </p>
          ) : null}
        </div>
      ) : null}
    </div>
  )
}
