import { TrendingUp } from 'lucide-react'
import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'

import { Avatar } from '@/components/common/Avatar'
import { BackLink } from '@/components/common/BackLink'
import { EmptyState } from '@/components/common/EmptyState'
import { PageHeader } from '@/components/common/PageHeader'
import { MarketPoolDetailCard } from '@/components/market/MarketPoolDetailCard'
import { MyPositionCard } from '@/components/market/MyPositionCard'
import { PositionSheet } from '@/components/market/PositionSheet'
import { StatusBadge } from '@/components/market/StatusBadge'
import { UpdateStateNotice } from '@/components/market/UpdateStateNotice'
import { WithdrawSheet } from '@/components/market/WithdrawSheet'
import { buttonVariants } from '@/components/ui/button'
import { useLocalStore } from '@/hooks/use-local-store'
import { getMarketPositions } from '@/lib/market-data'
import { marketPositionsStore } from '@/lib/market-positions-store'
import { getTempMarket, TEMP_MARKET_PARAMS } from '@/lib/placeholder-markets'
import { cn } from '@/lib/utils'
import { paths } from '@/routes/paths'

/**
 * Fiche événement cotes : un écran fixe (détail regroupé) + Participer en bas
 * qui ouvre directement la feuille de paiement OUI / NON.
 */
export function MarketEventPage() {
  const { eventId } = useParams()
  const market = getTempMarket(eventId)
  useLocalStore(marketPositionsStore)
  const [withdrawId, setWithdrawId] = useState<string | null>(null)
  const [payOpen, setPayOpen] = useState(false)

  if (!market) {
    return (
      <>
        <PageHeader
          title="Événement"
          leading={<BackLink to={paths.markets} label="Creator Market" history />}
        />
        <EmptyState
          icon={TrendingUp}
          title="Événement introuvable"
          description="Cet événement n’existe pas ou n’est plus disponible."
          action={
            <Link to={paths.markets} className={buttonVariants()}>
              Retour aux événements
            </Link>
          }
          className="py-20"
        />
      </>
    )
  }

  const canTakePosition =
    market.status === 'open' &&
    market.updateState !== 'suspended' &&
    market.poolState === 'covered'
  const myPositions = getMarketPositions(market.id)
  const withdrawing = myPositions.find((position) => position.id === withdrawId) ?? null
  const blockedReason =
    market.status === 'upcoming'
      ? 'Les positions ouvriront avec l’événement.'
      : market.status === 'closed'
        ? 'Événement terminé : positions closes.'
        : market.updateState === 'suspended'
          ? 'Calcul suspendu : positions en pause.'
          : 'Liquidité limitée : nouvelles positions bloquées.'

  return (
    <div className="event-detail-screen bg-background">
      <PageHeader
        title="Événement"
        leading={<BackLink to={paths.markets} label="Creator Market" history />}
      />

      <div className="event-detail-scroll">
        <section className="flex items-center gap-3 px-4 py-3">
          <Link
            to={paths.creator(market.creatorHandle)}
            aria-label={`Page de ${market.creatorName}`}
          >
            <Avatar name={market.creatorName} src={market.creatorAvatar} size="lg" />
          </Link>
          <div className="min-w-0 flex-1">
            <h2 className="truncate text-title font-extrabold">{market.creatorName}</h2>
            <Link
              to={paths.creator(market.creatorHandle)}
              className="block truncate text-body text-muted-foreground hover:underline"
            >
              @{market.creatorHandle}
            </Link>
            <p className="truncate text-caption text-muted-foreground">{market.title}</p>
          </div>
          <StatusBadge status={market.status} />
        </section>

        <div className="space-y-3 px-4 pb-4">
          <UpdateStateNotice market={market} params={TEMP_MARKET_PARAMS} />
          <MarketPoolDetailCard market={market} />

          {myPositions.length > 0 ? (
            <div className="space-y-2">
              <p className="text-[12px] font-semibold text-muted-foreground">
                Ma position
              </p>
              {myPositions.map((position) => (
                <MyPositionCard
                  key={position.id}
                  position={position}
                  market={market}
                  onWithdraw={(item) => setWithdrawId(item.id)}
                />
              ))}
            </div>
          ) : null}
        </div>
      </div>

      <footer className={cn('event-detail-cta pb-safe px-4 pt-3')}>
        {canTakePosition ? (
          <button
            type="button"
            onClick={() => setPayOpen(true)}
            className="inline-flex h-12 w-full items-center justify-center rounded-full bg-primary text-[15px] font-extrabold text-primary-foreground shadow-lg transition-transform active:scale-[0.98]"
          >
            Participer · OUI / NON
          </button>
        ) : (
          <p className="rounded-2xl bg-muted px-4 py-3 text-center text-[13px] font-semibold text-muted-foreground">
            {blockedReason}
          </p>
        )}
      </footer>

      <PositionSheet
        market={payOpen ? market : null}
        onClose={() => setPayOpen(false)}
      />
      <WithdrawSheet
        position={withdrawing}
        market={withdrawing ? market : null}
        onClose={() => setWithdrawId(null)}
      />
    </div>
  )
}
