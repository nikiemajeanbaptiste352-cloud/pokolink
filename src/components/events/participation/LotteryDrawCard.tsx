import { Dices, ShieldCheck } from 'lucide-react'
import type { ReactNode } from 'react'

import { InfoCard, InfoRow } from '@/components/events/participation/InfoCard'
import { LotteryMarketingCard } from '@/components/events/participation/LotteryMarketingCard'
import { formatNumber, formatPrice } from '@/lib/format'
import {
  LOTTERY_CHANCE_UNIT_FCFA,
  lotteryValueBreakdown,
} from '@/lib/lottery-rules'
import {
  formatLotteryTicketNumber,
  lotteryWinningTickets,
  sampleLotteryDrawTickets,
} from '@/lib/lottery-tickets'
import { formatDateTime } from '@/lib/participation'
import type { MarketEvent } from '@/types/event'

function DrawStep({
  index,
  title,
  children,
}: {
  index: number
  title: string
  children: ReactNode
}) {
  return (
    <li className="flex gap-3">
      <span
        aria-hidden="true"
        className="mt-0.5 grid size-7 shrink-0 place-items-center rounded-full bg-muted text-caption font-bold"
      >
        {index}
      </span>
      <div className="min-w-0 flex-1 pb-3">
        <p className="text-body font-bold">{title}</p>
        <p className="text-body text-muted-foreground">{children}</p>
      </div>
    </li>
  )
}

/**
 * Tirage de fin de session : uniquement sur les numéros de tickets
 * inscrits sur les cartes loterie marketing.
 */
export function LotteryDrawCard({ event }: { event: MarketEvent }) {
  if (!event.lottery) return null
  const lottery = lotteryValueBreakdown(event.lottery)
  const pool = sampleLotteryDrawTickets(event, 12)
  const winners = lotteryWinningTickets(lottery, pool)
  const winnersLabel = `${lottery.winnerSlots} ticket${lottery.winnerSlots > 1 ? 's' : ''} gagnant${lottery.winnerSlots > 1 ? 's' : ''}`

  return (
    <InfoCard icon={Dices} title="Tirage sur numéros de tickets">
      <p className="pt-2 pb-3 text-body text-muted-foreground">
        En fin de session, le serveur tire au sort parmi les numéros inscrits sur les
        cartes loterie marketing ({LOTTERY_CHANCE_UNIT_FCFA.toLocaleString('fr-FR')}{' '}
        FCFA de produit → 1 chance / ticket). L’organisateur ne choisit pas les
        gagnants.
      </p>

      <ol aria-label="Déroulement du tirage">
        <DrawStep index={1} title="Clôture — tickets figés">
          {formatDateTime(event.endsAt)}. Aucun nouveau numéro n’est accepté.
        </DrawStep>
        <DrawStep index={2} title="Tirage sur les numéros">
          {formatDateTime(lottery.drawAt)}. {lottery.drawMethod}
        </DrawStep>
        <DrawStep index={3} title="Cartes gagnantes publiées">
          Les numéros tirés sont mis en avant sur les cartes loterie marketing.
        </DrawStep>
      </ol>

      <dl>
        <InfoRow
          label="Valeur du produit"
          value={formatPrice(lottery.prizeValue)}
          emphasis="strong"
        />
        <InfoRow
          label="Tickets gagnants possibles"
          value={winnersLabel}
          emphasis="strong"
        />
        <InfoRow
          label="Chances / personne"
          value={`${formatNumber(lottery.entriesPerPerson)} tickets (auto)`}
        />
        <InfoRow
          label="Preuve du tirage"
          value={
            lottery.proofRef ? (
              <span className="inline-flex items-center gap-1.5">
                <ShieldCheck className="size-4 shrink-0 text-brand" aria-hidden="true" />
                {lottery.proofRef}
              </span>
            ) : (
              'Publiée après le tirage'
            )
          }
        />
      </dl>

      {winners.length > 0 ? (
        <div className="mt-3 space-y-2">
          <p className="text-body font-bold">Cartes gagnantes</p>
          <div className="grid gap-2 sm:grid-cols-2">
            {winners.map((ticket) => (
              <LotteryMarketingCard
                key={ticket.number}
                ticket={{ ...ticket, winner: true }}
                prizeName={lottery.prizeName}
                highlight="winner"
              />
            ))}
          </div>
        </div>
      ) : null}

      {pool.length > 0 ? (
        <div className="mt-3 space-y-2">
          <p className="text-body font-bold">Numéros inscrits (extrait)</p>
          <ul className="flex flex-wrap gap-1.5">
            {pool.map((ticket) => {
              const isWin = winners.some((w) => w.number === ticket.number)
              return (
                <li
                  key={ticket.number}
                  className={
                    isWin
                      ? 'rounded-md bg-gold/20 px-2 py-1 font-mono text-caption font-bold text-gold'
                      : 'rounded-md bg-muted px-2 py-1 font-mono text-caption'
                  }
                >
                  {formatLotteryTicketNumber(ticket.number)}
                </li>
              )
            })}
          </ul>
        </div>
      ) : null}
    </InfoCard>
  )
}
