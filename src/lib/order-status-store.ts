/**
 * Statuts de commandes modifiés par le vendeur sur cet appareil (accepter, préparer, terminer,
 * refuser).
 *
 * STOCKAGE TEMPORAIRE : à remplacer par l'API Commandes. Le serveur reste maître du paiement et
 * de l'état réel de la commande ; ces changements ne touchent ni le Wallet ni le client.
 */
import { createLocalStore } from '@/lib/local-store'
import type { OrderStatus } from '@/types/order'

const STATUSES: readonly string[] = [
  'pending',
  'preparing',
  'ready',
  'completed',
  'cancelled',
]

export const orderStatusStore = createLocalStore<Readonly<Record<string, OrderStatus>>>(
  'africonnect.order-status.v1',
  (raw) => {
    const result: Record<string, OrderStatus> = {}
    if (typeof raw !== 'object' || raw === null) return result
    for (const [id, status] of Object.entries(raw)) {
      if (typeof status === 'string' && STATUSES.includes(status)) {
        result[id] = status as OrderStatus
      }
    }
    return result
  },
)

export function setOrderStatus(orderId: string, status: OrderStatus) {
  orderStatusStore.set({ ...orderStatusStore.get(), [orderId]: status })
}
