import { Bell, Users } from 'lucide-react'
import { Link } from 'react-router-dom'

import { Avatar } from '@/components/common/Avatar'
import { EmptyState } from '@/components/common/EmptyState'
import { RubriquePage } from '@/components/services/RubriquePage'
import { useCurrentService } from '@/hooks/use-current-service'
import { useNow } from '@/hooks/use-now'
import { useServiceOrders } from '@/hooks/use-service-orders'
import { formatPrice } from '@/lib/format'
import { formatAgo } from '@/lib/orders'
import { getServiceTool } from '@/lib/service-tools'
import { paths } from '@/routes/paths'
import type { ServiceOrder } from '@/types/order'
import type { ServiceToolId } from '@/types/service'

interface ToolCopy {
  title: string
  description: string
}

/** Textes d'état vide des outils. */
const COPY: Partial<Record<ServiceToolId, ToolCopy>> = {
  customers: {
    title: 'Aucun client pour l’instant',
    description:
      'Vos clients et leur historique avec cet établissement apparaîtront ici.',
  },
  reports: {
    title: 'Pas encore de rapport',
    description: 'Vos rapports de ventes et de performance apparaîtront ici.',
  },
  notifications: {
    title: 'Aucune notification',
    description: 'Nouvelles commandes, stocks faibles et alertes arriveront ici.',
  },
}

interface Customer {
  name: string
  phone: string
  count: number
  total: number
}

/** Clients regroupés à partir des commandes du service (aucun autre service n'est lu). */
function groupCustomers(orders: readonly ServiceOrder[]): Customer[] {
  const map = new Map<string, Customer>()
  for (const order of orders) {
    if (order.status === 'cancelled') continue
    const key = `${order.customerName}|${order.customerPhone}`
    const current = map.get(key) ?? {
      name: order.customerName,
      phone: order.customerPhone,
      count: 0,
      total: 0,
    }
    current.count += 1
    current.total += order.total
    map.set(key, current)
  }
  return [...map.values()].sort((a, b) => b.total - a.total)
}

/**
 * Écran d'un outil de l'espace professionnel : les clients (issus des commandes du service) et
 * les notifications (commandes à traiter). Chaque outil ne contient que les données du service.
 */
export function ServiceToolPage({ toolId }: { toolId: ServiceToolId }) {
  const service = useCurrentService()
  const orders = useServiceOrders(service)
  const now = useNow(60_000)
  const tool = getServiceTool(toolId)
  const copy = COPY[toolId] ?? { title: 'Bientôt disponible', description: '' }

  const customers = toolId === 'customers' ? groupCustomers(orders) : []
  const pending =
    toolId === 'notifications' ? orders.filter((order) => order.status === 'pending') : []
  const hasContent = customers.length > 0 || pending.length > 0

  return (
    <RubriquePage toolId={toolId} showProgress={toolId !== 'notifications'}>
      {customers.length > 0 ? (
        <ul className="mx-4 overflow-hidden rounded-2xl border border-border/70 bg-card/95 shadow-[0_8px_24px_-20px_rgba(15,23,42,0.3)]">
          {customers.map((customer) => (
            <li
              key={`${customer.name}${customer.phone}`}
              className="flex min-h-16 items-center gap-3 border-b border-border/50 px-4 py-2.5 last:border-b-0"
            >
              <Avatar name={customer.name} />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-body font-bold">
                  {customer.name}
                </span>
                <span className="block truncate text-caption text-muted-foreground">
                  {customer.phone} · {customer.count} commande
                  {customer.count > 1 ? 's' : ''}
                </span>
              </span>
              <span className="shrink-0 text-body font-extrabold tabular-nums">
                {formatPrice(customer.total)}
              </span>
            </li>
          ))}
        </ul>
      ) : null}

      {pending.length > 0 ? (
        <ul className="mx-4 overflow-hidden rounded-2xl border border-border/70 bg-card/95 shadow-[0_8px_24px_-20px_rgba(15,23,42,0.3)]">
          {pending.map((order) => (
            <li key={order.id} className="border-b border-border/50 last:border-b-0">
              <Link
                to={paths.serviceOrders(service.id)}
                className="flex min-h-16 items-center gap-3 px-4 py-2.5 transition-colors hover:bg-muted/70"
              >
                <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-accent text-brand">
                  <Bell className="size-5" aria-hidden="true" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-body font-bold">
                    Nouvelle commande {order.reference}
                  </span>
                  <span className="block truncate text-caption text-muted-foreground">
                    {order.customerName} · {formatPrice(order.total)} ·{' '}
                    {formatAgo(order.createdAt, now)}
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      ) : null}

      {hasContent ? null : (
        <EmptyState
          icon={toolId === 'customers' ? Users : tool.icon}
          tone={tool.tone}
          title={copy.title}
          description={copy.description}
        />
      )}
      <p className="px-4 text-center text-caption text-muted-foreground">
        Cet outil ne contient que les données de {service.name}.
      </p>
    </RubriquePage>
  )
}
