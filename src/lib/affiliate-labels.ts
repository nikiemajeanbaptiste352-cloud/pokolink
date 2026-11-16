import type {
  AffiliateAudience,
  AffiliateMembershipStatus,
  AffiliateProgramStatus,
  AffiliateTargetKind,
} from '@/types/affiliate'

/** Taux plateforme AfriConnect — fixé centralement, non modifiable par le vendeur. */
export const AFRICONNECT_AFFILIATE_PLATFORM_RATE = 0.05

/** Plafond technique du taux affilié (en plus du taux plateforme). */
export const AFFILIATE_RATE_MAX = 0.4

export const AFFILIATE_PROGRAM_STATUS_LABEL: Record<
  AffiliateProgramStatus,
  string
> = {
  draft: 'Brouillon',
  published: 'Publié',
  suspended: 'Suspendu',
  closed: 'Fermé',
}

export const AFFILIATE_AUDIENCE_LABEL: Record<AffiliateAudience, string> = {
  creators: 'Créateurs',
  users: 'Utilisateurs ordinaires',
  both: 'Créateurs et utilisateurs',
}

export const AFFILIATE_TARGET_LABEL: Record<AffiliateTargetKind, string> = {
  service: 'Page publique du service',
  product: 'Paiement direct du produit',
}

export const AFFILIATE_MEMBERSHIP_STATUS_LABEL: Record<
  AffiliateMembershipStatus,
  string
> = {
  active: 'Actif',
  suspended: 'Suspendu',
}

export function formatRatePct(rate: number): string {
  return `${(rate * 100).toFixed(rate * 100 % 1 === 0 ? 0 : 1).replace('.', ',')} %`
}

/** Montant distribuable restant pour le vendeur (hors plateforme + affilié). */
export function vendorShareRate(affiliateRate: number, platformRate: number): number {
  return Math.max(0, 1 - platformRate - affiliateRate)
}

export function simulateSplit(
  amount: number,
  affiliateRate: number,
  platformRate = AFRICONNECT_AFFILIATE_PLATFORM_RATE,
): { platform: number; affiliate: number; vendor: number } {
  const platform = Math.round(amount * platformRate)
  const affiliate = Math.round(amount * affiliateRate)
  const vendor = Math.max(0, amount - platform - affiliate)
  return { platform, affiliate, vendor }
}

export function isAffiliateRateValid(affiliateRate: number): boolean {
  if (!(affiliateRate >= 0) || affiliateRate > AFFILIATE_RATE_MAX) return false
  return (
    affiliateRate + AFRICONNECT_AFFILIATE_PLATFORM_RATE <= 1 + Number.EPSILON
  )
}
