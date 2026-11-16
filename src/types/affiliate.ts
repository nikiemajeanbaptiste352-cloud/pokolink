/**
 * Programme d’affiliation AfriConnect (Espace Pro vendeur + affiliés).
 * Données locales / démo ; à remplacer par l’API.
 */

export type AffiliateProgramStatus =
  | 'draft'
  | 'published'
  | 'suspended'
  | 'closed'

export type AffiliateAudience = 'creators' | 'users' | 'both'

export type AffiliateMembershipStatus = 'active' | 'suspended'

/**
 * Cible du lien affilié :
 * - `service` → page publique de l’établissement
 * - `product` → paiement direct du produit (`?payer=1`)
 */
export type AffiliateTargetKind = 'service' | 'product'

/** Programme créé par un établissement (Espace Pro). */
export interface AffiliateProgram {
  id: string
  serviceId: string
  name: string
  description: string
  /** Présentation de la collaboration. */
  collaboration: string
  objective: string
  imageSrc?: string
  /**
   * Ce que le lien ouvre chez le client.
   * Défaut `service` pour les programmes déjà enregistrés.
   */
  targetKind: AffiliateTargetKind
  /** Article du catalogue si `targetKind === 'product'`. */
  productId?: string
  /** Taux affilié (0–1), choisi par le vendeur. */
  affiliateRate: number
  /**
   * Taux AfriConnect figé au moment de la dernière publication
   * (informatif ; non modifiable par le vendeur).
   */
  platformRate: number
  /** Base de calcul affichée aux affiliés. */
  commissionBase: string
  /** Frais exclus de la base (livraison, taxes…). */
  excludedFees: string
  audience: AffiliateAudience
  specialConditions: string
  promotionRules: string
  fraudRules: string
  startsAt: number
  endsAt?: number
  status: AffiliateProgramStatus
  /** Afficher le nombre de participants sur la carte publique. */
  showParticipantCount: boolean
  createdAt: number
  updatedAt: number
}

/** Partenariat affilié ↔ programme (adhésion immédiate). */
export interface AffiliateMembership {
  id: string
  programId: string
  serviceId: string
  /** Identifiant AfriConnect sans @. */
  affiliateHandle: string
  affiliateName: string
  affiliateAvatar?: string
  /** Code unique du lien (?aff=…). */
  refCode: string
  status: AffiliateMembershipStatus
  joinedAt: number
  clicks: number
  customers: number
  orders: number
  salesAmount: number
  commissionsAmount: number
  updatedAt: number
}

/** Agrégats stats vendeur (démo). */
export interface AffiliateVendorStats {
  activeAffiliates: number
  clicks: number
  customers: number
  orders: number
  confirmedPayments: number
  salesAmount: number
  affiliateCommissions: number
  platformCommissions: number
  vendorNet: number
  clicksSeries: readonly { label: string; value: number }[]
  ordersSeries: readonly { label: string; value: number }[]
  salesSeries: readonly { label: string; value: number }[]
  commissionsSeries: readonly { label: string; value: number }[]
}
