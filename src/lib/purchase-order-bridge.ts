/**
 * Pont acheteur (purchases-store) → vendeur (commandes Espace Pro).
 */
import type { OrderStatus, ServiceOrder } from '@/types/order'
import type { Purchase, PurchaseStatus } from '@/types/purchase'
import type { PaymentMethodId, Service } from '@/types/service'

function purchaseStatusToOrder(status: PurchaseStatus): OrderStatus {
  switch (status) {
    case 'pending_payment':
    case 'paid':
      return 'pending'
    case 'preparing':
      return 'preparing'
    case 'ready':
      return 'ready'
    case 'completed':
      return 'completed'
    case 'cancelled':
      return 'cancelled'
  }
}

/** Convertit un achat Wallet en commande visible côté Service Pro. */
export function purchaseToServiceOrder(
  purchase: Purchase,
  service: Service,
): ServiceOrder {
  const paymentMethod: PaymentMethodId =
    service.paymentMethods.includes('wallet')
      ? 'wallet'
      : (service.paymentMethods[0] ?? 'wallet')
  const name = [purchase.buyer.firstName, purchase.buyer.lastName]
    .filter(Boolean)
    .join(' ')
    .trim()
  return {
    id: purchase.id,
    serviceId: purchase.serviceId,
    reference: purchase.reference.startsWith('#')
      ? purchase.reference
      : `#${purchase.reference}`,
    customerName: name || purchase.buyer.userId || 'Client',
    customerPhone: purchase.buyer.phone ?? '',
    status: purchaseStatusToOrder(purchase.status),
    mode: 'pickup',
    paymentMethod,
    paymentState:
      purchase.status === 'pending_payment' || purchase.status === 'cancelled'
        ? 'unpaid'
        : 'paid',
    lines: purchase.lines.map((line) => ({
      itemId: line.itemId,
      name: line.name,
      quantity: line.quantity,
      unitPrice: line.unitPrice,
    })),
    total: purchase.total,
    note: purchase.note,
    createdAt: new Date(purchase.createdAt).toISOString(),
  }
}
