/**
 * Articles de démonstration de la maquette paiement AfriConnect.
 * Sous-total : 30 000 FCFA.
 */
export interface DemoPaymentOrderLine {
  id: string
  name: string
  sellerName: string
  reference?: string
  quantity: number
  unitPrice: number
  imageSrc?: string
  /** Autorisation crédit commerçant pour cette ligne (par article). */
  allowMerchantCredit?: boolean
}

export const DEMO_PAYMENT_ORDER_LINES: readonly DemoPaymentOrderLine[] = [
  {
    id: 'demo-sac',
    name: 'Sac artisanal',
    sellerName: 'Boutique Aïcha',
    reference: 'SAC-025',
    quantity: 1,
    unitPrice: 10_000,
    imageSrc:
      'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=200&h=200&fit=crop',
  },
  {
    id: 'demo-baskets',
    name: 'Baskets sport',
    sellerName: 'Sport Plus',
    reference: 'BS-100',
    quantity: 1,
    unitPrice: 8_000,
    imageSrc:
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=200&h=200&fit=crop',
  },
  {
    id: 'demo-ecouteurs',
    name: 'Écouteurs Bluetooth',
    sellerName: 'Tech Shop',
    reference: 'EC-205',
    quantity: 1,
    unitPrice: 12_000,
    imageSrc:
      'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=200&h=200&fit=crop',
  },
]

export const DEMO_PAYMENT_SUBTOTAL = DEMO_PAYMENT_ORDER_LINES.reduce(
  (sum, line) => sum + line.unitPrice * line.quantity,
  0,
)
