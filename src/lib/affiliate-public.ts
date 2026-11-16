import { findDemoPro } from '@/lib/directory'
import { loadServicesState } from '@/lib/services-storage'
import type { AffiliateProgram } from '@/types/affiliate'

export interface AffiliateVendorPublic {
  serviceId: string
  name: string
  username: string
  logo?: string
  verified: boolean
}

/** Infos vendeur pour les cartes publiques d’affiliation. */
export function getAffiliateVendorPublic(
  serviceId: string,
): AffiliateVendorPublic | undefined {
  const mine = loadServicesState().services.find((s) => s.id === serviceId)
  if (mine) {
    return {
      serviceId: mine.id,
      name: mine.name,
      username: mine.username || mine.id,
      ...(mine.logo ? { logo: mine.logo } : {}),
      verified: false,
    }
  }
  const demo = findDemoPro(serviceId)
  if (demo) {
    return {
      serviceId: demo.service.id,
      name: demo.service.name,
      username: demo.service.username || demo.service.id,
      ...(demo.service.logo ? { logo: demo.service.logo } : {}),
      verified: Boolean(demo.verified),
    }
  }
  return undefined
}

export function programAllowsAudience(
  program: AffiliateProgram,
  isCreator: boolean,
): boolean {
  if (program.audience === 'both') return true
  if (program.audience === 'creators') return isCreator
  return !isCreator
}
