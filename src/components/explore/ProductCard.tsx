import { Heart, Package, Truck } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'

import { Media } from '@/components/common/Media'
import { Rating } from '@/components/common/Rating'
import { VerifiedBadge } from '@/components/common/VerifiedBadge'
import { getProductDiscount, getProductPath, getSellerPath } from '@/lib/explore'
import { formatPrice } from '@/lib/format'
import { resolveProductImage } from '@/lib/recommendations'
import { cn } from '@/lib/utils'
import type { Product } from '@/types/explore'

interface ProductCardProps {
  product: Product
  /** Prend la largeur de sa cellule (grille marketplace) au lieu d'une largeur fixe. */
  fluid?: boolean
}

/**
 * Carte produit animée, flexible (rail ou grille) : même contenu scannable,
 * transitions CSS légères uniquement.
 */
export function ProductCard({ product, fluid = false }: ProductCardProps) {
  const [favorite, setFavorite] = useState(false)
  const discount = getProductDiscount(product)
  const unavailable = product.available === false
  const sellerPath = getSellerPath(product)
  const price = product.promoPrice ?? product.price
  const onSale = product.promoPrice !== undefined

  return (
    <article
      className={cn(
        'explore-card @container/product group relative flex flex-col overflow-hidden rounded-2xl bg-card ring-1 ring-black/[0.06] transition-[transform,box-shadow] duration-300 ease-out hover:-translate-y-1 hover:shadow-lg hover:ring-black/[0.1]',
        fluid
          ? 'w-full min-w-0'
          : 'w-[clamp(9rem,42vw,11.5rem)] shrink-0 snap-start sm:w-[11rem]',
      )}
    >
      <Link
        to={getProductPath(product)}
        aria-label={`${product.name}, ${formatPrice(price)}. Ouvrir la fiche`}
        className="flex min-w-0 flex-1 flex-col text-left"
      >
        <span className="relative block overflow-hidden bg-[#f6f7f8]">
          <Media
            src={resolveProductImage(product)}
            alt=""
            icon={Package}
            tone="neutral"
            className={cn(
              'aspect-square w-full transition-transform duration-500 ease-out group-hover:scale-[1.05]',
              unavailable && 'opacity-45',
            )}
          />
          {discount > 0 ? (
            <span className="absolute top-0 left-0 rounded-br-xl bg-gold px-1.5 py-0.5 text-[10px] font-extrabold tracking-wide text-gold-foreground uppercase shadow-sm">
              −{discount}%
            </span>
          ) : null}
          {unavailable ? (
            <span className="absolute inset-x-2 bottom-2 rounded-lg bg-neutral-900/80 px-2 py-1 text-center text-[10px] font-bold text-white backdrop-blur-[2px]">
              Épuisé
            </span>
          ) : null}
        </span>

        <span className="flex flex-1 flex-col gap-1 px-2 pt-2 pb-2.5 @min-[10.5rem]/product:px-2.5 @min-[10.5rem]/product:pt-2.5">
          <span className="line-clamp-2 min-h-[2.25rem] text-[12.5px] leading-snug font-medium text-foreground @min-[10.5rem]/product:text-[13px]">
            {product.name}
          </span>

          <span className="mt-auto space-y-1">
            <span className="flex flex-wrap items-baseline gap-x-1.5 gap-y-0">
              <span
                className={cn(
                  'text-[15px] font-extrabold tabular-nums @min-[10.5rem]/product:text-base',
                  onSale ? 'text-gold' : 'text-foreground',
                )}
              >
                {formatPrice(price)}
              </span>
              {onSale ? (
                <span className="text-[11px] text-muted-foreground tabular-nums line-through">
                  {formatPrice(product.price)}
                </span>
              ) : null}
            </span>

            <span className="flex items-center gap-1.5">
              <Rating value={product.rating} className="text-[11px]" />
            </span>

            <span className="flex min-w-0 items-center gap-1 text-[10px] leading-none text-muted-foreground">
              <span className="truncate font-medium">{product.seller}</span>
              {product.sellerVerified ? (
                <VerifiedBadge className="size-2.5 shrink-0" />
              ) : null}
            </span>

            {!unavailable ? (
              <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold text-brand">
                <Truck className="size-2.5" aria-hidden="true" />
                Livraison locale
              </span>
            ) : null}
          </span>
        </span>
      </Link>

      {sellerPath ? (
        <Link to={sellerPath} aria-label={`Boutique de ${product.seller}`} className="sr-only">
          Voir la boutique
        </Link>
      ) : null}

      <button
        type="button"
        aria-label={favorite ? 'Retirer des favoris' : 'Ajouter aux favoris'}
        aria-pressed={favorite}
        onClick={() => setFavorite((v) => !v)}
        className="absolute top-1.5 right-1.5 grid size-8 place-items-center transition-transform duration-200 hover:scale-105 active:scale-95"
      >
        <span className="grid size-7 place-items-center rounded-full bg-white/95 shadow-sm ring-1 ring-black/5 backdrop-blur-[2px]">
          <Heart
            className={cn(
              'size-3.5 transition-colors duration-200',
              favorite && 'fill-gold text-gold',
            )}
            aria-hidden="true"
          />
        </span>
      </button>
    </article>
  )
}
