import { Minus, Plus, ShoppingBasket } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

import { EmptyState } from '@/components/common/EmptyState'
import { FilterChips } from '@/components/common/FilterChips'
import { Media } from '@/components/common/Media'
import { Button } from '@/components/ui/button'
import { formatPrice } from '@/lib/format'
import { getCategories, getMaxQuantity, getStockLabel } from '@/lib/catalog'
import { getServiceTypeMeta } from '@/lib/service-types'
import { cn } from '@/lib/utils'
import { paths } from '@/routes/paths'
import type { CatalogItem, ServiceType } from '@/types/service'

interface CatalogPickerProps {
  serviceType: ServiceType
  items: readonly CatalogItem[]
  quantities: ReadonlyMap<string, number>
  onAdd: (item: CatalogItem) => void
  onRemove: (item: CatalogItem) => void
  /** Élément à mettre en évidence et à amener à l'écran. */
  highlightId?: string | undefined
}

const ALL = 'all'

/** Catalogue public dense façon Amazon / Temu : grille 2 colonnes, prix or, ajout rapide. */
export function CatalogPicker({
  serviceType,
  items,
  quantities,
  onAdd,
  onRemove,
  highlightId,
}: CatalogPickerProps) {
  const meta = getServiceTypeMeta(serviceType)
  const [category, setCategory] = useState<string>(ALL)
  const categories = getCategories(items)

  useEffect(() => {
    if (!highlightId) return
    document
      .getElementById(`catalog-item-${highlightId}`)
      ?.scrollIntoView({ block: 'center' })
  }, [highlightId])

  if (items.length === 0) {
    return (
      <EmptyState
        icon={ShoppingBasket}
        tone={meta.tone}
        title="Rien à afficher pour le moment"
        description="Le catalogue de cet établissement est encore vide."
      />
    )
  }

  const visible = category === ALL ? items : items.filter((i) => i.category === category)

  return (
    <div className="space-y-3">
      {categories.length > 1 ? (
        <FilterChips
          label="Catégories"
          value={category}
          onChange={setCategory}
          items={[
            { id: ALL, label: 'Tout' },
            ...categories.map((c) => ({ id: c, label: c })),
          ]}
        />
      ) : null}

      <ul className="grid grid-cols-2 gap-2.5 px-3 sm:grid-cols-3 sm:gap-3 sm:px-4">
        {visible.map((item) => {
          const quantity = quantities.get(item.id) ?? 0
          const max = getMaxQuantity(item)
          return (
            <li
              key={item.id}
              id={`catalog-item-${item.id}`}
              className={cn(
                'flex min-w-0 flex-col overflow-hidden rounded-xl bg-card ring-1 ring-black/[0.06]',
                item.id === highlightId && 'ring-2 ring-brand',
              )}
            >
              <Link
                to={paths.product(item.id)}
                aria-label={`${item.name}, ${formatPrice(item.price)}. Ouvrir la fiche`}
                className="block"
              >
                <span className="block bg-[#f6f7f8]">
                  <Media
                    src={item.image || undefined}
                    alt=""
                    icon={meta.icon}
                    tone={meta.tone}
                    className="aspect-square w-full"
                  />
                </span>
                <span className="block space-y-0.5 px-2 pt-2 pb-1">
                  <span className="line-clamp-2 min-h-9 text-[12.5px] leading-snug font-medium">
                    {item.name}
                  </span>
                  <span className="block text-[15px] font-extrabold text-gold tabular-nums">
                    {formatPrice(item.price)}
                  </span>
                  <span
                    className={cn(
                      'block truncate text-[10px]',
                      max > 0 ? 'text-muted-foreground' : 'font-semibold text-danger',
                    )}
                  >
                    {getStockLabel(item)}
                  </span>
                </span>
              </Link>
              <div className="mt-auto px-2 pb-2.5">
                {quantity === 0 ? (
                  <Button
                    size="sm"
                    disabled={max === 0}
                    onClick={() => onAdd(item)}
                    aria-label={`Ajouter ${item.name}`}
                    className="h-9 w-full rounded-full bg-brand text-[12px] font-bold text-brand-foreground hover:bg-brand/90"
                  >
                    <Plus aria-hidden="true" />
                    Ajouter
                  </Button>
                ) : (
                  <div
                    role="group"
                    aria-label={`Quantité de ${item.name}`}
                    className="flex items-center justify-between gap-1"
                  >
                    <Button
                      size="icon"
                      variant="secondary"
                      aria-label={`Retirer un ${item.name}`}
                      onClick={() => onRemove(item)}
                      className="size-9 rounded-full"
                    >
                      <Minus aria-hidden="true" />
                    </Button>
                    <span
                      aria-live="polite"
                      className="min-w-8 text-center text-body font-extrabold"
                    >
                      {quantity}
                    </span>
                    <Button
                      size="icon"
                      variant="secondary"
                      aria-label={`Ajouter un ${item.name}`}
                      disabled={quantity >= max}
                      onClick={() => onAdd(item)}
                      className="size-9 rounded-full"
                    >
                      <Plus aria-hidden="true" />
                    </Button>
                  </div>
                )}
              </div>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
