import { Wrench } from 'lucide-react'

import { InfoCard, InfoRow } from '@/components/events/participation/InfoCard'
import { EVENT_KINDS, getDiscountPercent } from '@/lib/events'
import { formatNumber, formatPrice } from '@/lib/format'
import { lotteryValueBreakdown } from '@/lib/lottery-rules'
import { entryFeeLabel, formatLongDate } from '@/lib/participation'
import type { MarketEvent } from '@/types/event'

/**
 * Carte « Informations » adaptée au format : flash / loterie / collective / jeu…
 */
export function ParticipationInfo({ event }: { event: MarketEvent }) {
  const lottery = event.lottery
    ? lotteryValueBreakdown(event.lottery)
    : undefined
  const { collective, offer } = event
  const title = `Informations ${EVENT_KINDS[event.kind].label}`

  return (
    <InfoCard icon={Wrench} title={title}>
      {event.description ? (
        <p className="pt-2 text-[13px] leading-snug text-white/75">
          {event.description}
        </p>
      ) : null}
      <dl>
        {lottery ? (
          <>
            <InfoRow label="Produit" value={lottery.prizeName} />
            <InfoRow
              label="Valeur du produit"
              value={formatPrice(lottery.prizeValue)}
              emphasis="strong"
            />
            <InfoRow
              label="Mise par personne"
              value={entryFeeLabel(lottery.entryFee)}
              emphasis="money"
            />
            <InfoRow
              label="Mise totale (toutes places)"
              value={
                lottery.entryFee > 0
                  ? formatPrice(lottery.totalStake)
                  : 'Gratuit'
              }
              emphasis="money"
            />
            <InfoRow
              label="Mise déjà collectée"
              value={formatPrice(lottery.collected)}
              emphasis="money"
            />
            <InfoRow
              label="Personnes susceptibles de participer"
              value={formatNumber(lottery.eligiblePeople)}
            />
            <InfoRow
              label="Chances / personne (auto)"
              value={formatNumber(lottery.entriesPerPerson)}
            />
            <InfoRow
              label={
                lottery.winnerSlots > 1
                  ? 'Personnes susceptibles de gagner'
                  : 'Personne susceptible de gagner'
              }
              value={String(lottery.winnerSlots)}
            />
          </>
        ) : null}

        {collective ? (
          <>
            <InfoRow label="Produit" value={collective.productName} />
            <InfoRow
              label="Prix initial"
              value={formatPrice(collective.initialPrice)}
              emphasis="strong"
            />
            <InfoRow
              label="Participation"
              value={formatPrice(collective.entryFee)}
              emphasis="money"
            />
            <InfoRow
              label="Stock"
              value={`${collective.stockLeft} / ${collective.stockTotal}`}
            />
          </>
        ) : null}

        {!lottery && !collective && offer ? (
          <>
            <InfoRow label="Produit" value={offer.productName} />
            <InfoRow
              label="Prix événement"
              value={formatPrice(offer.eventPrice)}
              emphasis="strong"
            />
            <InfoRow
              label="Prix habituel"
              value={formatPrice(offer.normalPrice)}
            />
            {getDiscountPercent(offer.normalPrice, offer.eventPrice) > 0 ? (
              <InfoRow
                label="Réduction"
                value={`−${getDiscountPercent(offer.normalPrice, offer.eventPrice)} %`}
                emphasis="money"
              />
            ) : null}
            <InfoRow
              label="Stock"
              value={`${offer.stockLeft} / ${offer.stockTotal}`}
            />
            <InfoRow
              label="Participants"
              value={formatNumber(event.participants)}
            />
          </>
        ) : null}

        {!lottery && !collective && !offer ? (
          <>
            <InfoRow label="Événement" value={event.title} />
            <InfoRow label="Organisateur" value={event.host.name} />
            {event.reward ? (
              <InfoRow label="Récompense" value={event.reward} emphasis="strong" />
            ) : null}
            <InfoRow
              label="Participants"
              value={formatNumber(event.participants)}
            />
          </>
        ) : null}

        <InfoRow label="Date de fin" value={formatLongDate(event.endsAt)} />
      </dl>
    </InfoCard>
  )
}
