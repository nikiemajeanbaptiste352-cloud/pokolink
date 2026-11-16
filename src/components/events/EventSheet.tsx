import { Gift, Timer, Users, X } from 'lucide-react'
import { useEffect, useId, useRef, useState, useSyncExternalStore } from 'react'
import { createPortal } from 'react-dom'
import { Avatar } from '@/components/common/Avatar'
import { EventCountdown } from '@/components/events/EventCountdown'
import { EventKindBadge, EventStateBadge } from '@/components/events/EventKindBadge'
import { OfferPrice } from '@/components/events/OfferPrice'
import { LotteryJourney } from '@/components/events/participation/LotteryJourney'
import { StockBar } from '@/components/events/StockBar'
import { Button } from '@/components/ui/button'
import { WalletPaymentForm } from '@/components/wallet/WalletPaymentForm'
import { useProfile } from '@/hooks/use-profile'
import { addEventParticipation } from '@/lib/event-participation-store'
import {
  EVENT_KINDS,
  EVENT_RULES,
  getDiscountPercent,
  getEventState,
} from '@/lib/events'
import { formatCount, formatNumber, formatPrice } from '@/lib/format'
import { lotteryValueBreakdown } from '@/lib/lottery-rules'
import {
  formatLotteryTicketNumber,
} from '@/lib/lottery-tickets'
import {
  getMyLotteryTickets,
  issueLotteryTickets,
  subscribeMyLotteryTickets,
} from '@/lib/lottery-tickets-store'
import { entryFeeLabel, getParticipationAction } from '@/lib/participation'
import { splitName } from '@/lib/payment-labels'
import { creditRewardsEarn } from '@/lib/rewards-earn-store'
import type { MarketEvent } from '@/types/event'

interface EventSheetProps {
  event: MarketEvent | null
  now: number
  onClose: () => void
}

/**
 * Panneau détail Market Event (portal) : prix, lots, participants + Payer ancré.
 * Ouvert uniquement depuis Participer / Contribuer / Acheter sur le fil.
 */
export function EventSheet({ event, now, onClose }: EventSheetProps) {
  const titleId = useId()

  useEffect(() => {
    if (!event) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    function onKey(keyEvent: KeyboardEvent) {
      if (keyEvent.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = prev
      window.removeEventListener('keydown', onKey)
    }
  }, [event, onClose])

  if (!event || typeof document === 'undefined') return null

  return createPortal(
    <div
      className="fixed inset-0 z-[200] flex items-end justify-center"
      role="presentation"
    >
      <button
        type="button"
        aria-label="Fermer le panneau"
        className="absolute inset-0 bg-black/60"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative z-[1] flex max-h-[min(92dvh,40rem)] w-full max-w-180 flex-col overflow-hidden rounded-t-3xl bg-[#111] text-white shadow-2xl"
      >
        <SheetContent
          key={event.id}
          event={event}
          now={now}
          titleId={titleId}
          onClose={onClose}
        />
      </div>
    </div>,
    document.body,
  )
}

function SheetContent({
  event,
  now,
  titleId,
  onClose,
}: {
  event: MarketEvent
  now: number
  titleId: string
  onClose: () => void
}) {
  const profile = useProfile()
  const { firstName, lastName } = splitName(profile.name)
  const [notice, setNotice] = useState('')
  const headingRef = useRef<HTMLHeadingElement>(null)

  const allLotteryTickets = useSyncExternalStore(
    subscribeMyLotteryTickets,
    getMyLotteryTickets,
    () => [],
  )
  const myLotteryTickets = allLotteryTickets.filter(
    (ticket) => ticket.eventId === event.id,
  )

  const state = getEventState(event, now)
  const action = getParticipationAction(event, state)
  const amount = action.amount ?? 0
  const needsPay = action.kind === 'enter' || action.kind === 'purchase'

  const { offer, collective } = event
  const lottery = event.lottery
    ? lotteryValueBreakdown(event.lottery)
    : undefined

  useEffect(() => {
    headingRef.current?.focus()
  }, [])

  function handleRemind() {
    const stamp = Date.now()
    addEventParticipation(event.id, 'remind', stamp, 'market-event')
    const earned = creditRewardsEarn(
      {
        key: `event:${event.id}:remind`,
        points: 25,
        title: 'Rappel événement',
        detail: `${event.title} · +25 pts`,
      },
      stamp,
    )
    setNotice(
      earned
        ? `Rappel enregistré · +${earned.points} pts Rewards.`
        : 'Rappel enregistré.',
    )
  }

  function handlePaid(_requestId: string, ticketId: string) {
    const stamp = Date.now()
    addEventParticipation(event.id, 'rsvp', stamp, 'market-event')
    if (event.lottery) {
      const tickets = issueLotteryTickets({
        eventId: event.id,
        lottery: event.lottery,
        paymentTicketId: ticketId,
        now: stamp,
      })
      if (tickets.length > 0) {
        setNotice(
          `Tickets loterie : ${tickets.map((t) => formatLotteryTicketNumber(t.number)).join(' · ')}`,
        )
      }
    }
    onClose()
    // WalletPaymentForm ouvre déjà le ticket après paiement.
  }

  return (
    <>
      <div className="min-h-0 flex-1 space-y-4 overflow-y-auto overscroll-contain p-4 pb-3">
        <div className="flex items-start gap-3">
          <Avatar name={event.host.name} src={event.host.avatarSrc} size="lg" />
          <div className="min-w-0 flex-1">
            <h2
              id={titleId}
              ref={headingRef}
              tabIndex={-1}
              className="text-title leading-snug font-extrabold outline-none"
            >
              {event.title}
            </h2>
            <p className="truncate text-body text-white/70">{event.host.name}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fermer"
            className="-mt-1 -mr-2 grid size-11 shrink-0 place-items-center rounded-full hover:bg-white/10"
          >
            <X className="size-5" aria-hidden="true" />
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          <EventStateBadge state={state} />
          <EventKindBadge kind={event.kind} />
        </div>

        <p className="text-body text-white/75">{event.description}</p>

        {offer ? (
          <div className="space-y-3 rounded-xl border border-white/10 bg-[#1a1a1a] p-4">
            <p className="text-body font-semibold">{offer.productName}</p>
            <OfferPrice offer={offer} />
            <StockBar offer={offer} />
          </div>
        ) : null}

        {lottery ? (
          <div className="space-y-3 rounded-xl border border-white/10 bg-[#1a1a1a] p-4">
            <p className="text-caption text-white/70">Lot à gagner</p>
            <p className="text-lg font-extrabold leading-snug">{lottery.prizeName}</p>
            <dl className="space-y-2 text-body">
              <div className="flex justify-between gap-3">
                <dt className="text-white/65">Valeur du produit</dt>
                <dd className="font-bold">{formatPrice(lottery.prizeValue)}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-white/65">Mise par personne</dt>
                <dd className="font-bold text-gold">
                  {entryFeeLabel(lottery.entryFee)}
                </dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-white/65">Mise totale (cible)</dt>
                <dd className="font-bold tabular-nums">
                  {lottery.entryFee > 0
                    ? formatPrice(lottery.totalStake)
                    : 'Gratuit'}
                </dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-white/65">Mise déjà collectée</dt>
                <dd className="font-bold tabular-nums">
                  {formatPrice(lottery.collected)}
                </dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-white/65">Personnes susceptibles</dt>
                <dd className="font-bold tabular-nums">
                  {formatNumber(event.participants)} /{' '}
                  {formatNumber(lottery.eligiblePeople)}
                </dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-white/65">Chances / personne</dt>
                <dd className="font-bold tabular-nums">
                  {formatNumber(lottery.entriesPerPerson)}
                </dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-white/65">
                  {lottery.winnerSlots > 1
                    ? 'Gagnants possibles'
                    : 'Gagnant possible'}
                </dt>
                <dd className="font-bold">{lottery.winnerSlots}</dd>
              </div>
            </dl>
            <div
              role="progressbar"
              aria-label="Participants"
              aria-valuemin={0}
              aria-valuemax={lottery.maxParticipants}
              aria-valuenow={Math.min(event.participants, lottery.maxParticipants)}
              className="h-2 overflow-hidden rounded-full bg-white/20"
            >
              <div
                className="h-full rounded-full bg-brand"
                style={{
                  width: `${Math.min(
                    (event.participants / Math.max(lottery.maxParticipants, 1)) *
                      100,
                    100,
                  )}%`,
                }}
              />
            </div>
          </div>
        ) : null}

        {lottery ? (
          <LotteryJourney
            event={event}
            state={state}
            now={now}
            myTickets={myLotteryTickets}
          />
        ) : null}

        {collective ? (
          <div className="space-y-3 rounded-xl border border-white/10 bg-[#1a1a1a] p-4">
            <p className="text-body font-semibold">{collective.productName}</p>
            <p className="flex flex-wrap items-baseline gap-x-2">
              <span className="text-xl font-extrabold tabular-nums">
                {formatPrice(collective.currentPrice)}
              </span>
              <s className="text-caption text-white/60">
                {formatPrice(collective.initialPrice)}
              </s>
              <span className="rounded-full bg-white px-2 py-0.5 text-caption font-bold text-neutral-900">
                −
                {getDiscountPercent(
                  collective.initialPrice,
                  collective.currentPrice,
                )}{' '}
                %
              </span>
            </p>
            <dl className="space-y-2 text-body">
              <div className="flex justify-between gap-3">
                <dt className="text-white/65">Participation</dt>
                <dd className="font-bold text-gold">
                  {formatPrice(collective.entryFee)}
                </dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-white/65">Stock</dt>
                <dd className="font-bold tabular-nums">
                  {collective.stockLeft} / {collective.stockTotal}
                </dd>
              </div>
            </dl>
          </div>
        ) : null}

        {!offer && !lottery && !collective && event.reward ? (
          <p className="flex items-center gap-2 rounded-xl border border-white/10 bg-[#1a1a1a] p-4 font-semibold">
            <Gift className="size-5 text-amber-300" aria-hidden="true" />
            {event.reward}
          </p>
        ) : null}

        <div className="flex items-center justify-between gap-3 rounded-xl bg-white/10 p-3.5">
          <span className="inline-flex items-center gap-1.5 text-body">
            <Timer className="size-4 shrink-0" aria-hidden="true" />
            <EventCountdown
              event={event}
              now={now}
              className="text-body text-white"
            />
          </span>
          <span className="inline-flex items-center gap-1.5 text-caption text-white/75">
            <Users className="size-4" aria-hidden="true" />
            {formatCount(event.participants)} participant
            {event.participants > 1 ? 's' : ''}
          </span>
        </div>

        <section className="space-y-1">
          <h3 className="text-body font-bold">Principe</h3>
          <p className="text-body text-white/70">{EVENT_RULES[event.kind]}</p>
        </section>

        {needsPay ? (
          <div className="rounded-xl bg-[#f3f2f7] p-2">
            <WalletPaymentForm
              purpose="event"
              domain="event"
              title={`${EVENT_KINDS[event.kind].label} · ${event.title}`}
              detail={
                lottery
                  ? `${lottery.prizeName} · ${entryFeeLabel(lottery.entryFee)}`
                  : collective
                    ? collective.productName
                    : offer
                      ? offer.productName
                      : event.description
              }
              amount={amount}
              fees={0}
              enableRewards={false}
              payer={{ firstName, lastName }}
              beneficiary={{
                name: event.host.name,
                ...(event.host.proRef ? { handle: event.host.proRef } : {}),
                business: event.host.name,
                ...(event.host.proRef ? { serviceId: event.host.proRef } : {}),
                verified: event.host.verified,
                ...(event.host.avatarSrc
                  ? { avatarSrc: event.host.avatarSrc }
                  : {}),
              }}
              waitingLabel="Confirmer"
              actionLabel="Confirmer le paiement"
              onSent={handlePaid}
            />
          </div>
        ) : null}
      </div>

      {!needsPay ? (
        <div className="shrink-0 border-t border-white/10 bg-[#111] px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom,0px))]">
          <Button
            type="button"
            size="lg"
            className="w-full"
            disabled={action.kind === 'none'}
            onClick={() => {
              if (action.kind === 'remind') handleRemind()
            }}
          >
            {action.label}
          </Button>
          <p
            role="status"
            className="mt-1.5 text-center text-caption text-white/70 empty:hidden"
          >
            {notice}
          </p>
        </div>
      ) : null}
    </>
  )
}
