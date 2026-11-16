import { ChevronRight } from 'lucide-react'
import { Link } from 'react-router-dom'

import { Avatar } from '@/components/common/Avatar'
import { StatusPill } from '@/components/pro/shared'
import { useCardPro } from '@/hooks/use-subscription-cards'
import { formatPrice } from '@/lib/format'
import {
  formatCardNumber,
  getCardStatus,
  SUBSCRIPTION_STATUS,
} from '@/lib/subscription-labels'
import { paths } from '@/routes/paths'
import type { SubscriptionCard } from '@/types/subscription'

/** Ligne de la liste « Abonnements » : Service Pro, forfait, prix et statut. */
export function SubscriptionRow({ card, now }: { card: SubscriptionCard; now: number }) {
  const pro = useCardPro(card)
  const status = getCardStatus(card, now)
  return (
    <Link
      to={paths.subscriptionCard(card.id)}
      className="flex min-h-18 items-center gap-3 px-4 py-3 hover:bg-muted"
    >
      <Avatar name={pro.name} src={pro.logo} size="lg" />
      <span className="min-w-0 flex-1 space-y-0.5">
        <span className="block truncate text-body font-bold">{pro.name}</span>
        <span className="block truncate text-caption text-muted-foreground">
          {card.planName} · {formatCardNumber(card.number)}
        </span>
        <StatusPill className="mt-1">{SUBSCRIPTION_STATUS[status].label}</StatusPill>
      </span>
      <span className="shrink-0 text-body font-extrabold tabular-nums">
        {formatPrice(card.price)}
      </span>
      <ChevronRight
        className="size-4 shrink-0 text-muted-foreground"
        aria-hidden="true"
      />
    </Link>
  )
}
