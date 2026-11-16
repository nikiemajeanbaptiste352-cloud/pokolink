import { TrendingUp } from 'lucide-react'
import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'

import { Avatar } from '@/components/common/Avatar'
import { BackLink } from '@/components/common/BackLink'
import { EmptyState } from '@/components/common/EmptyState'
import { PageHeader } from '@/components/common/PageHeader'
import { BuyCoinsSheet } from '@/components/market/coins/BuyCoinsSheet'
import {
  coinValueHistory,
  formatCoins,
  formatIndex,
  getCoinPriceChange,
} from '@/components/market/coins/coin-utils'
import { CoinPoolPanel } from '@/components/market/coins/CoinPoolPanel'
import { CoinPositionCard } from '@/components/market/coins/CoinPositionCard'
import { CoinStateBadge } from '@/components/market/coins/CoinStateBadge'
import { CoinStateNotice } from '@/components/market/coins/CoinStateNotice'
import { CoinWithdrawSheet } from '@/components/market/coins/CoinWithdrawSheet'
import { formatPercent } from '@/components/market/market-utils'
import { Sparkline } from '@/components/market/Sparkline'
import { buttonVariants } from '@/components/ui/button'
import { useLocalStore } from '@/hooks/use-local-store'
import { coinPositionsStore } from '@/lib/coin-positions-store'
import { formatCount, formatPrice } from '@/lib/format'
import { getCoinPositions } from '@/lib/market-data'
import { getTempCoinEvent } from '@/lib/placeholder-coin-markets'
import { cn } from '@/lib/utils'
import { paths } from '@/routes/paths'

/**
 * Fiche événement coins : écran fixe regroupé + Participer en bas → feuille paiement.
 */
export function CoinEventPage() {
  const { eventId } = useParams()
  const event = getTempCoinEvent(eventId)
  useLocalStore(coinPositionsStore)
  const [withdrawId, setWithdrawId] = useState<string | null>(null)
  const [payOpen, setPayOpen] = useState(false)

  if (!event) {
    return (
      <>
        <PageHeader
          title="Événement"
          leading={
            <BackLink to={`${paths.markets}?type=coins`} label="Creator Market" history />
          }
        />
        <EmptyState
          icon={TrendingUp}
          title="Événement introuvable"
          description="Cet événement n’existe pas ou n’est plus disponible."
          action={
            <Link to={`${paths.markets}?type=coins`} className={buttonVariants()}>
              Retour au Creator Market
            </Link>
          }
          className="py-20"
        />
      </>
    )
  }

  const started = event.state !== 'purchases_open' && event.state !== 'purchases_closed'
  const canBuy = event.state === 'purchases_open'
  const positions = getCoinPositions(event.id)
  const withdrawing = positions.find((p) => p.id === withdrawId) ?? null
  const priceSeries = coinValueHistory(event)
  const { ratio } = getCoinPriceChange(event)
  const priceFlat = Math.abs(ratio) < 0.0005
  const blockedReason =
    event.state === 'purchases_closed'
      ? 'Tous les coins sont vendus : les achats sont fermés.'
      : 'Les achats sont fermés : possibles uniquement avant le début.'

  return (
    <div className="event-detail-screen bg-background">
      <PageHeader
        title="Événement"
        leading={
          <BackLink to={`${paths.markets}?type=coins`} label="Creator Market" history />
        }
      />

      <div className="event-detail-scroll">
        <section className="flex items-center gap-3 px-4 py-3">
          <Link
            to={paths.creator(event.creatorHandle)}
            aria-label={`Page de ${event.creatorName}`}
          >
            <Avatar name={event.creatorName} src={event.creatorAvatar} size="lg" />
          </Link>
          <div className="min-w-0 flex-1">
            <h2 className="truncate text-title font-extrabold">{event.creatorName}</h2>
            <Link
              to={paths.creator(event.creatorHandle)}
              className="block truncate text-body text-muted-foreground hover:underline"
            >
              @{event.creatorHandle}
            </Link>
            <p className="line-clamp-2 text-caption text-muted-foreground">{event.caption}</p>
          </div>
          <CoinStateBadge state={event.state} />
        </section>

        <div className="space-y-3 px-4 pb-4">
          <CoinStateNotice event={event} />

          <section
            aria-label="Prix du coin"
            className="space-y-3 rounded-2xl border bg-card p-4 shadow-card"
          >
            <div className="flex items-end justify-between gap-3">
              <div className="min-w-0">
                <p className="text-caption text-muted-foreground">
                  {started ? 'Valeur d’un coin' : 'Prix d’un coin'}
                </p>
                <p className="text-4xl leading-none font-extrabold tabular-nums">
                  {formatPrice(started ? event.coinValue : event.coinPrice)}
                </p>
                <p
                  className={cn(
                    'mt-1.5 text-body font-bold tabular-nums',
                    priceFlat && 'text-muted-foreground',
                    !priceFlat && ratio > 0 && 'text-brand',
                    !priceFlat && ratio < 0 && 'text-danger',
                  )}
                >
                  {priceFlat ? 'Stable' : formatPercent(ratio)}
                  <span className="ml-1.5 text-caption font-semibold text-muted-foreground">
                    · indice {formatIndex(event.index)}
                  </span>
                </p>
              </div>
              <Sparkline
                values={priceSeries}
                baseline={event.coinPrice}
                minSpan={Math.max(20, event.coinPrice * 0.2)}
                className="h-14 min-w-0 flex-1 basis-24"
              />
            </div>
            <p className="flex flex-wrap gap-x-3 gap-y-1 text-caption text-muted-foreground">
              <span>
                {formatCoins(event.soldCoins)}/{formatCoins(event.maxCoins)} vendus
              </span>
              <span>{formatCount(event.participants)} participants</span>
              <span>{event.startLabel}</span>
            </p>
          </section>

          <CoinPoolPanel event={event} />

          {positions.length > 0 ? (
            <div className="space-y-2">
              <p className="text-[12px] font-semibold text-muted-foreground">Mes coins</p>
              {positions.map((position) => (
                <CoinPositionCard
                  key={position.id}
                  position={position}
                  event={event}
                  onWithdraw={(item) => setWithdrawId(item.id)}
                />
              ))}
            </div>
          ) : null}
        </div>
      </div>

      <footer className="event-detail-cta pb-safe px-4 pt-3">
        {canBuy ? (
          <button
            type="button"
            onClick={() => setPayOpen(true)}
            className="inline-flex h-12 w-full items-center justify-center rounded-full bg-primary text-[15px] font-extrabold text-primary-foreground shadow-lg transition-transform active:scale-[0.98]"
          >
            Participer
          </button>
        ) : (
          <p className="rounded-2xl bg-muted px-4 py-3 text-center text-[13px] font-semibold text-muted-foreground">
            {blockedReason}
          </p>
        )}
      </footer>

      <BuyCoinsSheet
        event={payOpen ? event : null}
        onClose={() => setPayOpen(false)}
      />
      <CoinWithdrawSheet
        position={withdrawing}
        event={withdrawing ? event : null}
        onClose={() => setWithdrawId(null)}
      />
    </div>
  )
}
