import { ClipboardList, PackagePlus } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'

import { EmptyState } from '@/components/common/EmptyState'
import { FilterChips } from '@/components/common/FilterChips'
import { OrderCard } from '@/components/services/orders/OrderCard'
import { OrderSheet } from '@/components/services/orders/OrderSheet'
import { RubriquePage } from '@/components/services/RubriquePage'
import { buttonVariants } from '@/components/ui/button'
import { useCurrentService } from '@/hooks/use-current-service'
import { useNow } from '@/hooks/use-now'
import { useServiceOrders } from '@/hooks/use-service-orders'
import { getOrderFilterLabel, ORDER_FILTER_ORDER, type OrderFilter } from '@/lib/orders'
import { paths } from '@/routes/paths'

/** Commandes d'UN service : filtre par statut, liste et détail. */
export function ServiceOrdersPage() {
  const service = useCurrentService()
  const orders = useServiceOrders(service)
  const now = useNow(60_000)
  const [filter, setFilter] = useState<OrderFilter>('all')
  const [openId, setOpenId] = useState<string | null>(null)

  const visible = filter === 'all' ? orders : orders.filter((o) => o.status === filter)
  const opened = orders.find((order) => order.id === openId) ?? null
  const chips = ORDER_FILTER_ORDER.map((id) => {
    const count =
      id === 'all' ? orders.length : orders.filter((o) => o.status === id).length
    return { id, label: `${getOrderFilterLabel(id)} (${count})` }
  })

  return (
    <RubriquePage toolId="orders">
      {orders.length === 0 ? (
        <EmptyState
          icon={PackagePlus}
          tone="info"
          title="Pas encore de commande"
          description="Ajoutez d’abord des éléments à votre catalogue : les commandes de vos clients porteront sur ces éléments."
          action={
            <Link to={paths.serviceItemNew(service.id)} className={buttonVariants()}>
              Ajouter un élément
            </Link>
          }
        />
      ) : (
        <>
          <FilterChips
            label="Filtrer les commandes par statut"
            items={chips}
            value={filter}
            onChange={setFilter}
          />

          {visible.length === 0 ? (
            <EmptyState
              icon={ClipboardList}
              title="Aucune commande"
              description="Aucune commande ne correspond à ce statut."
              className="py-8"
            />
          ) : (
            <ul className="space-y-3 px-4">
              {visible.map((order) => (
                <li key={order.id}>
                  <OrderCard
                    order={order}
                    now={now}
                    onOpen={(item) => setOpenId(item.id)}
                  />
                </li>
              ))}
            </ul>
          )}
        </>
      )}

      <OrderSheet order={opened} now={now} onClose={() => setOpenId(null)} />
    </RubriquePage>
  )
}
