import { useCallback, useMemo, useSyncExternalStore } from 'react'

import { getMaxQuantity } from '@/lib/catalog'
import {
  addToCart,
  clearServiceCart,
  getCart,
  setCartQuantity,
  subscribeCart,
  type CartState,
} from '@/lib/cart-store'
import type { CatalogItem } from '@/types/service'

export interface CartLine {
  item: CatalogItem
  quantity: number
}

const NO_QUANTITIES: Readonly<Record<string, number>> = {}

/** Tous les paniers de l'appareil (un par vendeur). */
export function useAllCarts(): CartState {
  return useSyncExternalStore(subscribeCart, getCart)
}

/** Nombre total d'articles dans tous les paniers. */
export function useCartCount(): number {
  const carts = useAllCarts()
  return useMemo(
    () =>
      Object.values(carts).reduce(
        (sum, lines) => sum + Object.values(lines).reduce((a, b) => a + b, 0),
        0,
      ),
    [carts],
  )
}

/**
 * Panier d'UN vendeur (profil public, panier, passage à la caisse). Il est conservé sur
 * l'appareil. Les articles supprimés ou devenus indisponibles en sortent automatiquement.
 * Le total affiché est indicatif : le serveur recalcule le montant à payer.
 */
export function useCart(items: readonly CatalogItem[], serviceId: string | undefined) {
  const carts = useAllCarts()
  const quantities = (serviceId ? carts[serviceId] : undefined) ?? NO_QUANTITIES

  const add = useCallback(
    (item: CatalogItem) => {
      if (serviceId) addToCart(serviceId, item.id, getMaxQuantity(item))
    },
    [serviceId],
  )

  const remove = useCallback(
    (item: CatalogItem) => {
      if (serviceId) addToCart(serviceId, item.id, getMaxQuantity(item), -1)
    },
    [serviceId],
  )

  const setQuantity = useCallback(
    (item: CatalogItem, quantity: number) => {
      if (serviceId) setCartQuantity(serviceId, item.id, quantity, getMaxQuantity(item))
    },
    [serviceId],
  )

  const clear = useCallback(() => {
    if (serviceId) clearServiceCart(serviceId)
  }, [serviceId])

  const lines = useMemo<CartLine[]>(
    () =>
      items.flatMap((item) => {
        const quantity = Math.min(quantities[item.id] ?? 0, getMaxQuantity(item))
        return quantity > 0 ? [{ item, quantity }] : []
      }),
    [items, quantities],
  )

  const quantityById = useMemo(
    () => new Map(lines.map((line) => [line.item.id, line.quantity])),
    [lines],
  )
  const count = lines.reduce((sum, line) => sum + line.quantity, 0)
  const total = lines.reduce((sum, line) => sum + line.item.price * line.quantity, 0)

  return { lines, quantityById, count, total, add, remove, setQuantity, clear }
}
