/** Commerce éducatif AfriLearn (Canal Pro + produits) — distinct du Wallet. */

export type LearnCanalPlanId = 'starter' | 'pro' | 'campus'

export type LearnCanalSubscriptionStatus = 'active' | 'expired' | 'cancelled'

export interface LearnCanalPlan {
  id: LearnCanalPlanId
  name: string
  description: string
  /** Prix FCFA. */
  price: number
  /** Durée en jours. */
  durationDays: number
  benefits: readonly string[]
}

export interface LearnCanalSubscription {
  id: string
  ownerHandle: string
  planId: LearnCanalPlanId
  planName: string
  amountPaid: number
  startedAt: number
  expiresAt: number
  status: LearnCanalSubscriptionStatus
  paymentRefs: string[]
  renewedAt?: number
}

export interface LearnCanalPro {
  id: string
  ownerHandle: string
  subscriptionId: string
  name: string
  tagline: string
  description: string
  logo: string
  cover: string
  published: boolean
  /** Propose des forfaits d’abonnement aux visiteurs. */
  memberPlansEnabled: boolean
  /** Prix personnalisés (FCFA) par forfait membre, sinon tarifs par défaut. */
  memberPlanPrices?: Partial<Record<LearnCanalMemberPlanId, number>>
  createdAt: number
  updatedAt: number
}

/** Forfait payé par un abonné pour accéder au contenu d’un Canal Pro. */
export type LearnCanalMemberPlanId = 'mensuel' | 'trimestriel' | 'annuel'

export interface LearnCanalMemberPlan {
  id: LearnCanalMemberPlanId
  name: string
  description: string
  /** Prix par défaut FCFA (surchargeable par canal). */
  defaultPrice: number
  durationDays: number
  benefits: readonly string[]
}

export interface LearnCanalMemberSubscription {
  id: string
  canalId: string
  canalName: string
  ownerHandle: string
  memberHandle: string
  planId: LearnCanalMemberPlanId
  planName: string
  amountPaid: number
  startedAt: number
  expiresAt: number
  status: LearnCanalSubscriptionStatus
  paymentRef: string
}

export type LearnEduProductKind =
  | 'ebook'
  | 'physical_book'
  | 'revision'
  | 'exercises'
  | 'course'
  | 'document'
  | 'other'

export type LearnEduDelivery = 'download' | 'pickup' | 'delivery' | 'online'

export type LearnEduPublishStatus = 'draft' | 'published' | 'archived'

export interface LearnEduProduct {
  id: string
  sellerHandle: string
  sellerName: string
  name: string
  description: string
  category: LearnEduProductKind
  image: string
  price: number
  kind: LearnEduProductKind
  delivery: LearnEduDelivery
  /** Aperçu public (texte). */
  preview?: string
  /** Contenu / URL fichier numérique (après paiement). */
  digitalContent?: string
  stock?: number
  status: LearnEduPublishStatus
  createdAt: number
  updatedAt: number
}

export interface LearnEduSale {
  id: string
  productId: string
  productName: string
  sellerHandle: string
  buyerHandle: string
  buyerName: string
  price: number
  /** Commission plateforme (FCFA). */
  platformFee: number
  /** Net crédité vendeur. */
  sellerNet: number
  ticketId?: string
  walletPaymentId?: string
  createdAt: number
}

export interface LearnEduPurchaseAccess {
  id: string
  productId: string
  buyerHandle: string
  saleId: string
  ticketId?: string
  grantedAt: number
}
