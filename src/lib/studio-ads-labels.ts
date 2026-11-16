import type {
  StudioAdOrderStatus,
  StudioAdPlanStatus,
  StudioAdPlatform,
  StudioAdRequestKind,
} from '@/types/studio-ads'

export const STUDIO_AD_PLATFORM_LABEL: Record<StudioAdPlatform, string> = {
  tiktok: 'TikTok',
  instagram: 'Instagram',
  youtube: 'YouTube',
  facebook: 'Facebook',
  whatsapp: 'WhatsApp',
  other: 'Autre',
}

export const STUDIO_AD_PLATFORMS = Object.keys(
  STUDIO_AD_PLATFORM_LABEL,
) as StudioAdPlatform[]

export const STUDIO_AD_PLAN_STATUS_LABEL: Record<StudioAdPlanStatus, string> = {
  draft: 'Brouillon',
  published: 'Publié',
  disabled: 'Désactivé',
}

export const STUDIO_AD_ORDER_STATUS_LABEL: Record<StudioAdOrderStatus, string> = {
  pending: 'En attente',
  accepted: 'Acceptée',
  refused: 'Refusée',
  needs_info: 'Précisions demandées',
  in_progress: 'En cours',
  completed: 'Terminée',
  cancelled: 'Annulée',
}

export const STUDIO_AD_REQUEST_KIND_LABEL: Record<StudioAdRequestKind, string> = {
  order: 'Commande',
  quote: 'Demande de devis',
}

/**
 * Commission plateforme (10 %) : déduite du créateur.
 * L’acheteur paie le prix du forfait ; le créateur est crédité prix − commission.
 */
export const STUDIO_AD_PLATFORM_FEE_RATE = 0.1

/** Commission plateforme prélevée sur le créateur. */
export function studioAdPlatformFee(price: number): number {
  return Math.max(0, Math.round(price * STUDIO_AD_PLATFORM_FEE_RATE))
}

/** Montant net crédité au créateur après commission. */
export function studioAdCreatorNet(price: number): number {
  return Math.max(0, price - studioAdPlatformFee(price))
}

export type StudioAdPeriod = '7d' | '30d' | '90d' | 'year' | 'custom'

export const STUDIO_AD_PERIODS: readonly { id: StudioAdPeriod; label: string }[] = [
  { id: '7d', label: '7 jours' },
  { id: '30d', label: '30 jours' },
  { id: '90d', label: '90 jours' },
  { id: 'year', label: 'Année' },
  { id: 'custom', label: 'Personnalisé' },
]
