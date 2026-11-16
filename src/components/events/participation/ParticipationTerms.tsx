import type { ReactNode } from 'react'

import { HostActions } from '@/components/events/HostActions'
import { formatPrice } from '@/lib/format'
import { lotteryChanceRuleLabel } from '@/lib/lottery-rules'
import { formatLongDate } from '@/lib/participation'
import { EVENT_RULES, HOST_TYPE_LABEL } from '@/lib/events'
import type { MarketEvent } from '@/types/event'

function Item({ term, children }: { term: string; children: ReactNode }) {
  return (
    <div className="space-y-0.5 border-b py-3 last:border-b-0">
      <dt className="text-body font-bold">{term}</dt>
      <dd className="text-body text-muted-foreground">{children}</dd>
    </div>
  )
}

/**
 * Transparence : tout ce que le participant doit savoir avant de participer
 * (organisateur, conditions, dates, financement, sélection ou réduction, remise ou
 * achat, remboursement). Les textes viennent du serveur ; ceux « à définir » signalent
 * une règle encore ouverte dans la documentation.
 */
export function ParticipationTerms({ event }: { event: MarketEvent }) {
  const { terms, lottery, collective } = event

  return (
    <dl aria-label="Règles de l’événement">
      <Item term="Organisateur">
        {event.host.name} · {HOST_TYPE_LABEL[event.host.type]}
        {event.host.verified ? ' vérifié' : ''}
        <HostActions event={event} className="mt-2" />
      </Item>
      <Item term="Description">{event.description}</Item>
      <Item term="Principe">{EVENT_RULES[event.kind]}</Item>
      {terms ? <Item term="Conditions de participation">{terms.conditions}</Item> : null}
      <Item term="Dates">
        Du {formatLongDate(event.startsAt)} au {formatLongDate(event.endsAt)} (clôture).
      </Item>
      {lottery ? (
        <Item term="Sélection des gagnants">
          {lottery.winnersCount > 1
            ? `${lottery.winnersCount} gagnants. `
            : '1 gagnant. '}
          {lotteryChanceRuleLabel(lottery.prizeValue)}. {lottery.drawMethod}
        </Item>
      ) : null}
      {collective ? (
        <Item term="Règle de réduction">
          Le prix passe de {formatPrice(collective.initialPrice)} à{' '}
          {formatPrice(collective.tiers[collective.tiers.length - 1]?.price ?? 0)} au
          dernier palier, selon le montant total collecté. La règle est appliquée par le
          serveur.
        </Item>
      ) : null}
      {terms ? <Item term="Règles de financement">{terms.funding}</Item> : null}
      {terms ? (
        <Item term={lottery ? 'Remise des lots' : 'Conditions d’achat'}>
          {terms.delivery}
        </Item>
      ) : null}
      {terms ? <Item term="Remboursement">{terms.refund}</Item> : null}
    </dl>
  )
}
