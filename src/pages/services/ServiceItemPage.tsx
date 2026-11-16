import { CircleCheck, CircleX, Eye, Pencil } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'

import { BackLink } from '@/components/common/BackLink'
import { Media } from '@/components/common/Media'
import { ProductCard } from '@/components/services/catalog/ProductCard'
import { ServiceNotFound } from '@/components/services/ServiceNotFound'
import { buttonVariants } from '@/components/ui/button'
import { useCurrentService } from '@/hooks/use-current-service'
import { useServiceItems } from '@/hooks/use-services'
import { getStockLabel, isOrderable } from '@/lib/catalog'
import { formatPrice } from '@/lib/format'
import { getServiceTypeMeta } from '@/lib/service-types'
import { cn } from '@/lib/utils'
import { paths } from '@/routes/paths'

const MAX_RELATED = 6

/** Fiche produit : image, prix, disponibilité, description, options, produits proches. */
export function ServiceItemPage() {
  const service = useCurrentService()
  const { itemId } = useParams()
  const items = useServiceItems(service.id)
  const meta = getServiceTypeMeta(service.type)
  // Un élément d'un autre service est introuvable ici : les catalogues sont isolés.
  const item = items.find((i) => i.id === itemId)

  if (!item) return <ServiceNotFound backTo={paths.serviceCatalog(service.id)} />

  const orderable = isOrderable(item)
  const related = items
    .filter((i) => i.id !== item.id && i.category === item.category)
    .slice(0, MAX_RELATED)
  const StockIcon = orderable ? CircleCheck : CircleX

  return (
    <article className="pb-6">
      <div className="flex items-center gap-2 px-4 pt-4">
        <BackLink
          to={paths.serviceCatalog(service.id)}
          label={meta.catalogLabel}
          className="-ml-2"
        />
        <p className="min-w-0 truncate text-body text-muted-foreground">
          {meta.catalogLabel} · {item.category}
        </p>
      </div>

      <Media
        src={item.image || undefined}
        alt={item.name}
        icon={meta.icon}
        tone={meta.tone}
        className="mt-2 aspect-square w-full sm:aspect-video"
      />

      <div className="space-y-6 px-4 pt-5">
        <header className="space-y-2">
          <span className="inline-flex rounded-full bg-secondary px-2.5 py-1 text-caption font-bold text-secondary-foreground">
            {item.category}
          </span>
          <h2 className="text-headline font-extrabold">{item.name}</h2>
          <p className="text-3xl font-extrabold">{formatPrice(item.price)}</p>
          <p
            className={cn(
              'inline-flex items-center gap-1.5 text-body font-semibold',
              !orderable && 'text-danger',
            )}
          >
            <StockIcon className="size-5" aria-hidden="true" />
            {getStockLabel(item)}
          </p>
        </header>

        <div className="grid gap-3 sm:grid-cols-2">
          <Link
            to={paths.serviceItemEdit(service.id, item.id)}
            className={buttonVariants({ size: 'lg' })}
          >
            <Pencil aria-hidden="true" />
            Modifier la fiche
          </Link>
          <Link
            to={paths.product(item.id)}
            className={buttonVariants({ variant: 'outline', size: 'lg' })}
          >
            <Eye aria-hidden="true" />
            Voir côté client
          </Link>
        </div>

        <section aria-labelledby="item-description" className="space-y-2">
          <h3 id="item-description" className="text-title font-bold">
            Description
          </h3>
          {item.description ? (
            <p className="text-body whitespace-pre-line">{item.description}</p>
          ) : (
            <p className="text-body text-muted-foreground">
              Aucune description. Ajoutez-en une pour rassurer vos clients.
            </p>
          )}
        </section>

        {item.options.length > 0 ? (
          <section aria-labelledby="item-options" className="space-y-2">
            <h3 id="item-options" className="text-title font-bold">
              Options
            </h3>
            <ul className="divide-y rounded-2xl border bg-card">
              {item.options.map((option) => (
                <li
                  key={option.name}
                  className="flex min-h-12 items-center justify-between gap-3 px-4 py-2"
                >
                  <span className="min-w-0 text-body font-semibold">{option.name}</span>
                  <span className="shrink-0 text-body text-muted-foreground">
                    {option.extraPrice > 0
                      ? `+ ${formatPrice(option.extraPrice)}`
                      : 'Gratuit'}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        <section aria-labelledby="item-info" className="space-y-2">
          <h3 id="item-info" className="text-title font-bold">
            Informations
          </h3>
          <dl className="divide-y rounded-2xl border bg-card">
            {[
              ['Type', meta.itemLabel],
              ['Catégorie', item.category],
              ['Prix', formatPrice(item.price)],
              [
                'Suivi du stock',
                item.stockMode === 'quantity' ? 'Par quantité' : 'Disponible ou non',
              ],
              ['Disponibilité', getStockLabel(item)],
            ].map(([label, value]) => (
              <div
                key={label}
                className="flex min-h-12 items-center justify-between gap-3 px-4 py-2"
              >
                <dt className="text-body text-muted-foreground">{label}</dt>
                <dd className="min-w-0 text-right text-body font-semibold">{value}</dd>
              </div>
            ))}
          </dl>
        </section>
      </div>

      {related.length > 0 ? (
        <section aria-labelledby="item-related" className="mt-8 space-y-3">
          <h3 id="item-related" className="px-4 text-title font-bold">
            Dans la même catégorie
          </h3>
          <ul className="flex scrollbar-none gap-3 overflow-x-auto px-4 pb-2">
            {related.map((r) => (
              <li key={r.id} className="flex w-40 shrink-0 flex-col">
                <ProductCard
                  item={r}
                  icon={meta.icon}
                  tone={meta.tone}
                  className="flex-1"
                />
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </article>
  )
}
