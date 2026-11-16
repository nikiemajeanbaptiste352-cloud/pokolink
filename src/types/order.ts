import type { PaymentMethodId } from '@/types/service'

/**
 * pending    : reçue, en attente d'acceptation
 * preparing  : acceptée, en préparation
 * ready      : prête (à retirer, à servir ou à livrer)
 * completed  : remise au client
 * cancelled  : refusée ou annulée
 */
export type OrderStatus = 'pending' | 'preparing' | 'ready' | 'completed' | 'cancelled'

/** Comment la commande est remise au client. */
export type OrderMode = 'on_site' | 'pickup' | 'delivery'

export type OrderPaymentState = 'paid' | 'unpaid'

export interface OrderLine {
  itemId: string
  name: string
  quantity: number
  /** Prix unitaire au moment de la commande, en FCFA. */
  unitPrice: number
}

/**
 * Commande reçue par UN service. Tous les montants et statuts viennent du serveur ;
 * l'interface ne fait que les afficher.
 */
export interface ServiceOrder {
  id: string
  serviceId: string
  /** Numéro lisible, ex. « #1042 ». */
  reference: string
  customerName: string
  customerPhone: string
  status: OrderStatus
  mode: OrderMode
  paymentMethod: PaymentMethodId
  paymentState: OrderPaymentState
  lines: OrderLine[]
  /** Total en FCFA, fourni par le serveur. */
  total: number
  /** Message du client, vide si aucun. */
  note: string
  /** Date de création, format ISO. */
  createdAt: string
}
