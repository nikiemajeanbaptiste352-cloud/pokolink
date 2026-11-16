import { ChevronRight, type LucideIcon } from 'lucide-react'
import { Link } from 'react-router-dom'

import { Media } from '@/components/common/Media'
import { getStockLabel, isOrderable } from '@/lib/catalog'
import { formatPrice } from '@/lib/format'
import type { Tone } from '@/lib/tones'
import { cn } from '@/lib/utils'
import { paths } from '@/routes/paths'
import type { CatalogItem } from '@/types/service'

interface ProductCardProps {
  item: CatalogItem
  icon: LucideIcon
  tone: Tone
  /** `grid` : vignette en grille (par défaut) ; `list` : ligne compacte. */
  layout?: 'grid' | 'list'
  className?: string
}

/** Carte produit style marketplace : grande image, nom, prix mis en avant, disponibilité. */
export function ProductCard({
  item,
  icon,
  tone,
  layout = 'grid',
  className,
}: ProductCardProps) {
  const to = paths.serviceItem(item.serviceId, item.id)
  const orderable = isOrderable(item)

  if (layout === 'list') {
    return (
      <Link
        to={to}
        className={cn(
          'flex min-h-24 items-center gap-3 rounded-2xl border bg-card p-3 shadow-card transition-shadow hover:shadow-md',
          className,
        )}
      >
        <Media
          src={item.image || undefined}
          icon={icon}
          tone={tone}
          className="size-20 shrink-0 rounded-xl"
        />
        <span className="min-w-0 flex-1">
          <span className="line-clamp-2 text-body font-semibold">{item.name}</span>
          <span className="block text-title font-extrabold">
            {formatPrice(item.price)}
          </span>
          <span className="block truncate text-caption text-muted-foreground">
            {item.category} ·{' '}
            <span className={cn(!orderable && 'font-semibold text-danger')}>
              {getStockLabel(item)}
            </span>
          </span>
        </span>
        <ChevronRight
          className="size-5 shrink-0 text-muted-foreground"
          aria-hidden="true"
        />
      </Link>
    )
  }

  return (
    <Link
      to={to}
      className={cn(
        'flex min-w-0 flex-col overflow-hidden rounded-2xl border bg-card shadow-card transition-shadow hover:shadow-md',
        className,
      )}
    >
      <span className="relative block">
        <Media
          src={item.image || undefined}
          icon={icon}
          tone={tone}
          className="aspect-square w-full"
        />
        {orderable ? null : (
          <span className="absolute top-2 left-2 rounded-full bg-foreground px-2.5 py-1 text-caption font-bold text-background">
            {getStockLabel(item)}
          </span>
        )}
      </span>
      <span className="flex flex-1 flex-col gap-0.5 p-3">
        <span className="line-clamp-2 min-h-11 text-body font-semibold">{item.name}</span>
        <span className="text-title font-extrabold">{formatPrice(item.price)}</span>
        <span className="truncate text-caption text-muted-foreground">
          {orderable ? `${item.category} · ${getStockLabel(item)}` : item.category}
        </span>
      </span>
    </Link>
  )
}
