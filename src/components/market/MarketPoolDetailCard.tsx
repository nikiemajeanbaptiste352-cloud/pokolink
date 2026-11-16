import { ArrowDownLeft, ArrowUpRight, Clock, Eye, Users } from 'lucide-react'

import {
  MARKET_CREATOR_COMMISSION_RATE,
  MARKET_PLATFORM_COMMISSION_RATE,
  marketCreatorCommission,
  marketPlatformCommission,
} from '@/lib/market-commissions'
import { formatCount, formatPrice } from '@/lib/format'
import { cn } from '@/lib/utils'
import type { CreatorMarket, MarketPoolFlowEntry } from '@/types/market'

import {
  formatCote,
  formatCoverage,
  formatPercent,
  getTrend,
  POOL_LABEL,
} from './market-utils'
import { Sparkline } from './Sparkline'
import { TrendBadge } from './TrendBadge'

function Row({
  label,
  value,
  strong,
}: {
  label: string
  value: string
  strong?: boolean
}) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <dt className="text-body text-muted-foreground">{label}</dt>
      <dd
        className={cn(
          'text-body tabular-nums',
          strong ? 'font-extrabold text-foreground' : 'font-semibold',
        )}
      >
        {value}
      </dd>
    </div>
  )
}

function relativeFlowTime(at: number): string {
  const minutes = Math.max(0, Math.round((Date.now() - at) / 60_000))
  if (minutes < 1) return 'à l’instant'
  if (minutes < 60) return `il y a ${minutes} min`
  const hours = Math.round(minutes / 60)
  if (hours < 24) return `il y a ${hours} h`
  return `il y a ${Math.round(hours / 24)} j`
}

function FlowRow({ entry }: { entry: MarketPoolFlowEntry }) {
  const stake = entry.kind === 'stake'
  const Icon = stake ? ArrowUpRight : ArrowDownLeft
  return (
    <li className="flex items-start gap-2.5 py-2">
      <span
        className={cn(
          'mt-0.5 grid size-8 shrink-0 place-items-center rounded-full',
          stake ? 'bg-primary/15 text-primary' : 'bg-muted text-muted-foreground',
        )}
      >
        <Icon className="size-4" aria-hidden="true" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-body font-semibold">{entry.label}</p>
        <p className="text-caption text-muted-foreground">{relativeFlowTime(entry.at)}</p>
      </div>
      <p
        className={cn(
          'shrink-0 text-body font-bold tabular-nums',
          stake ? 'text-primary' : 'text-foreground',
        )}
      >
        {stake ? '+' : '−'}
        {formatPrice(entry.amount)}
      </p>
    </li>
  )
}

/**
 * Fiche événement regroupée : facteur + %, pool, commissions créateur / plateforme,
 * participants et flux (mises / retraits).
 */
export function MarketPoolDetailCard({
  market,
  compact,
  className,
}: {
  market: CreatorMarket
  /** Version courte pour feuille (moins de lignes de flux). */
  compact?: boolean
  className?: string
}) {
  const creatorFee = marketCreatorCommission(market.poolCollected)
  const platformFee = marketPlatformCommission(market.poolCollected)
  const { trend, ratio } = getTrend(market)
  const share = (value: number) =>
    market.poolCollected > 0 ? `${(value / market.poolCollected) * 100}%` : '0%'
  const flow = market.poolFlow ?? []
  const shownFlow = compact ? flow.slice(0, 3) : flow.slice(0, 6)
  const changeLabel =
    trend === 'flat'
      ? 'Stable depuis l’ouverture'
      : trend === 'up'
        ? `Hausse ${formatPercent(ratio)} depuis l’ouverture`
        : `Baisse ${formatPercent(ratio)} depuis l’ouverture`

  return (
    <section
      aria-label="Détail de l’événement"
      className={cn('space-y-4 rounded-2xl border bg-card p-4 shadow-card', className)}
    >
      <div className="flex items-end justify-between gap-3">
        <div className="min-w-0">
          <p className="text-caption text-muted-foreground">Facteur actuel</p>
          <p className="text-4xl leading-none font-extrabold tabular-nums">
            {formatCote(market.cote)}
          </p>
          <p
            className={cn(
              'mt-1.5 text-body font-bold tabular-nums',
              trend === 'up' && 'text-brand',
              trend === 'down' && 'text-danger',
              trend === 'flat' && 'text-muted-foreground',
            )}
          >
            {changeLabel}
          </p>
          <p className="mt-0.5 text-caption text-muted-foreground">
            Départ {formatCote(market.openingCote)}
          </p>
        </div>
        <TrendBadge market={market} className="shrink-0" />
      </div>

      {!compact ? (
        <div className="space-y-1">
          <Sparkline values={market.history} baseline={1} className="h-14" />
        </div>
      ) : null}

      <div className="grid grid-cols-2 gap-2">
        <div className="rounded-xl bg-muted/70 px-3 py-2.5">
          <p className="text-caption text-muted-foreground">Solde du pool</p>
          <p className="text-title font-extrabold tabular-nums">
            {formatPrice(market.poolBalance)}
          </p>
        </div>
        <div className="rounded-xl bg-muted/70 px-3 py-2.5">
          <p className="flex items-center gap-1 text-caption text-muted-foreground">
            <Users className="size-3.5" aria-hidden="true" />
            Participants
          </p>
          <p className="text-title font-extrabold tabular-nums">
            {formatCount(market.participants)}
          </p>
        </div>
      </div>

      <div
        aria-hidden="true"
        className="flex h-2.5 overflow-hidden rounded-full bg-muted"
      >
        <span className="bg-muted-foreground/55" style={{ width: share(market.poolPaid) }} />
        <span className="bg-brand" style={{ width: share(market.poolBalance) }} />
      </div>

      <dl className="space-y-1.5">
        <Row label="Mises collectées" value={formatPrice(market.poolCollected)} />
        <Row label="Retraits payés" value={formatPrice(market.poolPaid)} />
        <Row
          label={`Commission créateur (${Math.round(MARKET_CREATOR_COMMISSION_RATE * 100)} %)`}
          value={formatPrice(creatorFee)}
        />
        <Row
          label={`Commission plateforme (${Math.round(MARKET_PLATFORM_COMMISSION_RATE * 100)} %)`}
          value={formatPrice(platformFee)}
        />
        <div className="border-t pt-2">
          <Row
            label="Couverture"
            value={`${POOL_LABEL[market.poolState]} · ${formatCoverage(market.coverageRatio)}`}
            strong
          />
        </div>
      </dl>

      {!compact ? (
        <p className="flex flex-wrap gap-x-3 gap-y-1 text-caption text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <Eye className="size-3.5" aria-hidden="true" />
            {formatCount(market.validatedViews)} vues
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Clock className="size-3.5" aria-hidden="true" />
            {market.timeLabel}
          </span>
        </p>
      ) : null}

      {shownFlow.length > 0 ? (
        <div className="border-t pt-2">
          <p className="mb-1 text-caption font-semibold text-muted-foreground">
            Flux du pool
          </p>
          <ul className="divide-y">
            {shownFlow.map((entry) => (
              <FlowRow key={entry.id} entry={entry} />
            ))}
          </ul>
        </div>
      ) : (
        <p className="border-t pt-2 text-caption text-muted-foreground">
          Aucun mouvement récent sur ce pool.
        </p>
      )}
    </section>
  )
}
