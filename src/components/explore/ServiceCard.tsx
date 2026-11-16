import { MapPin, Store } from 'lucide-react'
import { Link } from 'react-router-dom'

import { Media } from '@/components/common/Media'
import { Rating } from '@/components/common/Rating'
import { VerifiedBadge } from '@/components/common/VerifiedBadge'
import type { DemoPro } from '@/lib/directory'
import { formatCount } from '@/lib/format'
import { getServiceTypeMeta } from '@/lib/service-types'
import { cn } from '@/lib/utils'
import { paths } from '@/routes/paths'

interface ServiceCardProps {
  pro: DemoPro
  /** Prend la largeur de sa cellule (grille) au lieu de la largeur fixe d'une rangée. */
  fluid?: boolean
}

/**
 * Carte boutique / prestataire style Alibaba / Amazon Store :
 * couverture nette, logo, note et ville — sans overlay sombre immersif.
 */
export function ServiceCard({ pro, fluid = false }: ServiceCardProps) {
  const { service } = pro
  const { icon: TypeIcon, label: typeLabel } = getServiceTypeMeta(service.type)

  return (
    <Link
      to={paths.establishment(service.username)}
      aria-label={`${service.name}, ${typeLabel}. Ouvrir la page publique`}
      className={cn(
        'group flex shrink-0 snap-start flex-col overflow-hidden rounded-xl bg-card ring-1 ring-black/[0.06] transition-[box-shadow,transform] duration-200 hover:-translate-y-0.5 hover:shadow-md',
        fluid ? 'w-full' : 'w-[11.5rem] sm:w-52',
      )}
    >
      <span className="relative block aspect-[16/10] overflow-hidden bg-[#f6f7f8]">
        {service.cover ? (
          <img
            src={service.cover}
            alt=""
            loading="lazy"
            className="absolute inset-0 size-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <span className="absolute inset-0 grid place-items-center">
            <TypeIcon className="size-12 text-muted-foreground/25" strokeWidth={1.25} aria-hidden="true" />
          </span>
        )}
        <span className="absolute top-2 left-2 rounded-md bg-white/95 px-1.5 py-0.5 text-[10px] font-bold text-foreground shadow-sm">
          {typeLabel}
        </span>
      </span>

      <span className="relative flex flex-1 flex-col gap-1.5 px-2.5 pt-5 pb-3">
        <Media
          src={service.logo || undefined}
          alt=""
          icon={Store}
          tone="gold"
          className="absolute -top-5 left-2.5 size-10 rounded-full ring-2 ring-card"
        />
        <span className="flex min-w-0 items-center gap-1 pt-0.5">
          <span className="truncate text-[13px] font-extrabold">{service.name}</span>
          {pro.verified ? <VerifiedBadge className="size-3.5 shrink-0" /> : null}
        </span>
        <span className="line-clamp-1 text-[11px] text-muted-foreground">{pro.tagline}</span>
        <span className="mt-auto flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-muted-foreground">
          <Rating value={pro.rating} count={pro.reviewCount} className="text-[11px]" />
          <span className="inline-flex items-center gap-0.5">
            <MapPin className="size-3" aria-hidden="true" />
            <span className="truncate">{service.city}</span>
          </span>
        </span>
        <span className="text-[10px] font-semibold text-brand">
          {formatCount(pro.followers)} abonnés
        </span>
      </span>
    </Link>
  )
}
