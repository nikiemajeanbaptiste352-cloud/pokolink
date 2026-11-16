import { Store, Trash2 } from 'lucide-react'
import { Link } from 'react-router-dom'

import { CartItemCard } from '@/components/cart/CartItemCard'
import { Media } from '@/components/common/Media'
import { buttonVariants } from '@/components/ui/button'
import { useCart } from '@/hooks/use-cart'
import { usePublicPro } from '@/hooks/use-public-pro'
import { formatPrice } from '@/lib/format'
import { paths } from '@/routes/paths'

/**
 * Panier d’un vendeur : en-tête, lignes, sous-total.
 * Le CTA « Passer au paiement » est unique, en bas de la page panier.
 */
export function CartGroup({ serviceId }: { serviceId: string }) {
  const pro = usePublicPro(serviceId)
  const cart = useCart(pro?.items ?? [], serviceId)

  if (!pro) {
    return (
      <section className="space-y-3 rounded-2xl border bg-card p-4 shadow-card">
        <p className="text-body">
          Ce vendeur n’est plus disponible : les articles de ce panier ne peuvent plus
          être commandés.
        </p>
        <button
          type="button"
          onClick={cart.clear}
          className={buttonVariants({ variant: 'outline', className: 'w-full' })}
        >
          <Trash2 aria-hidden="true" />
          Vider ce panier
        </button>
      </section>
    )
  }

  const { service } = pro

  return (
    <section aria-label={`Panier : ${service.name}`} className="space-y-3">
      <div className="flex items-center gap-3 px-0.5">
        <Media
          src={service.logo || undefined}
          alt=""
          icon={Store}
          tone="brand"
          className="size-10 shrink-0 rounded-full"
        />
        <div className="min-w-0 flex-1">
          <p className="truncate text-body font-extrabold">{service.name}</p>
          <p className="text-caption text-muted-foreground">
            {cart.count} article{cart.count > 1 ? 's' : ''}
            {pro.owned ? ' · Votre établissement' : ''}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <Link
            to={paths.establishment(service.username)}
            className="text-caption font-bold text-brand"
          >
            Boutique
          </Link>
          {cart.lines.length > 0 ? (
            <button
              type="button"
              onClick={cart.clear}
              aria-label={`Vider le panier : ${service.name}`}
              className="grid size-9 place-items-center rounded-full text-muted-foreground hover:bg-muted hover:text-danger"
            >
              <Trash2 className="size-4" aria-hidden="true" />
            </button>
          ) : null}
        </div>
      </div>

      {cart.lines.length === 0 ? (
        <p className="rounded-xl border bg-card p-4 text-body text-muted-foreground">
          Les articles de ce panier ne sont plus disponibles.
        </p>
      ) : (
        <>
          <ul className="space-y-3">
            {cart.lines.map(({ item, quantity }) => (
              <li key={item.id}>
                <CartItemCard
                  item={item}
                  quantity={quantity}
                  sellerName={service.name}
                  {...(service.logo ? { sellerLogo: service.logo } : {})}
                  sellerVerified={pro.verified}
                  creditAllowed={
                    service.allowMerchantCredit === true &&
                    item.allowMerchantCredit === true
                  }
                  onQuantityChange={(next) => cart.setQuantity(item, next)}
                  onRemove={() => cart.setQuantity(item, 0)}
                />
              </li>
            ))}
          </ul>
          <p className="flex items-center justify-between px-0.5 text-caption">
            <span className="text-muted-foreground">Sous-total</span>
            <span className="font-extrabold text-gold tabular-nums">
              {formatPrice(cart.total)}
            </span>
          </p>
          {pro.owned ? (
            <p className="text-caption text-muted-foreground">
              Vous ne pouvez pas acheter dans votre propre établissement.
            </p>
          ) : null}
        </>
      )}
    </section>
  )
}
