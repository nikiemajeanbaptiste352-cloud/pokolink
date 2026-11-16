import { useMemo, useSyncExternalStore } from 'react'

import { useLocalStore } from '@/hooks/use-local-store'
import { useServiceItems } from '@/hooks/use-services'
import { orderStatusStore } from '@/lib/order-status-store'
import { TEMP_PURCHASES } from '@/lib/placeholder-purchases'
import { buildTempOrders } from '@/lib/placeholder-orders'
import { purchaseToServiceOrder } from '@/lib/purchase-order-bridge'
import {
  getStoredPurchases,
  subscribePurchases,
} from '@/lib/purchases-store'
import type { ServiceOrder } from '@/types/order'
import type { Service } from '@/types/service'

/**
 * Commandes d’UN service : achats Wallet réels (purchases-store) en priorité,
 * exemples catalogue en secours si aucune vente locale.
 */
export function useServiceOrders(service: Service): ServiceOrder[] {
  const items = useServiceItems(service.id)
  const overrides = useLocalStore(orderStatusStore)
  const stored = useSyncExternalStore(subscribePurchases, getStoredPurchases)

  return useMemo(() => {
    const purchases = [...stored, ...TEMP_PURCHASES].filter(
      (p) => p.serviceId === service.id,
    )
    const fromPurchases = purchases.map((p) =>
      purchaseToServiceOrder(p, service),
    )
    const seen = new Set(fromPurchases.map((o) => o.id))
    const fallback =
      fromPurchases.length > 0
        ? []
        : buildTempOrders(service, items).filter((o) => !seen.has(o.id))
    return [...fromPurchases, ...fallback]
      .map((order) => {
        const status = overrides[order.id]
        return status ? { ...order, status } : order
      })
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  }, [service, items, overrides, stored])
}
