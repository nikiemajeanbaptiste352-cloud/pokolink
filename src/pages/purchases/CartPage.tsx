import {
  ArrowLeft,
  CreditCard,
  ShoppingBag,
  ShoppingBasket,
  Store,
} from 'lucide-react'
import { useMemo } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'

import { EmptyState } from '@/components/common/EmptyState'
import { FilterChips } from '@/components/common/FilterChips'
import { CartGroup } from '@/components/cart/CartGroup'
import { PurchaseRow } from '@/components/purchases/PurchaseRow'
import { buttonVariants } from '@/components/ui/button'
import { useAllCarts } from '@/hooks/use-cart'
import { usePurchases } from '@/hooks/use-purchases'
import { useServices } from '@/hooks/use-services'
import { findDemoPro } from '@/lib/directory'
import { formatPrice } from '@/lib/format'
import { paths } from '@/routes/paths'

type View = 'cart' | 'purchases'

const VIEWS: readonly { id: View; label: string }[] = [
  { id: 'cart', label: 'Panier' },
  { id: 'purchases', label: 'Mes achats' },
]

/** Un seul CTA paiement : premier vendeur payable (hors son propre établissement). */
function CartCheckoutBar({ serviceIds }: { serviceIds: readonly string[] }) {
  const carts = useAllCarts()
  const { services, items } = useServices()

  const summary = useMemo(() => {
    let total = 0
    let count = 0
    let checkoutId: string | null = null
    let checkoutTotal = 0
    let checkoutName = ''
    let payableGroups = 0

    for (const serviceId of serviceIds) {
      const owned = services.some((s) => s.id === serviceId)
      const local = services.find((s) => s.id === serviceId)
      const demo = findDemoPro(serviceId)
      const catalog =
        local != null
          ? items.filter((item) => item.serviceId === serviceId)
          : (demo?.items ?? [])
      const quantities = carts[serviceId] ?? {}
      let groupCount = 0
      let groupTotal = 0
      for (const item of catalog) {
        const quantity = quantities[item.id] ?? 0
        if (quantity <= 0) continue
        groupCount += quantity
        groupTotal += item.price * quantity
      }
      count += groupCount
      total += groupTotal
      if (!owned && groupCount > 0) {
        payableGroups += 1
        if (!checkoutId) {
          checkoutId = serviceId
          checkoutTotal = groupTotal
          checkoutName = local?.name ?? demo?.service.name ?? 'ce vendeur'
        }
      }
    }

    return { total, count, checkoutId, checkoutTotal, checkoutName, payableGroups }
  }, [serviceIds, carts, services, items])

  if (summary.count === 0) return null

  return (
    <div className="sticky bottom-2 z-20 mx-3 mt-2 sm:mx-4">
      <div className="space-y-2 rounded-2xl border border-border bg-card/95 p-3 shadow-float backdrop-blur">
        <div className="flex items-center justify-between gap-3 px-1">
          <p className="inline-flex items-center gap-2 text-caption font-semibold text-muted-foreground">
            <ShoppingBag className="size-4 text-brand" aria-hidden="true" />
            {summary.count} article{summary.count > 1 ? 's' : ''}
            {summary.payableGroups > 1 ? ' · plusieurs vendeurs' : ''}
          </p>
          <p className="text-body font-extrabold text-gold tabular-nums">
            {formatPrice(summary.total)}
          </p>
        </div>
        {summary.checkoutId ? (
          <>
            {summary.payableGroups > 1 ? (
              <p className="px-1 text-[11px] text-muted-foreground">
                Paiement vendeur par vendeur · prochain : {summary.checkoutName} (
                {formatPrice(summary.checkoutTotal)})
              </p>
            ) : null}
            <Link
              to={paths.checkout(summary.checkoutId)}
              className={buttonVariants({
                size: 'lg',
                className: 'h-12 w-full rounded-2xl text-[15px] font-extrabold',
              })}
            >
              <CreditCard className="size-5" aria-hidden="true" />
              {summary.payableGroups > 1
                ? `Payer · ${summary.checkoutName}`
                : 'Passer au paiement'}
              <span aria-hidden="true" className="text-lg leading-none">
                →
              </span>
            </Link>
          </>
        ) : (
          <p className="rounded-xl bg-muted px-3 py-2.5 text-center text-caption text-muted-foreground">
            Aucun article payable : vous ne pouvez pas acheter dans votre propre
            établissement.
          </p>
        )}
      </div>
    </div>
  )
}

function CartView() {
  const carts = useAllCarts()
  const serviceIds = Object.keys(carts)

  if (serviceIds.length === 0) {
    return (
      <EmptyState
        icon={ShoppingBasket}
        tone="gold"
        title="Votre panier est vide"
        description="Ajoutez des produits depuis Explorer ou le catalogue d’un vendeur."
        action={
          <Link to={paths.explore} className={buttonVariants()}>
            Explorer
          </Link>
        }
        className="py-12"
      />
    )
  }

  return (
    <div className="space-y-5">
      <ul className="space-y-5 px-4">
        {serviceIds.map((serviceId) => (
          <li key={serviceId}>
            <CartGroup serviceId={serviceId} />
          </li>
        ))}
      </ul>
      <CartCheckoutBar serviceIds={serviceIds} />
    </div>
  )
}

function PurchasesView() {
  const purchases = usePurchases()

  if (purchases.length === 0) {
    return (
      <EmptyState
        icon={ShoppingBag}
        title="Aucun achat"
        description="Vos commandes payées avec le Wallet apparaîtront ici."
        className="py-12"
      />
    )
  }

  return (
    <ul className="divide-y">
      {purchases.map((purchase) => (
        <li key={purchase.id}>
          <PurchaseRow purchase={purchase} />
        </li>
      ))}
    </ul>
  )
}

/**
 * Mon Panier : palette marque, un seul bouton « Passer au paiement ».
 */
export function CartPage() {
  const navigate = useNavigate()
  const [params, setParams] = useSearchParams()
  const view: View = params.get('vue') === 'achats' ? 'purchases' : 'cart'
  const carts = useAllCarts()
  const itemCount = Object.values(carts).reduce(
    (sum, lines) => sum + Object.values(lines).reduce((a, q) => a + q, 0),
    0,
  )

  function changeView(next: View) {
    setParams(next === 'purchases' ? { vue: 'achats' } : {}, { replace: true })
  }

  return (
    <>
      <header className="bg-linear-to-r from-brand to-[color-mix(in_srgb,var(--brand)_78%,#04170c)] text-brand-foreground">
        <div className="flex h-(--header-height) items-center gap-2 px-3">
          <button
            type="button"
            aria-label="Retour"
            onClick={() => {
              if (window.history.length > 1) navigate(-1)
              else navigate(paths.explore)
            }}
            className="grid size-10 place-items-center rounded-full bg-white/15"
          >
            <ArrowLeft className="size-5" aria-hidden="true" />
          </button>
          <div className="flex min-w-0 flex-1 items-center justify-center gap-2">
            <span className="relative">
              <ShoppingBasket className="size-5" aria-hidden="true" />
              {itemCount > 0 ? (
                <span className="absolute -top-1.5 -right-2 grid min-w-4 place-items-center rounded-full bg-gold px-1 text-[9px] font-extrabold leading-4 text-gold-foreground">
                  {itemCount > 99 ? '99+' : itemCount}
                </span>
              ) : null}
            </span>
            <h1 className="truncate text-[17px] font-extrabold tracking-tight">
              Mon Panier
            </h1>
          </div>
          <Link
            to={paths.explore}
            aria-label="Explorer les boutiques"
            className="grid size-10 place-items-center rounded-full bg-white/15"
          >
            <Store className="size-5" aria-hidden="true" />
          </Link>
        </div>
      </header>

      <div className="relative space-y-4 bg-accent/40 py-4 pb-8">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-[0.1]"
          style={{
            backgroundImage:
              'radial-gradient(circle at 20% 30%, var(--brand) 0 1.5px, transparent 2px), radial-gradient(circle at 80% 70%, var(--gold) 0 1px, transparent 1.5px)',
            backgroundSize: '32px 32px, 22px 22px',
          }}
        />
        <div className="relative space-y-4">
          <FilterChips label="Rubrique" items={VIEWS} value={view} onChange={changeView} />
          {view === 'cart' ? <CartView /> : <PurchasesView />}
        </div>
      </div>
    </>
  )
}
