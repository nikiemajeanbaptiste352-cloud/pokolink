import { Clock3, MapPin, UtensilsCrossed } from 'lucide-react'
import { Link } from 'react-router-dom'

import { Media } from '@/components/common/Media'
import { Rating } from '@/components/common/Rating'
import { cn } from '@/lib/utils'
import { paths } from '@/routes/paths'
import type { Restaurant } from '@/types/explore'

interface RestaurantCardProps {
  restaurant: Restaurant
  /** Prend la largeur de sa cellule (grille) au lieu d'une largeur de rail. */
  fluid?: boolean
}

/**
 * Carte restaurant animée : distance, délai, ouverture et note — layout flexible
 * rail / grille, animations CSS uniquement.
 */
export function RestaurantCard({ restaurant, fluid = false }: RestaurantCardProps) {
  const { name, distanceKm, eta, open, rating, imageSrc } = restaurant
  const distance = `${distanceKm.toFixed(1).replace('.', ',')} km`

  return (
    <Link
      to={paths.establishment(restaurant.proRef)}
      aria-label={`${name}, ${open ? 'ouvert' : 'fermé'}, ${distance}, ${eta}. Ouvrir la page`}
      className={cn(
        'explore-card @container/resto group flex shrink-0 snap-start flex-col overflow-hidden rounded-2xl bg-card ring-1 ring-black/[0.06] transition-[transform,box-shadow] duration-300 ease-out hover:-translate-y-1 hover:shadow-lg hover:ring-black/[0.1]',
        fluid
          ? 'w-full min-w-0'
          : 'w-[clamp(10.5rem,46vw,14rem)] sm:w-[13.5rem]',
      )}
    >
      <span className="relative block aspect-[16/10] overflow-hidden bg-[#f6f7f8]">
        <Media
          src={imageSrc}
          alt=""
          icon={UtensilsCrossed}
          tone="red"
          className="absolute inset-0 size-full transition-transform duration-500 ease-out group-hover:scale-[1.05]"
        />
        <span
          className={cn(
            'absolute top-2 left-2 rounded-md px-1.5 py-0.5 text-[10px] font-extrabold shadow-sm backdrop-blur-[2px]',
            open
              ? 'bg-brand/95 text-white'
              : 'bg-neutral-900/75 text-white/90',
          )}
        >
          {open ? 'Ouvert' : 'Fermé'}
        </span>
      </span>

      <span className="flex flex-1 flex-col gap-1.5 px-2.5 py-2.5 @min-[12rem]/resto:px-3 @min-[12rem]/resto:py-3">
        <span className="truncate text-[13px] font-extrabold leading-snug @min-[12rem]/resto:text-sm">
          {name}
        </span>
        <span className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-muted-foreground">
          <span className="inline-flex items-center gap-0.5">
            <MapPin className="size-3 shrink-0" aria-hidden="true" />
            {distance}
          </span>
          <span className="inline-flex items-center gap-0.5">
            <Clock3 className="size-3 shrink-0" aria-hidden="true" />
            {eta}
          </span>
        </span>
        <span className="mt-auto">
          <Rating value={rating} className="text-[11px]" />
        </span>
      </span>
    </Link>
  )
}
