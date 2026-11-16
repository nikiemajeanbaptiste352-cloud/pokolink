import { Clock, Droplets, Eye, Users } from 'lucide-react'
import { Link } from 'react-router-dom'

import { Avatar } from '@/components/common/Avatar'
import { formatCount, formatPrice } from '@/lib/format'
import { TEMP_MARKET_PARAMS } from '@/lib/placeholder-markets'
import { paths } from '@/routes/paths'
import type { CreatorMarket } from '@/types/market'

import { formatCote } from './market-utils'
import { PoolStatus } from './PoolStatus'
import { Sparkline } from './Sparkline'
import { StatusBadge } from './StatusBadge'
import { TrendBadge } from './TrendBadge'

/** Carte d'un événement : créateur, cote actuelle, évolution et chiffres clés. */
export function MarketCard({ market }: { market: CreatorMarket }) {
  return (
    <Link
      to={paths.marketEvent(market.id)}
      className="block space-y-3 rounded-xl border bg-card p-4 shadow-card transition-colors hover:bg-muted"
    >
      <span className="flex items-center gap-3">
        <Avatar name={market.creatorName} src={market.creatorAvatar} size="lg" />
        <span className="min-w-0 flex-1">
          <span className="block truncate text-body font-bold">{market.creatorName}</span>
          <span className="block truncate text-caption text-muted-foreground">
            @{market.creatorHandle} · {market.title}
          </span>
        </span>
        <StatusBadge status={market.status} />
      </span>

      <span className="flex items-end gap-4">
        <span className="shrink-0">
          <span className="block text-caption text-muted-foreground">Cote actuelle</span>
          <span className="block text-headline leading-tight font-extrabold tabular-nums">
            {formatCote(market.cote)}
          </span>
        </span>
        <span className="min-w-0 flex-1">
          <Sparkline values={market.history} baseline={1} />
        </span>
        <TrendBadge market={market} />
      </span>

      {market.status === 'open' && market.updateState !== 'active' ? (
        <span className="block rounded-lg bg-warning/20 px-3 py-2 text-caption font-semibold text-foreground">
          {market.updateState === 'warmup'
            ? `Démarrage neutre : ${market.referencePeriodsDone} période${market.referencePeriodsDone > 1 ? 's' : ''} sur ${TEMP_MARKET_PARAMS.referencePeriods}`
            : 'Calcul suspendu : facteur figé'}
        </span>
      ) : null}

      {market.status === 'open' && market.poolState !== 'covered' ? (
        <PoolStatus
          compact
          poolState={market.poolState}
          coverageRatio={market.coverageRatio}
          className="rounded-lg bg-warning/20 px-3 py-2 text-foreground"
        />
      ) : null}

      <span className="flex flex-wrap gap-x-4 gap-y-1 text-caption text-muted-foreground">
        <span className="inline-flex items-center gap-1.5">
          <Droplets className="size-4" aria-hidden="true" />
          Pool {formatPrice(market.poolBalance)}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <Users className="size-4" aria-hidden="true" />
          {formatCount(market.participants)} participants
        </span>
        <span className="inline-flex items-center gap-1.5">
          <Eye className="size-4" aria-hidden="true" />
          {formatCount(market.validatedViews)} vues
        </span>
        <span className="inline-flex items-center gap-1.5">
          <Clock className="size-4" aria-hidden="true" />
          {market.timeLabel}
        </span>
      </span>
    </Link>
  )
}
