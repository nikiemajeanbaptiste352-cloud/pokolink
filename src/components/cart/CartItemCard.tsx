import { BadgeCheck, Package, Trash2 } from 'lucide-react'

import { QuantityControl } from '@/components/cart/QuantityControl'
import { Avatar } from '@/components/common/Avatar'
import { Media } from '@/components/common/Media'
import { getMaxQuantity, itemReference } from '@/lib/catalog'
import { formatPrice } from '@/lib/format'
import type { CatalogItem } from '@/types/service'

interface CartItemCardProps {
  item: CatalogItem
  quantity: number
  sellerName: string
  sellerLogo?: string
  sellerVerified?: boolean
  /** Établissement + article autorisent le crédit commerçant. */
  creditAllowed?: boolean
  onQuantityChange: (quantity: number) => void
  onRemove: () => void
}

/**
 * Carte panier : photo, badge Pro, vendeur, réf., prix or (token marque).
 */
export function CartItemCard({
  item,
  quantity,
  sellerName,
  sellerLogo,
  sellerVerified = true,
  creditAllowed = false,
  onQuantityChange,
  onRemove,
}: CartItemCardProps) {
  return (
    <article
      aria-label={item.name}
      className="overflow-hidden rounded-[1.15rem] border border-border bg-card shadow-card"
    >
      <div className="flex items-start gap-3 p-3.5">
        <span className="relative size-[5.25rem] shrink-0 overflow-hidden rounded-xl bg-muted">
          <Media
            src={item.image || undefined}
            alt=""
            icon={Package}
            tone="neutral"
            className="size-full"
          />
          <span className="absolute top-1.5 left-1.5 rounded-md bg-brand px-1.5 py-0.5 text-[9px] font-extrabold tracking-wide text-brand-foreground uppercase">
            Pro
          </span>
        </span>

        <div className="min-w-0 flex-1 space-y-1.5">
          <div className="flex items-start justify-between gap-2">
            <h3 className="text-[15px] leading-snug font-extrabold text-foreground">
              {item.name}
            </h3>
            <button
              type="button"
              onClick={onRemove}
              aria-label={`Supprimer du panier : ${item.name}`}
              className="-mt-1 -mr-1 grid size-9 shrink-0 place-items-center rounded-full text-muted-foreground hover:bg-muted hover:text-danger"
            >
              <Trash2 className="size-4.5" aria-hidden="true" />
            </button>
          </div>

          <p className="flex min-w-0 items-center gap-1.5 text-[12px] text-muted-foreground">
            <Avatar
              name={sellerName}
              src={sellerLogo}
              size="sm"
              className="size-5 shrink-0"
            />
            <span className="truncate font-semibold text-foreground/80">{sellerName}</span>
            {sellerVerified ? (
              <BadgeCheck
                className="size-3.5 shrink-0 fill-brand stroke-white"
                aria-label="Vérifié"
              />
            ) : null}
          </p>

          <p className="text-[11px] text-muted-foreground tabular-nums">
            {itemReference(item)}
            {creditAllowed ? ' · crédit autorisé' : ''}
          </p>

          <p className="text-[17px] font-extrabold text-gold tabular-nums">
            {formatPrice(item.price)}
          </p>

          <div className="flex items-center justify-between gap-2 pt-0.5">
            <QuantityControl
              name={item.name}
              quantity={quantity}
              max={getMaxQuantity(item)}
              onChange={onQuantityChange}
              variant="pill"
            />
            <p className="text-right text-[11px] text-muted-foreground">
              Total{' '}
              <span className="font-extrabold text-foreground tabular-nums">
                {formatPrice(item.price * quantity)}
              </span>
            </p>
          </div>
        </div>
      </div>
    </article>
  )
}
