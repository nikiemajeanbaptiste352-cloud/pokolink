/**
 * DONNÉES TEMPORAIRES : uniquement pour vérifier le rendu de l'écran Commandes.
 * Les commandes sont fabriquées à partir du catalogue du service (noms et prix réels de
 * ses éléments) pour que l'aperçu reste cohérent. Aucune commande réelle n'existe : elles
 * seront fournies par l'API (TanStack Query) quand le module Commandes sera branché.
 * Le total est calculé ici UNIQUEMENT pour fabriquer l'exemple ; le vrai total viendra du serveur.
 */
import type {
  OrderMode,
  OrderPaymentState,
  OrderStatus,
  ServiceOrder,
} from '@/types/order'
import type { CatalogItem, PaymentMethodId, Service } from '@/types/service'

interface OrderTemplate {
  customerName: string
  customerPhone: string
  status: OrderStatus
  mode: OrderMode
  preferredPayment: PaymentMethodId
  paymentState: OrderPaymentState
  /** Âge de la commande en minutes. */
  minutesAgo: number
  /** Éléments du catalogue : position dans la liste (modulo sa taille) et quantité. */
  picks: readonly (readonly [number, number])[]
  note: string
}

const TEMPLATES: readonly OrderTemplate[] = [
  {
    customerName: 'Aïssata K.',
    customerPhone: '+226 70 00 00 01',
    status: 'pending',
    mode: 'delivery',
    preferredPayment: 'orange_money',
    paymentState: 'paid',
    minutesAgo: 2,
    picks: [
      [0, 2],
      [1, 1],
    ],
    note: 'Merci de sonner deux fois.',
  },
  {
    customerName: 'Moussa O.',
    customerPhone: '+226 70 00 00 02',
    status: 'pending',
    mode: 'on_site',
    preferredPayment: 'cash',
    paymentState: 'unpaid',
    minutesAgo: 9,
    picks: [[1, 1]],
    note: '',
  },
  {
    customerName: 'Fatimata S.',
    customerPhone: '+226 70 00 00 03',
    status: 'preparing',
    mode: 'pickup',
    preferredPayment: 'wave',
    paymentState: 'paid',
    minutesAgo: 25,
    picks: [
      [2, 1],
      [0, 1],
    ],
    note: '',
  },
  {
    customerName: 'Ibrahim T.',
    customerPhone: '+226 70 00 00 04',
    status: 'ready',
    mode: 'pickup',
    preferredPayment: 'wallet',
    paymentState: 'paid',
    minutesAgo: 48,
    picks: [[0, 3]],
    note: 'Je passe dans 10 minutes.',
  },
  {
    customerName: 'Rasmata D.',
    customerPhone: '+226 70 00 00 05',
    status: 'completed',
    mode: 'delivery',
    preferredPayment: 'card',
    paymentState: 'paid',
    minutesAgo: 5 * 60,
    picks: [[1, 2]],
    note: '',
  },
  {
    customerName: 'Salif B.',
    customerPhone: '+226 70 00 00 06',
    status: 'cancelled',
    mode: 'on_site',
    preferredPayment: 'cash',
    paymentState: 'unpaid',
    minutesAgo: 26 * 60,
    picks: [[2, 1]],
    note: 'Annulée par le client.',
  },
]

const BASE_TIME = Date.now()

function pickPayment(service: Service, preferred: PaymentMethodId): PaymentMethodId {
  if (service.paymentMethods.includes(preferred)) return preferred
  return service.paymentMethods[0] ?? 'cash'
}

/** Exemples de commandes d'UN service, à partir de son propre catalogue (vide si catalogue vide). */
export function buildTempOrders(
  service: Service,
  items: readonly CatalogItem[],
): ServiceOrder[] {
  if (items.length === 0) return []

  return TEMPLATES.map((template, index) => {
    const merged = new Map<string, { item: CatalogItem; quantity: number }>()
    for (const [position, quantity] of template.picks) {
      const item = items[position % items.length]!
      const existing = merged.get(item.id)
      merged.set(item.id, { item, quantity: (existing?.quantity ?? 0) + quantity })
    }
    const lines = [...merged.values()].map(({ item, quantity }) => ({
      itemId: item.id,
      name: item.name,
      quantity,
      unitPrice: item.price,
    }))

    return {
      id: `${service.id}-order-${index + 1}`,
      serviceId: service.id,
      reference: `#${1042 - index}`,
      customerName: template.customerName,
      customerPhone: template.customerPhone,
      status: template.status,
      mode: template.mode,
      paymentMethod: pickPayment(service, template.preferredPayment),
      paymentState: template.paymentState,
      lines,
      total: lines.reduce((sum, line) => sum + line.unitPrice * line.quantity, 0),
      note: template.note,
      createdAt: new Date(BASE_TIME - template.minutesAgo * 60_000).toISOString(),
    }
  })
}
