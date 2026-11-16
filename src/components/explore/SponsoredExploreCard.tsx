import { Megaphone } from 'lucide-react'
import { Link } from 'react-router-dom'

import { Avatar } from '@/components/common/Avatar'
import { Media } from '@/components/common/Media'
import { AD_CTA_LABEL, getAdPack } from '@/lib/ad-packs'
import { getFeedPath } from '@/lib/feed'
import { proProfilePath } from '@/lib/messaging-contexts'
import { resolveSponsoredImage } from '@/lib/recommendations'
import { cn } from '@/lib/utils'
import type { FeedItem } from '@/types/feed'

interface SponsoredExploreCardProps {
  item: Extract<FeedItem, { kind: 'ad' }>
}

/**
 * Carte rail Explorer pour une campagne sponsorisée.
 * Photo de profil → page publique ; milieu → détail / destination de l’annonce.
 */
export function SponsoredExploreCard({ item }: SponsoredExploreCardProps) {
  const { campaign, pro } = item
  const detailTo = getFeedPath(item) ?? '#'
  const profileTo = proProfilePath(pro.service)
  const image = resolveSponsoredImage(campaign, pro)
  const pack = getAdPack(campaign.pack)

  return (
    <article
      className={cn(
        'explore-card group relative flex w-[clamp(11rem,48vw,14rem)] shrink-0 snap-start flex-col overflow-hidden rounded-2xl bg-card ring-1 ring-gold/35 transition-[transform,box-shadow] duration-300 ease-out hover:-translate-y-1 hover:shadow-lg sm:w-[13.5rem]',
      )}
    >
      <Link
        to={detailTo}
        aria-label={`${campaign.title}. Annonce sponsorisée. ${AD_CTA_LABEL[campaign.cta]}`}
        className="relative block overflow-hidden bg-[#f6f7f8]"
      >
        <Media
          src={image}
          alt=""
          icon={Megaphone}
          tone="gold"
          className="aspect-[4/3] w-full transition-transform duration-500 ease-out group-hover:scale-[1.05]"
        />
        <span className="absolute top-0 left-0 inline-flex items-center gap-1 rounded-br-xl bg-gold px-1.5 py-0.5 text-[10px] font-extrabold tracking-wide text-gold-foreground uppercase shadow-sm">
          <Megaphone className="size-3" aria-hidden="true" />
          Sponsorisé
        </span>
      </Link>

      <div className="flex flex-1 flex-col gap-1.5 p-2.5">
        <Link
          to={profileTo}
          aria-label={`Voir la page publique de ${pro.service.name}`}
          className="flex min-w-0 items-center gap-2 rounded-lg py-0.5 transition-colors hover:bg-muted/60"
        >
          <Avatar
            name={pro.service.name}
            src={pro.service.logo}
            size="sm"
          />
          <span className="truncate text-[11px] font-semibold text-muted-foreground">
            {pro.service.name}
          </span>
        </Link>

        <Link to={detailTo} className="flex min-w-0 flex-1 flex-col gap-1 text-left">
          <span className="line-clamp-2 text-[13px] leading-snug font-extrabold text-foreground">
            {campaign.title}
          </span>
          <span className="truncate text-[11px] text-muted-foreground">
            {pack.label}
          </span>
          <span className="mt-auto pt-1 text-[12px] font-bold text-gold">
            {AD_CTA_LABEL[campaign.cta]}
          </span>
        </Link>
      </div>
    </article>
  )
}
