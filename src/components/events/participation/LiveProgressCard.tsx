import { Activity, Check } from 'lucide-react'

import { InfoCard, InfoRow } from '@/components/events/participation/InfoCard'
import { EVENT_STATE_LABEL, formatCountdown, getDiscountPercent } from '@/lib/events'
import { formatNumber, formatPrice } from '@/lib/format'
import { lotteryValueBreakdown } from '@/lib/lottery-rules'
import { getNextTier } from '@/lib/participation'
import { cn } from '@/lib/utils'
import type { EventCollective, EventState, MarketEvent } from '@/types/event'

const PAY = 'var(--brand)'

function StateTag({ state }: { state: EventState }) {
  if (state === 'live') {
    return (
      <span
        className="inline-flex items-center gap-1.5 text-caption font-extrabold tracking-wide"
        style={{ color: PAY }}
      >
        <span aria-hidden="true" className="size-2 rounded-full bg-current" />
        LIVE
      </span>
    )
  }
  return (
    <span className="rounded-full bg-white/10 px-2.5 py-1 text-caption font-bold text-white/80">
      {EVENT_STATE_LABEL[state]}
    </span>
  )
}

function Bar({
  value,
  max,
  label,
  valueText,
}: {
  value: number
  max: number
  label: string
  valueText: string
}) {
  const ratio = max > 0 ? Math.min(Math.max(value / max, 0), 1) : 0
  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={max}
      aria-valuenow={Math.min(value, max)}
      aria-valuetext={valueText}
      className="my-3 h-3.5 overflow-hidden rounded-full bg-white/15"
    >
      <div
        className="h-full rounded-full"
        style={{ width: `${ratio * 100}%`, background: PAY }}
      />
    </div>
  )
}

function TierLadder({ collective }: { collective: EventCollective }) {
  const next = getNextTier(collective)
  return (
    <div className="space-y-2 pt-3">
      <h3 className="text-body font-bold text-white">Paliers de réduction</h3>
      <ol className="space-y-1.5">
        {collective.tiers.map((tier) => {
          const reached = tier.collected <= collective.collected
          const isNext = next === tier
          const percent = getDiscountPercent(collective.initialPrice, tier.price)
          return (
            <li
              key={tier.collected}
              aria-current={isNext ? 'step' : undefined}
              className={cn(
                'flex items-center gap-3 rounded-xl px-3 py-2.5 text-body',
                reached && 'bg-white/10',
                isNext && 'ring-2 ring-brand',
                !reached && !isNext && 'bg-white/5',
              )}
            >
              <span
                aria-hidden="true"
                className={cn(
                  'grid size-6 shrink-0 place-items-center rounded-full text-caption',
                  reached ? 'text-neutral-900' : 'bg-white/15 text-white',
                )}
                style={reached ? { background: PAY } : undefined}
              >
                {reached ? <Check className="size-3.5" /> : null}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block font-bold text-white tabular-nums">
                  {formatPrice(tier.price)}
                  {percent > 0 ? (
                    <span className="ml-2 text-caption text-white/60">
                      −{percent} %
                    </span>
                  ) : null}
                </span>
                <span className="block text-caption text-white/60 tabular-nums">
                  {tier.collected > 0
                    ? `dès ${formatPrice(tier.collected)} collectés`
                    : 'prix de départ'}
                </span>
              </span>
              {isNext ? (
                <span className="shrink-0 text-caption font-semibold" style={{ color: PAY }}>
                  Prochain
                </span>
              ) : null}
            </li>
          )
        })}
      </ol>
    </div>
  )
}

interface LiveProgressCardProps {
  event: MarketEvent
  state: EventState
  now: number
}

/**
 * Progression en temps réel, adaptée au format (loterie, collective, offre…).
 */
export function LiveProgressCard({ event, state, now }: LiveProgressCardProps) {
  const lottery = event.lottery
    ? lotteryValueBreakdown(event.lottery)
    : undefined
  const { collective, offer } = event

  const remaining =
    state === 'live'
      ? formatCountdown(event.endsAt - now)
      : state === 'upcoming'
        ? `Début dans ${formatCountdown(event.startsAt - now)}`
        : 'Terminé'

  return (
    <InfoCard
      icon={Activity}
      title="Progression en temps réel"
      aside={<StateTag state={state} />}
    >
      {lottery ? (
        <>
          <Bar
            value={event.participants}
            max={lottery.maxParticipants}
            label="Participants"
            valueText={`${event.participants} participants sur ${lottery.maxParticipants}`}
          />
          <dl>
            <InfoRow
              label="Valeur du produit"
              value={formatPrice(lottery.prizeValue)}
              emphasis="strong"
            />
            <InfoRow
              label="Personnes susceptibles"
              value={`${formatNumber(event.participants)} / ${formatNumber(lottery.eligiblePeople)}`}
              emphasis="strong"
            />
            <InfoRow
              label="Mise collectée"
              value={formatPrice(lottery.collected)}
              emphasis="money"
            />
            <InfoRow
              label="Mise totale (cible)"
              value={
                lottery.entryFee > 0
                  ? formatPrice(lottery.totalStake)
                  : 'Gratuit'
              }
              emphasis="money"
            />
            <InfoRow
              label={
                lottery.winnerSlots > 1
                  ? 'Gagnants possibles'
                  : 'Gagnant possible'
              }
              value={String(lottery.winnerSlots)}
            />
            <InfoRow label="Temps restant" value={remaining} />
          </dl>
        </>
      ) : null}

      {collective ? (
        <>
          <Bar
            value={collective.collected}
            max={collective.tiers[collective.tiers.length - 1]?.collected ?? 0}
            label="Montant collecté, jusqu’au dernier palier"
            valueText={`${formatPrice(collective.collected)} collectés`}
          />
          <dl>
            <InfoRow
              label="Participants"
              value={formatNumber(event.participants)}
              emphasis="strong"
            />
            <InfoRow
              label="Montant collecté"
              value={formatPrice(collective.collected)}
              emphasis="money"
            />
            <InfoRow
              label={state === 'ended' ? 'Prix final' : 'Prix actuel'}
              value={formatPrice(collective.currentPrice)}
              emphasis="strong"
            />
            <InfoRow label="Temps restant" value={remaining} />
          </dl>
          <TierLadder collective={collective} />
        </>
      ) : null}

      {!lottery && !collective && offer ? (
        <>
          <Bar
            value={offer.stockTotal - offer.stockLeft}
            max={offer.stockTotal}
            label="Stock écoulé"
            valueText={`${offer.stockTotal - offer.stockLeft} vendus sur ${offer.stockTotal}`}
          />
          <dl>
            <InfoRow
              label="Stock restant"
              value={`${formatNumber(offer.stockLeft)} / ${formatNumber(offer.stockTotal)}`}
              emphasis="strong"
            />
            <InfoRow
              label="Participants"
              value={formatNumber(event.participants)}
            />
            <InfoRow
              label="Montant actuel"
              value={formatPrice(
                (offer.stockTotal - offer.stockLeft) * offer.eventPrice,
              )}
              emphasis="money"
            />
            <InfoRow label="Temps restant" value={remaining} />
          </dl>
        </>
      ) : null}

      {!lottery && !collective && !offer ? (
        <dl>
          <InfoRow
            label="Participants"
            value={formatNumber(event.participants)}
            emphasis="strong"
          />
          <InfoRow label="Temps restant" value={remaining} />
        </dl>
      ) : null}
    </InfoCard>
  )
}
