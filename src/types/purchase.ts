/**
 * Achat de l'utilisateur auprès d'un Service Pro, payé avec le Wallet (seul moyen de paiement).
 * Le serveur décide de tout : confirmation du paiement, transfert vers le vendeur, acceptation,
 * préparation et remise. Le frontend ne prépare qu'une demande d'achat.
 *
 *   pending_payment : demande envoyée, paiement en attente de confirmation par le serveur
 *   paid            : paiement confirmé, commande transmise au vendeur
 *   preparing       : acceptée, en préparation
 *   ready           : prête (à retirer, à servir ou à livrer)
 *   completed       : remise à l'acheteur
 *   cancelled       : refusée ou annulée (le serveur décide du remboursement)
 */
export type PurchaseStatus =
  'pending_payment' | 'paid' | 'preparing' | 'ready' | 'completed' | 'cancelled'

export interface PurchaseLine {
  itemId: string
  name: string
  quantity: number
  /** Prix unitaire affiché au moment de la demande, en FCFA. */
  unitPrice: number
}

/** Identité de l'acheteur, transmise au vendeur avec la commande. */
export interface PurchaseBuyer {
  lastName: string
  firstName: string
  /** Identifiant AfriConnect de l'acheteur. */
  userId: string
  /** Téléphone de contact en cas de problème sur la commande. */
  phone?: string
}

export interface Purchase {
  id: string
  /** Référence provisoire : le serveur attribuera la définitive. */
  reference: string
  serviceId: string
  /** Nom d'utilisateur public du vendeur (pour ouvrir son profil). */
  proRef: string
  sellerName: string
  /** Logo ou photo de profil de l'espace pro (affiché sur le ticket). */
  sellerLogo?: string
  lines: PurchaseLine[]
  /** Total indicatif en FCFA : le serveur recalcule le montant débité. */
  total: number
  /** Montant payé immédiatement (Wallet), FCFA. */
  paidAmount?: number
  /** Montant reporté en crédit commerçant, FCFA. */
  creditAmount?: number
  /** Solde restant dû sur cette commande (égal à creditAmount tant que non remboursé). */
  remainingDue?: number
  buyer: PurchaseBuyer
  /** Message à l'attention du vendeur, vide si aucun. */
  note: string
  status: PurchaseStatus
  createdAt: number
  /** Vrai pour les achats demandés sur cet appareil. */
  local: boolean
  /**
   * Identifiant de la demande Wallet liée à cet achat. Le serveur les reliera et attribuera
   * la référence définitive ; le frontend ne les joint que pour le suivi local.
   */
  walletPaymentId?: string
}
