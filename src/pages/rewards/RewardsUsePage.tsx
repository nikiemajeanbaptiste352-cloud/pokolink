import { ShoppingBag } from 'lucide-react'
import { Link } from 'react-router-dom'

import { BackLink } from '@/components/common/BackLink'
import { EmptyState } from '@/components/common/EmptyState'
import { Media } from '@/components/common/Media'
import { PageHeader } from '@/components/common/PageHeader'
import { buttonVariants } from '@/components/ui/button'
import { useRewardsBalances } from '@/hooks/use-rewards'
import { DEMO_PROS } from '@/lib/directory'
import { formatPrice } from '@/lib/format'
import { formatPoints } from '@/lib/rewards-labels'
import { paths } from '@/routes/paths'

const MAX_PRODUCTS = 8

/** Utiliser des points : produits éligibles à parcourir, le paiement se fait à la commande. */
export function RewardsUsePage() {
  const { available } = useRewardsBalances()
  const products = DEMO_PROS.flatMap((pro) =>
    pro.items.slice(0, 1).map((item) => ({ item, seller: pro.service.name })),
  ).slice(0, MAX_PRODUCTS)

  return (
    <>
      <PageHeader
        title="Utiliser mes points"
        leading={<BackLink to={paths.rewards} label="Rewards" history />}
      />

      <div className="space-y-4 py-4">

        <p className="px-4 text-body text-muted-foreground">
          Points disponibles : <strong>{formatPoints(available)}</strong>. Les points ne
          se retirent pas en FCFA.
        </p>

        {products.length === 0 ? (
          <EmptyState
            icon={ShoppingBag}
            tone="info"
            title="Aucun produit éligible"
            description="Les produits qui acceptent les points apparaîtront ici."
          />
        ) : (
          <ul className="space-y-3 px-4">
            {products.map(({ item, seller }) => (
              <li key={item.id}>
                <Link
                  to={paths.product(item.id)}
                  className="flex min-h-16 items-center gap-3 rounded-xl border bg-card p-3 shadow-card hover:bg-muted"
                >
                  <Media
                    src={item.image || undefined}
                    alt=""
                    icon={ShoppingBag}
                    tone="gold"
                    className="size-14 shrink-0 rounded-lg"
                  />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-body font-bold">
                      {item.name}
                    </span>
                    <span className="block truncate text-caption text-muted-foreground">
                      {seller} · {formatPrice(item.price)}
                    </span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}

        <div className="px-4">
          <Link
            to={paths.explore}
            className={buttonVariants({ variant: 'outline', className: 'w-full' })}
          >
            Parcourir toutes les boutiques
          </Link>
        </div>
      </div>
    </>
  )
}
