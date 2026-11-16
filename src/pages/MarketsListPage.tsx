import { ChartCandlestick, Search } from 'lucide-react'
import { useState } from 'react'

import { BackLink } from '@/components/common/BackLink'
import { EmptyState } from '@/components/common/EmptyState'
import { FilterChips } from '@/components/common/FilterChips'
import { IconLink } from '@/components/common/IconLink'
import { PageHeader } from '@/components/common/PageHeader'
import { SectionDivider } from '@/components/common/SectionDivider'
import { SectionHeader } from '@/components/common/SectionHeader'
import { CoinMarketsView } from '@/components/market/coins/CoinMarketsView'
import { MarketCard } from '@/components/market/MarketCard'
import { MyPositionCard } from '@/components/market/MyPositionCard'
import { WithdrawSheet } from '@/components/market/WithdrawSheet'
import { useLocalStore } from '@/hooks/use-local-store'
import { getMarketPositions } from '@/lib/market-data'
import { marketPositionsStore } from '@/lib/market-positions-store'
import { TEMP_MARKETS } from '@/lib/placeholder-markets'
import { paths } from '@/routes/paths'
import type { MarketStatus } from '@/types/market'

type Filter = 'all' | MarketStatus

const FILTERS: readonly { id: Filter; label: string }[] = [
  { id: 'all', label: 'Tous' },
  { id: 'open', label: 'En cours' },
  { id: 'upcoming', label: 'À venir' },
  { id: 'closed', label: 'Terminés' },
]

const STEPS = [
  'Choisissez un événement lié à un créateur.',
  'Prenez position : OUI si vous pensez que le facteur va monter, NON s’il va baisser.',
  'Le facteur monte quand le rythme des vues validées accélère, et baisse quand il ralentit. Il bouge peu à chaque mise à jour et reste entre 0,5 et 1,5.',
  'Au retrait, vous êtes payé dans la limite des fonds du pool. Si le pool ne couvre pas tout, tous les participants reçoivent le même pourcentage et les nouvelles positions sont bloquées.',
] as const

type Kind = 'factor' | 'coins'

const KINDS: readonly { id: Kind; label: string }[] = [
  { id: 'factor', label: 'Cotes (OUI / NON)' },
  { id: 'coins', label: 'Coins' },
]

/** Creator Performance Market : deux types d'événements, les cotes et les coins. */
export function MarketsListPage() {
  const [kind, setKind] = useState<Kind>('factor')

  return (
    <>
      <PageHeader
        title="Événements"
        leading={<BackLink to={paths.markets} label="Fil vidéo" />}
        actions={<IconLink to={paths.search} icon={Search} label="Rechercher" />}
      />

      <FilterChips
        label="Type d’événement"
        items={KINDS}
        value={kind}
        onChange={setKind}
        className="pb-1"
      />

      {kind === 'coins' ? <CoinMarketsView /> : <FactorMarketsView />}
    </>
  )
}

/** Événements dont la cote suit les performances d'un créateur (OUI / NON). */
function FactorMarketsView() {
  const [filter, setFilter] = useState<Filter>('all')
  const [withdrawId, setWithdrawId] = useState<string | null>(null)
  useLocalStore(marketPositionsStore)
  const myPositions = getMarketPositions().flatMap((position) => {
    const market = TEMP_MARKETS.find((m) => m.id === position.marketId)
    return market ? [{ position, market }] : []
  })
  const withdrawing = myPositions.find((item) => item.position.id === withdrawId)
  const markets =
    filter === 'all' ? TEMP_MARKETS : TEMP_MARKETS.filter((m) => m.status === filter)

  return (
    <>
      <FilterChips
        label="Filtrer les événements"
        items={FILTERS}
        value={filter}
        onChange={setFilter}
      />

      <section aria-label="Événements" className="py-4">
        {markets.length === 0 ? (
          <EmptyState
            icon={ChartCandlestick}
            tone="info"
            title="Aucun événement"
            description="Aucun événement ne correspond à ce filtre."
            className="py-10"
          />
        ) : (
          <ul className="space-y-3 px-4">
            {markets.map((market) => (
              <li key={market.id}>
                <MarketCard market={market} />
              </li>
            ))}
          </ul>
        )}
      </section>
      <SectionDivider />

      <section className="space-y-3 py-4">
        <SectionHeader title="Comment ça marche" />
        <ol className="space-y-3 px-4">
          {STEPS.map((step, index) => (
            <li key={step} className="flex items-start gap-3 text-body">
              <span
                aria-hidden="true"
                className="grid size-7 shrink-0 place-items-center rounded-full bg-primary text-caption font-bold text-primary-foreground"
              >
                {index + 1}
              </span>
              {step}
            </li>
          ))}
        </ol>
      </section>
      <SectionDivider />

      <section className="space-y-3 py-4">
        <SectionHeader title="Mes événements participés" />
        {myPositions.length === 0 ? (
          <EmptyState
            icon={ChartCandlestick}
            title="Aucune participation"
            description="Prenez une position OUI ou NON : l’événement apparaîtra ici."
            className="py-6"
          />
        ) : (
          <ul className="space-y-3 px-4">
            {myPositions.map(({ position, market }) => (
              <li key={position.id}>
                <MyPositionCard
                  position={position}
                  market={market}
                  showEventLink
                  onWithdraw={(item) => setWithdrawId(item.id)}
                />
              </li>
            ))}
          </ul>
        )}
      </section>

      <WithdrawSheet
        position={withdrawing?.position ?? null}
        market={withdrawing?.market ?? null}
        onClose={() => setWithdrawId(null)}
      />
    </>
  )
}
