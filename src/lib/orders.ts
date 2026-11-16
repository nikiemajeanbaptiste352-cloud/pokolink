import {
  CircleCheck,
  CircleX,
  Hourglass,
  Loader,
  PackageCheck,
  type LucideIcon,
} from 'lucide-react'

import type { Tone } from '@/lib/tones'
import type { OrderMode, OrderStatus, ServiceOrder } from '@/types/order'

interface OrderStatusMeta {
  label: string
  icon: LucideIcon
  tone: Tone
  /** Libellé du filtre (pluriel). */
  filterLabel: string
}

export const ORDER_STATUS: Record<OrderStatus, OrderStatusMeta> = {
  pending: {
    label: 'En attente',
    filterLabel: 'En attente',
    icon: Hourglass,
    tone: 'amber',
  },
  preparing: {
    label: 'En préparation',
    filterLabel: 'En préparation',
    icon: Loader,
    tone: 'info',
  },
  ready: { label: 'Prête', filterLabel: 'Prêtes', icon: PackageCheck, tone: 'violet' },
  completed: {
    label: 'Terminée',
    filterLabel: 'Terminées',
    icon: CircleCheck,
    tone: 'brand',
  },
  cancelled: { label: 'Annulée', filterLabel: 'Annulées', icon: CircleX, tone: 'red' },
}

/** Ordre du déroulement normal d'une commande (hors annulation). */
export const ORDER_STEPS: readonly OrderStatus[] = [
  'pending',
  'preparing',
  'ready',
  'completed',
]

export const ORDER_MODE_LABEL: Record<OrderMode, string> = {
  on_site: 'Sur place',
  pickup: 'À emporter',
  delivery: 'Livraison',
}

export type OrderFilter = 'all' | OrderStatus

export const ORDER_FILTER_ORDER: readonly OrderFilter[] = [
  'all',
  'pending',
  'preparing',
  'ready',
  'completed',
  'cancelled',
]

export function getOrderFilterLabel(filter: OrderFilter): string {
  return filter === 'all' ? 'Toutes' : ORDER_STATUS[filter].filterLabel
}

/** Résumé d'une commande en une ligne : « 2 × Thiéboudienne, 1 × Bissap ». */
export function summarizeOrder(order: ServiceOrder): string {
  return order.lines.map((line) => `${line.quantity} × ${line.name}`).join(', ')
}

/** État du paiement en mots ; sans objet pour une commande annulée. */
export function getPaymentLabel(order: ServiceOrder): string {
  if (order.status === 'cancelled') return 'Sans objet'
  return order.paymentState === 'paid' ? 'Payée' : 'À encaisser'
}

/** Âge d'une commande : « à l'instant », « il y a 12 min », « il y a 5 h », « il y a 2 j ». */
export function formatAgo(iso: string, now: number): string {
  const minutes = Math.max(0, Math.floor((now - new Date(iso).getTime()) / 60_000))
  if (minutes < 1) return 'à l’instant'
  if (minutes < 60) return `il y a ${minutes} min`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `il y a ${hours} h`
  return `il y a ${Math.floor(hours / 24)} j`
}
