import { Dices, Ticket } from 'lucide-react'

import { LotteryMarketingCard } from '@/components/events/participation/LotteryMarketingCard'
import { ParticipationSteps } from '@/components/events/participation/ParticipationSteps'
import { formatNumber, formatPrice } from '@/lib/format'
import { lotteryValueBreakdown } from '@/lib/lottery-rules'
import {
  formatLotteryTicketNumber,
  lotteryTotalTicketSlots,
  lotteryWinningTickets,
  sampleLotteryDrawTickets,
} from '@/lib/lottery-tickets'
import type { MyLotteryTicket } from '@/lib/lottery-tickets-store'
import {
  formatDateTime,
  getParticipationSteps,
} from '@/lib/participation'
import type { EventState, MarketEvent } from '@/types/event'

interface LotteryJourneyProps {
  event: MarketEvent
  state: EventState
  now: number
  /** Tickets émis pour l’utilisateur connecté (démo locale). */
  myTickets?: readonly MyLotteryTicket[]
}

/**
 * Parcours loterie marketing détaillé : étapes, cartes à numéros, tirage en fin de session.
 */
export function LotteryJourney({
  event,
  state,
  myTickets = [],
}: LotteryJourneyProps) {
  if (!event.lottery) return null

  const lottery = lotteryValueBreakdown(event.lottery)
  const steps = getParticipationSteps(event, state)
  const pool = sampleLotteryDrawTickets(event, state === 'ended' ? 12 : 6)
  const winners = lotteryWinningTickets(lottery, pool)
  const totalSlots = lotteryTotalTicketSlots(lottery)
  const ticketsIssuedEstimate = Math.min(
    event.participants * lottery.entriesPerPerson,
    totalSlots,
  )
  const ended = state === 'ended'
  const awarded = lottery.phase === 'awarded'

  return (
    <div className="space-y-4">
      {steps ? (
        <section className="rounded-xl border border-white/10 bg-[#1a1a1a] p-4">
          <h3 className="mb-2 text-body font-bold">Parcours de la campagne</h3>
          <ParticipationSteps steps={steps.steps} current={steps.current} />
        </section>
      ) : null}

      <section className="space-y-2 rounded-xl border border-white/10 bg-[#1a1a1a] p-4">
        <h3 className="flex items-center gap-2 text-body font-bold">
          <Ticket className="size-4 text-gold" aria-hidden="true" />
          Tickets inscrits au tirage
        </h3>
        <p className="text-caption text-white/70">
          Chaque participation reçoit {formatNumber(lottery.entriesPerPerson)} numéro
          {lottery.entriesPerPerson > 1 ? 's' : ''} de ticket (chances auto selon la
          valeur du produit). Le tirage de fin de session se fait uniquement sur ces
          numéros.
        </p>
        <dl className="mt-2 space-y-1.5 text-body">
          <div className="flex justify-between gap-3">
            <dt className="text-white/65">Tickets émis (estim.)</dt>
            <dd className="font-bold tabular-nums">
              {formatNumber(ticketsIssuedEstimate)} / {formatNumber(totalSlots)}
            </dd>
          </div>
          <div className="flex justify-between gap-3">
            <dt className="text-white/65">Valeur du produit</dt>
            <dd className="font-bold">{formatPrice(lottery.prizeValue)}</dd>
          </div>
          <div className="flex justify-between gap-3">
            <dt className="text-white/65">Mise totale (cible)</dt>
            <dd className="font-bold">
              {lottery.entryFee > 0 ? formatPrice(lottery.totalStake) : 'Gratuit'}
            </dd>
          </div>
        </dl>
      </section>

      {myTickets.length > 0 ? (
        <section className="space-y-2">
          <h3 className="text-body font-bold">Vos tickets</h3>
          <div className="grid gap-2 sm:grid-cols-2">
            {myTickets.map((t) => (
              <LotteryMarketingCard
                key={t.id}
                prizeName={lottery.prizeName}
                highlight="mine"
                ticket={{
                  number: t.number,
                  holderLabel: 'Vous',
                  winner: winners.some((w) => w.number === t.number),
                }}
              />
            ))}
          </div>
        </section>
      ) : null}

      {!ended && pool.length > 0 ? (
        <section className="space-y-2">
          <h3 className="text-body font-bold">Cartes loterie (échantillon)</h3>
          <div className="grid gap-2 sm:grid-cols-2">
            {pool.slice(0, 4).map((ticket) => (
              <LotteryMarketingCard
                key={ticket.number}
                ticket={ticket}
                prizeName={lottery.prizeName}
              />
            ))}
          </div>
        </section>
      ) : null}

      {ended ? (
        <section className="space-y-3 rounded-xl border border-white/10 bg-[#1a1a1a] p-4">
          <h3 className="flex items-center gap-2 text-body font-bold">
            <Dices className="size-4 text-gold" aria-hidden="true" />
            Tirage de fin de session
          </h3>
          <p className="text-caption text-white/70">
            {formatDateTime(lottery.drawAt)}. Le serveur tire au sort parmi les numéros
            de tickets inscrits — pas parmi les noms. {lottery.drawMethod}
          </p>

          <ol className="space-y-2 text-body text-white/80">
            <li>
              <span className="font-bold text-white">1. Clôture</span> — liste des
              tickets figée ({formatNumber(ticketsIssuedEstimate)} numéros).
            </li>
            <li>
              <span className="font-bold text-white">2. Tirage</span> —{' '}
              {lottery.winnerSlots} numéro
              {lottery.winnerSlots > 1 ? 's' : ''} gagnant
              {lottery.winnerSlots > 1 ? 's' : ''} parmi les cartes.
            </li>
            <li>
              <span className="font-bold text-white">3. Annonce</span> — cartes gagnantes
              publiées ci-dessous
              {lottery.proofRef ? ` · preuve ${lottery.proofRef}` : ''}.
            </li>
          </ol>

          {awarded && winners.length > 0 ? (
            <div className="space-y-2 pt-1">
              <p className="text-caption font-bold text-gold">
                Ticket{winners.length > 1 ? 's' : ''} gagnant
                {winners.length > 1 ? 's' : ''}
              </p>
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
              {lottery.winners?.length ? (
                <p className="text-caption text-white/70">
                  Annonce : {lottery.winners.join(' · ')}
                </p>
              ) : null}
            </div>
          ) : (
            <p className="rounded-lg bg-white/5 px-3 py-2 text-caption text-white/75">
              Tirage en cours de traitement. Les numéros gagnants apparaîtront sur les
              cartes loterie marketing.
            </p>
          )}

          {pool.length > 0 ? (
            <div className="space-y-2 pt-1">
              <p className="text-caption font-bold text-white/80">
                Numéros inscrits (extrait)
              </p>
              <ul className="flex flex-wrap gap-1.5">
                {pool.map((ticket) => {
                  const isWin = winners.some((w) => w.number === ticket.number)
                  return (
                    <li
                      key={ticket.number}
                      className={
                        isWin
                          ? 'rounded-md bg-gold/25 px-2 py-1 font-mono text-caption font-bold text-gold'
                          : 'rounded-md bg-white/10 px-2 py-1 font-mono text-caption text-white/80'
                      }
                    >
                      {formatLotteryTicketNumber(ticket.number)}
                    </li>
                  )
                })}
              </ul>
            </div>
          ) : null}
        </section>
      ) : null}
    </div>
  )
}
