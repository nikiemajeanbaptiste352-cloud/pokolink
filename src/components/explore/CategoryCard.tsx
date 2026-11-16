import { MapPin } from 'lucide-react'

import { Media } from '@/components/common/Media'
import { formatCount } from '@/lib/format'
import { getCategorySpotlight } from '@/lib/explore'
import { toneSoft } from '@/lib/tones'
import { cn } from '@/lib/utils'
import type { Category } from '@/types/explore'

interface CategoryCardProps {
  category: Category
  selected?: boolean
  onSelect?: (category: Category) => void
}

/**
 * Carte-catégorie Explorer : panneau « top / plus proche » adapté à chaque rubrique
 * (Produits, Restaurants, Transport, Santé, Pharmacies…).
 */
export function CategoryCard({
  category,
  selected = false,
  onSelect,
}: CategoryCardProps) {
  const { label, icon: Icon, tone, count } = category
  const spotlight = getCategorySpotlight(category)

  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={() => onSelect?.(category)}
      className={cn(
        'explore-card group flex w-[9.75rem] shrink-0 snap-start flex-col overflow-hidden rounded-2xl bg-card text-left ring-1 transition-[transform,box-shadow,ring-color] duration-300 ease-out hover:-translate-y-0.5 hover:shadow-md sm:w-[11rem]',
        selected
          ? 'ring-brand/55 shadow-sm'
          : 'ring-black/[0.06] hover:ring-black/[0.12]',
      )}
    >
      <span className="relative block aspect-[5/3] overflow-hidden bg-[#f6f7f8]">
        {spotlight.imageSrc ? (
          <Media
            src={spotlight.imageSrc}
            alt=""
            icon={Icon}
            tone={tone}
            className="absolute inset-0 size-full transition-transform duration-500 ease-out group-hover:scale-[1.04]"
          />
        ) : (
          <span
            className={cn(
              'absolute inset-0 grid place-items-center',
              toneSoft[tone],
            )}
          >
            <Icon className="size-8 opacity-80" strokeWidth={1.5} aria-hidden="true" />
          </span>
        )}
        <span className="absolute inset-x-0 bottom-0 bg-linear-to-t from-black/55 to-transparent px-2 pt-5 pb-1.5">
          <span className="block truncate text-[11px] font-extrabold text-white">
            {label}
          </span>
        </span>
        <span
          className={cn(
            'absolute top-1.5 left-1.5 inline-flex max-w-[85%] items-center gap-0.5 truncate rounded-md px-1.5 py-0.5 text-[9px] font-extrabold shadow-sm backdrop-blur-[2px]',
            selected
              ? 'bg-brand text-brand-foreground'
              : 'bg-white/95 text-foreground',
          )}
        >
          <MapPin className="size-2.5 shrink-0" aria-hidden="true" />
          {spotlight.badge}
        </span>
      </span>

      <span className="flex flex-1 flex-col gap-0.5 px-2 py-2">
        <span className="line-clamp-2 min-h-[2rem] text-[11.5px] leading-snug font-bold text-foreground">
          {spotlight.title}
        </span>
        <span className="truncate text-[10px] text-muted-foreground">
          {spotlight.detail}
        </span>
        {count !== undefined ? (
          <span className="mt-auto pt-0.5 text-[9px] font-semibold text-brand">
            {formatCount(count)} à découvrir
          </span>
        ) : null}
      </span>
    </button>
  )
}
