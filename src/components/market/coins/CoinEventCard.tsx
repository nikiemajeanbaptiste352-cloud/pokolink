import { Clock, Coins, Users } from 'lucide-react'
import { Link } from 'react-router-dom'

import { Avatar } from '@/components/common/Avatar'
import { Sparkline } from '@/components/market/Sparkline'
import { formatPrice } from '@/lib/format'
import { paths } from '@/routes/paths'
import type { CoinEvent } from '@/types/coin-market'

import { formatCoins, formatIndex } from './coin-utils'
import { CoinStateBadge } from './CoinStateBadge'

/** Carte d'un événement « coins » : valeur du coin, indice, coins vendus, pool. */
export function CoinEventCard({ event }: { event: CoinEvent }) {
  const soldShare = event.maxCoins > 0 ? (event.soldCoins / event.maxCoins) * 100 : 0
  const started = event.state !== 'purchases_open' && event.state !== 'purchases_closed'

  return (
    <Link
      to={paths.coinEvent(event.id)}
      className="block space-y-3 rounded-xl border bg-card p-4 shadow-card transition-colors hover:bg-muted"
    >
      <span className="flex items-center gap-3">
        <Avatar name={event.creatorName} src={event.creatorAvatar} size="lg" />
        <span className="min-w-0 flex-1">
          <span className="block truncate text-body font-bold">{event.creatorName}</span>
          <span className="block truncate text-caption text-muted-foreground">
            @{event.creatorHandle} · {event.caption}
          </span>
        </span>
        <CoinStateBadge state={event.state} />
      </span>

      <span className="flex items-end gap-4">
        <span className="shrink-0">
          <span className="block text-caption text-muted-foreground">
            {started ? 'Valeur d’un coin' : 'Prix d’un coin'}
          </span>
          <span className="block text-headline leading-tight font-extrabold tabular-nums">
            {formatPrice(started ? event.coinValue : event.coinPrice)}
          </span>
        </span>
        {started ? (
          <span className="min-w-0 flex-1">
            <Sparkline values={event.indexHistory} baseline={100} minSpan={100} />
            <span className="block text-caption text-muted-foreground">
              Indice {formatIndex(event.index)} · départ à 100
            </span>
          </span>
        ) : null}
      </span>

      <span className="block space-y-1">
        <span className="flex items-baseline justify-between gap-2 text-caption">
          <span className="font-semibold">
            {formatCoins(event.soldCoins)} / {formatCoins(event.maxCoins)} coins vendus
          </span>
          <span className="text-muted-foreground">
            Pool {formatPrice(event.poolBalance)}
          </span>
        </span>
        <span
          role="meter"
          aria-label="Coins vendus"
          aria-valuemin={0}
          aria-valuemax={event.maxCoins}
          aria-valuenow={event.soldCoins}
          aria-valuetext={`${formatCoins(event.soldCoins)} coins vendus sur ${formatCoins(event.maxCoins)}`}
          className="block h-2 overflow-hidden rounded-full bg-muted"
        >
          <span
            aria-hidden="true"
            className="block h-full rounded-full bg-brand"
            style={{ width: `${soldShare}%` }}
          />
        </span>
      </span>

      <span className="flex flex-wrap gap-x-4 gap-y-1 text-caption text-muted-foreground">
        <span className="inline-flex items-center gap-1.5">
          <Users className="size-4" aria-hidden="true" />
          {event.participants} participants
        </span>
        <span className="inline-flex items-center gap-1.5">
          <Coins className="size-4" aria-hidden="true" />
          {formatPrice(event.coinPrice)} / coin
        </span>
        <span className="inline-flex items-center gap-1.5">
          <Clock className="size-4" aria-hidden="true" />
          {event.startLabel}
        </span>
      </span>
    </Link>
  )
}
