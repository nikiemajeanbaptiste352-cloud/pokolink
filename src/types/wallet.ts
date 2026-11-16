/**
 * Wallet AfriConnect : types d'affichage. Le frontend ne calcule jamais un solde, un
 * crédit, un frais ni un statut : toutes ces valeurs viennent du serveur (rapport
 * Wallet v3.0). Les statuts portent les noms de l'API.
 */

/** Soldes (FCFA, entiers), fournis par le serveur. */
export interface WalletBalances {
  /** Montant utilisable pour les paiements et les retraits. */
  available: number
  /** Montant réservé (retraits en cours) : comptabilisé, mais pas disponible. */
  reserved: number
  /** Valeur comptable totale des fonds de l'utilisateur. */
  total: number
}

export type DepositStatus =
  | 'CREATED'
  | 'WAITING_PAYMENT'
  | 'PAYMENT_DETECTED'
  | 'VERIFYING'
  | 'APPROVED'
  | 'CREDITED'
  | 'REJECTED'
  | 'EXPIRED'
  | 'MANUAL_REVIEW'

export type WithdrawalStatus =
  | 'PENDING_ADMIN'
  | 'VALIDATED'
  | 'PROCESSING'
  | 'COMPLETED'
  | 'REJECTED'
  | 'FAILED'
  | 'MANUAL_REVIEW'
  | 'CANCELLED'

/** Informations que l'utilisateur déclare après son transfert (aide au rapprochement). */
export interface DepositDeclaration {
  amount: number
  senderNumber: string
  merchantNumber: string
  /** Heure du transfert déclarée, en millisecondes. */
  transferredAt: number
  /** Identifiant de transaction de l'opérateur ; absent = vérification manuelle. */
  transactionId?: string
}

export interface DepositRequest {
  id: string
  reference: string
  operator: string
  amount: number
  status: DepositStatus
  createdAt: number
  /** `created_at` + 5 minutes, calculé par le serveur. */
  expiresAt: number
  merchantNumber: string
  /** Code USSD fourni par le serveur (exemple à confirmer avec l'opérateur). */
  ussd: string
  declaration?: DepositDeclaration
  creditedAt?: number
}

export interface WithdrawalPayout {
  externalId: string
  amountSent: number
  transferredAt: number
}

export interface WithdrawalRequest {
  id: string
  reference: string
  /** Montant demandé, déduit du solde disponible dès la création. */
  amount: number
  /** Frais : `null` tant qu'ils ne sont pas définis par l'administration. */
  fee: number | null
  /** Montant net à transférer, calculé par le serveur. */
  netAmount: number | null
  methodId: string
  beneficiaryName: string
  beneficiaryNumber: string
  status: WithdrawalStatus
  createdAt: number
  updatedAt: number
  payout?: WithdrawalPayout
}

/**
 * Nature d'une ligne du journal :
 *   deposit / withdrawal : entrée ou sortie de fonds du Wallet
 *   payment              : paiement effectué (débit)
 *   credit               : paiement reçu en tant que vendeur ou prestataire (crédit net)
 *   commission           : commission AfriConnect appliquée (déjà déduite du crédit net)
 *   refund               : remboursement reçu
 *   cancellation         : annulation (contrepassation) d'une opération précédente
 */
export type WalletTransactionKind =
  | 'deposit'
  | 'withdrawal'
  | 'payment'
  | 'credit'
  | 'commission'
  | 'refund'
  | 'cancellation'

/**
 * Justificatif lié à une opération : un « reçu » prouve un paiement, un « ticket » doit en
 * plus être validé physiquement par le prestataire (QR code).
 */
export type WalletDocumentKind = 'receipt' | 'ticket'

/**
 * Ligne de l'historique. `amount` est signé (crédit positif, débit négatif). Une ligne n'est
 * jamais supprimée : une erreur se corrige par une annulation ou une contrepassation.
 */
export interface WalletTransaction {
  id: string
  kind: WalletTransactionKind
  title: string
  detail?: string
  amount: number
  at: number
  /** Écran de détail. */
  to?: string
  /** Référence unique de la transaction, attribuée par le serveur. */
  reference?: string
  /** Autre partie : vendeur, prestataire ou utilisateur. */
  counterpart?: { name: string; handle?: string }
  /** Référence de l'opération d'origine (remboursement, annulation, commission). */
  relatedReference?: string
  /** Montant payé avant commission (crédits et commissions). */
  gross?: number
  /** Commission AfriConnect appliquée, calculée par le serveur. */
  commission?: number
  /** Justificatif généré après la confirmation du paiement. */
  document?: WalletDocumentKind
}

/** Moyen de dépôt ou de retrait, configuré par l'administration. */
export interface WalletMethod {
  id: string
  label: string
}

/**
 * À quoi sert une demande depuis le Wallet : mise ou coins (Creator Market), forfait d'un
 * Service Pro, envoi d'argent à un autre utilisateur (P2P) ou demande d'argent (P2P).
 */
export type WalletPaymentPurpose =
  | 'position'
  | 'coins'
  | 'subscription'
  | 'advertising'
  | 'purchase'
  | 'event'
  | 'p2p_send'
  | 'p2p_request'

/** Module métier à l’origine de la demande (reporting, pas un second ledger). */
export type WalletPaymentDomain =
  | 'afrilearn'
  | 'pro'
  | 'market'
  | 'studio'
  | 'event'
  | 'p2p'

/**
 * Demande de paiement interne (transfert Wallet → Wallet).
 * Le frontend envoie l’identification complète acheteur + vendeur ; le backend seul
 * débite le Wallet acheteur et crédite le Wallet vendeur.
 */
export interface WalletPaymentRequest {
  id: string
  purpose: WalletPaymentPurpose
  /** Origine produit (AfriLearn, Pro…). Absent = legacy / générique. */
  domain?: WalletPaymentDomain
  title: string
  detail?: string
  /** Autre utilisateur concerné (P2P), ex. « @awa.k ». */
  recipient?: string
  /** Montant demandé en FCFA (entier). Jamais un mouvement du solde tant qu'il est en attente. */
  amount: number
  createdAt: number
  /**
   * Toujours un transfert intra-Wallet : argent déjà déposé, mécanismes internes
   * (acheter, participer, s’abonner, P2P…).
   */
  transferKind: 'internal_wallet'
  /** Payeur tel que vérifié dans le formulaire (nom complet). */
  payerName?: string
  /** Identifiant AfriConnect du payeur (sans @) — requis pour le débit Wallet. */
  payerHandle?: string
  /** Adresse, uniquement si la prestation ou la livraison l'exige. */
  payerAddress?: string
  /**
   * Numéro de téléphone de l'acheteur : contact en cas de problème sur la transaction
   * (paiements intra-Wallet).
   */
  payerPhone?: string
  /** Identifiant AfriConnect du bénéficiaire à créditer (sans @). */
  beneficiaryHandle?: string
  /** Nom du bénéficiaire / commerce à créditer. */
  beneficiaryName?: string
  /** Identifiant technique de l'espace pro, si applicable. */
  beneficiaryServiceId?: string
  /** Raison sociale / enseigne affichée côté vendeur. */
  beneficiaryBusiness?: string
  /** Quantité, si la transaction en a. */
  quantity?: number
  /** Prix unitaire en FCFA, si applicable. */
  unitPrice?: number
  /** Référence provisoire de la demande (le serveur attribue la définitive). */
  provisionalReference?: string
}
