import { Coins } from 'lucide-react'
import { useState } from 'react'

import { EmptyState } from '@/components/common/EmptyState'
import { FilterChips } from '@/components/common/FilterChips'
import { SectionDivider } from '@/components/common/SectionDivider'
import { SectionHeader } from '@/components/common/SectionHeader'
import { useLocalStore } from '@/hooks/use-local-store'
import { coinPositionsStore } from '@/lib/coin-positions-store'
import { getCoinPositions } from '@/lib/market-data'
import { TEMP_COIN_EVENTS } from '@/lib/placeholder-coin-markets'

import { matchesCoinFilter, type CoinFilter } from './coin-utils'
import { CoinEventCard } from './CoinEventCard'
import { CoinPositionCard } from './CoinPositionCard'
import { CoinWithdrawSheet } from './CoinWithdrawSheet'

const FILTERS: readonly { id: CoinFilter; label: string }[] = [
  { id: 'all', label: 'Tous' },
  { id: 'purchases', label: 'Achats' },
  { id: 'running', label: 'En cours' },
  { id: 'ended', label: 'Terminés' },
]

const STEPS = [
  'Choisissez un événement et achetez des coins avant son début : leur nombre est limité.',
  'Une fois l’événement lancé, la valeur d’un coin suit la popularité de la vidéo : elle monte ou baisse avec l’indice, entre 50 % et 150 % du prix initial.',
  'Vous pouvez retirer vos gains pendant l’événement. Ils sont payés par le pool, c’est-à-dire l’argent des achats de coins, et jamais au-delà.',
  'La valeur affichée est théorique, pas garantie. Si le pool est épuisé, les derniers à retirer peuvent recevoir moins, voire rien.',
] as const

/** Liste du 2e type d'événement du Creator Market : les coins. */
export function CoinMarketsView() {
  const [filter, setFilter] = useState<CoinFilter>('all')
  const [withdrawId, setWithdrawId] = useState<string | null>(null)
  useLocalStore(coinPositionsStore)
  const events = TEMP_COIN_EVENTS.filter((event) => matchesCoinFilter(event, filter))
  const myPositions = getCoinPositions().flatMap((position) => {
    const event = TEMP_COIN_EVENTS.find((e) => e.id === position.eventId)
    return event ? [{ position, event }] : []
  })
  const withdrawing = myPositions.find((item) => item.position.id === withdrawId)

  return (
    <>
      <FilterChips
        label="Filtrer les événements coins"
        items={FILTERS}
        value={filter}
        onChange={setFilter}
      />

      <section aria-label="Événements coins" className="py-4">
        {events.length === 0 ? (
          <EmptyState
            icon={Coins}
            tone="info"
            title="Aucun événement"
            description="Aucun événement ne correspond à ce filtre."
            className="py-10"
          />
        ) : (
          <ul className="space-y-3 px-4">
            {events.map((event) => (
              <li key={event.id}>
                <CoinEventCard event={event} />
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
            icon={Coins}
            title="Aucune participation"
            description="Achetez des coins : l’événement apparaîtra ici."
            className="py-6"
          />
        ) : (
          <ul className="space-y-3 px-4">
            {myPositions.map(({ position, event }) => (
              <li key={position.id}>
                <CoinPositionCard
                  position={position}
                  event={event}
                  showEventLink
                  onWithdraw={(item) => setWithdrawId(item.id)}
                />
              </li>
            ))}
          </ul>
        )}
      </section>

      <CoinWithdrawSheet
        position={withdrawing?.position ?? null}
        event={withdrawing?.event ?? null}
        onClose={() => setWithdrawId(null)}
      />
    </>
  )
}
