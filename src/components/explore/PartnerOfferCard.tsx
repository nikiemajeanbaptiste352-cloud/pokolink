import { Crown, Handshake, Megaphone } from 'lucide-react'
import { Link } from 'react-router-dom'

import { Avatar } from '@/components/common/Avatar'
import { cn } from '@/lib/utils'
import type { PartnerOffer, PartnerOfferKind } from '@/types/partner-offer'

const KIND_ICON = {
  subscription: Crown,
  ad_plan: Megaphone,
  affiliate: Handshake,
} as const satisfies Record<PartnerOfferKind, typeof Crown>

const KIND_TONE = {
  subscription: 'bg-brand/12 text-brand',
  ad_plan: 'bg-gold/20 text-gold-foreground',
  affiliate: 'bg-secondary text-secondary-foreground',
} as const

interface PartnerOfferCardProps {
  offer: PartnerOffer
  /** Largeur fixe pour rail horizontal. */
  compact?: boolean
  className?: string
}

/**
 * Carte offre partenaire :
 * - photo / indice profil → page publique du vendeur ou créateur ;
 * - milieu (titre, prix, visuel) → détail de l’offre (abonnement, forfait pub, affiliation).
 */
export function PartnerOfferCard({
  offer,
  compact = true,
  className,
}: PartnerOfferCardProps) {
  const Icon = KIND_ICON[offer.kind]

  return (
    <article
      className={cn(
        'relative flex shrink-0 snap-start overflow-hidden rounded-2xl border bg-card shadow-card',
        compact ? 'w-[min(17.5rem,78vw)]' : 'w-full',
        className,
      )}
    >
      {/* Zone profil : avatar + nom */}
      <Link
        to={offer.profileTo}
        aria-label={`Voir la page publique de ${offer.partnerName}`}
        className="flex shrink-0 flex-col items-center justify-center gap-1 border-r bg-muted/40 px-2.5 py-3 transition-colors hover:bg-muted/70"
      >
        <Avatar
          name={offer.partnerName}
          src={offer.avatarSrc}
          size="md"
          className="ring-2 ring-background"
        />
        <span className="max-w-[3.5rem] truncate text-center text-[10px] font-bold text-muted-foreground">
          {offer.partnerName.split(' ')[0]}
        </span>
      </Link>

      {/* Zone détail : milieu de carte */}
      <Link
        to={offer.detailTo}
        aria-label={`${offer.badge} : ${offer.title}. Voir le détail`}
        className="flex min-w-0 flex-1 flex-col gap-1.5 p-3 transition-colors hover:bg-muted/30"
      >
        <span
          className={cn(
            'inline-flex w-fit items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-extrabold',
            KIND_TONE[offer.kind],
          )}
        >
          <Icon className="size-3" aria-hidden="true" />
          {offer.badge}
        </span>
        <span className="line-clamp-2 text-[13px] leading-snug font-extrabold">
          {offer.title}
        </span>
        <span className="truncate text-[11px] text-muted-foreground">
          {offer.subtitle}
        </span>
        {offer.priceLabel ? (
          <span className="mt-auto text-[13px] font-extrabold text-brand tabular-nums">
            {offer.priceLabel}
          </span>
        ) : null}
      </Link>
    </article>
  )
}
