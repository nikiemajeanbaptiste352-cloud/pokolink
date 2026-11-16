/**
 * Crédit commerçant : créance du vendeur envers son client.
 * Distinct du Wallet (paiement immédiat). AfriConnect ne prête pas.
 */

export type MerchantDebtStatus = 'open' | 'partial' | 'settled'

export interface MerchantCreditMovement {
  id: string
  /** `sale` = nouvelle dette ; `repayment` = remboursement (pas une nouvelle vente). */
  kind: 'sale' | 'repayment'
  amount: number
  /** Référence transaction / ticket lié. */
  reference: string
  purchaseId?: string
  ticketId?: string
  note?: string
  createdAt: number
}

/** Dette d’un client envers une boutique (une fiche par couple client × service). */
export interface MerchantDebt {
  id: string
  serviceId: string
  sellerName: string
  sellerLogo?: string
  proRef: string
  /** Identifiant AfriConnect du client (sans @). */
  clientHandle: string
  clientName: string
  /** Principal initial cumulé des ventes à crédit. */
  principal: number
  /** Total remboursé. */
  repaid: number
  /** Solde restant dû (= principal − repaid). */
  balance: number
  status: MerchantDebtStatus
  movements: MerchantCreditMovement[]
  createdAt: number
  updatedAt: number
}
