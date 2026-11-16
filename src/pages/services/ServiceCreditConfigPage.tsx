import { HandCoins, Package, Settings2 } from 'lucide-react'
import { Link } from 'react-router-dom'

import { EmptyState } from '@/components/common/EmptyState'
import { SwitchRow } from '@/components/form/SwitchRow'
import { RubriquePage } from '@/components/services/RubriquePage'
import { buttonVariants } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { useCurrentService } from '@/hooks/use-current-service'
import { useServiceItems, useServices } from '@/hooks/use-services'
import { formatPrice } from '@/lib/format'
import { paths } from '@/routes/paths'
import type { CatalogItem } from '@/types/service'

/** Configuration du crédit commerçant : établissement + articles. */
export function ServiceCreditConfigPage() {
  const service = useCurrentService()
  const items = useServiceItems(service.id)
  const { updateService, updateItem } = useServices()
  const enabled = service.allowMerchantCredit === true
  const creditItems = items.filter((i) => i.allowMerchantCredit)

  function setServiceCredit(next: boolean) {
    updateService(service.id, { allowMerchantCredit: next })
    if (!next) {
      // Désactivation établissement → retire le crédit sur tous les articles.
      for (const item of items) {
        if (item.allowMerchantCredit) {
          updateItem(item.id, { ...toInput(item), allowMerchantCredit: false })
        }
      }
    }
  }

  function setItemCredit(item: CatalogItem, next: boolean) {
    if (!enabled && next) return
    updateItem(item.id, { ...toInput(item), allowMerchantCredit: next })
  }

  return (
    <RubriquePage
      toolId="credits"
      title="Configuration du crédit"
      subtitle={`Autorisations · ${service.name}`}
      showProgress={false}
      action={
        <Link
          to={paths.serviceCredits(service.id)}
          className={buttonVariants({ variant: 'outline', size: 'sm' })}
        >
          Crédits clients
        </Link>
      }
    >
      <div className="space-y-4 px-4">
        <section
          aria-label="Autorisation établissement"
          className="rounded-2xl border bg-card px-3 shadow-card"
        >
          <SwitchRow
            label="Autoriser le crédit commerçant"
            description="Active le crédit pour cet établissement. Chaque produit doit ensuite être autorisé individuellement. AfriConnect ne prête pas."
            checked={enabled}
            onCheckedChange={setServiceCredit}
          />
        </section>

        <section
          aria-label="État"
          className="grid grid-cols-2 gap-2 rounded-2xl border bg-card p-3.5 shadow-card"
        >
          <div>
            <p className="text-[11px] font-semibold text-muted-foreground uppercase">
              Établissement
            </p>
            <p className="text-body font-extrabold">
              {enabled ? 'Activé' : 'Désactivé'}
            </p>
          </div>
          <div>
            <p className="text-[11px] font-semibold text-muted-foreground uppercase">
              Articles à crédit
            </p>
            <p className="text-body font-extrabold">
              {creditItems.length} / {items.length}
            </p>
          </div>
        </section>

        <section aria-label="Articles" className="space-y-2">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-body font-extrabold">Par produit ou service</h2>
            <Link
              to={paths.serviceCatalog(service.id)}
              className="text-[12px] font-bold text-brand"
            >
              Catalogue ›
            </Link>
          </div>

          {!enabled ? (
            <p className="rounded-xl border border-dashed bg-muted/40 px-3.5 py-3 text-caption text-muted-foreground">
              Activez d’abord le crédit au niveau de l’établissement pour autoriser des
              articles.
            </p>
          ) : null}

          {items.length === 0 ? (
            <EmptyState
              icon={Package}
              title="Catalogue vide"
              description="Ajoutez des produits, puis autorisez le crédit article par article."
              action={
                <Link
                  to={paths.serviceItemNew(service.id)}
                  className={buttonVariants()}
                >
                  Ajouter un article
                </Link>
              }
              className="py-8"
            />
          ) : (
            <ul className="divide-y rounded-2xl border bg-card shadow-card">
              {items.map((item) => (
                <li key={item.id} className="px-3">
                  <div className="flex items-center gap-3 py-2.5">
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[13px] font-bold">{item.name}</p>
                      <p className="text-[11px] text-muted-foreground tabular-nums">
                        {formatPrice(item.price)}
                        {item.allowMerchantCredit ? ' · crédit OK' : ''}
                      </p>
                    </div>
                    <Switch
                      label={`Crédit · ${item.name}`}
                      checked={enabled && (item.allowMerchantCredit ?? false)}
                      onCheckedChange={(v) => setItemCredit(item, v)}
                      disabled={!enabled}
                    />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <p className="flex items-start gap-2 text-caption text-muted-foreground">
          <Settings2 className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
          Sur le paiement, le crédit n’apparaît que si l’établissement et l’article sont
          activés.
        </p>

        <Link
          to={paths.serviceCredits(service.id)}
          className={buttonVariants({ variant: 'outline', className: 'w-full' })}
        >
          <HandCoins aria-hidden="true" />
          Voir les crédits clients
        </Link>
      </div>
    </RubriquePage>
  )
}

function toInput(item: CatalogItem) {
  return {
    name: item.name,
    image: item.image,
    description: item.description,
    price: item.price,
    category: item.category,
    stockMode: item.stockMode,
    quantity: item.quantity,
    available: item.available,
    allowMerchantCredit: item.allowMerchantCredit ?? false,
    options: item.options,
  }
}
