/**
 * Offres partenaires (forfaits abonnement, forfaits pub, affiliation)
 * à afficher sous vidéos / posts / événements dans Explorer et le fil.
 */
import { getAffiliatePrograms } from '@/lib/affiliate-store'
import { getAffiliateVendorPublic } from '@/lib/affiliate-public'
import { findCreator } from '@/lib/creators'
import { DEMO_PROS, findDemoPro } from '@/lib/directory'
import { formatPrice } from '@/lib/format'
import {
  getExploreMembershipOffers,
  subscriptionOffersForServiceId,
} from '@/lib/pro-plan-bridge'
import { getPublishedStudioAdPlans } from '@/lib/studio-ads-store'
import { paths } from '@/routes/paths'
import type { FeedItem } from '@/types/feed'
import type { PartnerOffer } from '@/types/partner-offer'
import type { MarketEvent } from '@/types/event'

function subscriptionOffersForService(
  serviceId: string,
  limit = 2,
): PartnerOffer[] {
  return subscriptionOffersForServiceId(serviceId, limit)
}

function affiliateOffersForService(
  serviceId: string,
  limit = 1,
): PartnerOffer[] {
  const vendor = getAffiliateVendorPublic(serviceId)
  const pro = findDemoPro(serviceId)
  const username =
    vendor?.username ?? pro?.service.username ?? serviceId
  const profileTo = paths.establishment(username)
  const name = vendor?.name ?? pro?.service.name ?? 'Vendeur'
  const logo = vendor?.logo ?? pro?.service.logo

  const published = getAffiliatePrograms().filter(
    (p) => p.serviceId === serviceId && p.status === 'published',
  )
  if (published.length > 0) {
    return published.slice(0, limit).map((program) => ({
      id: `aff-${program.id}`,
      kind: 'affiliate' as const,
      title: program.name,
      subtitle: `${name} · Affiliation`,
      priceLabel: `${Math.round(program.affiliateRate * 100)} %`,
      badge: 'Affiliation',
      ...(logo ? { avatarSrc: logo } : {}),
      partnerName: name,
      profileTo,
      detailTo: `${profileTo}?onglet=affiliation`,
      ...(program.imageSrc ? { imageSrc: program.imageSrc } : {}),
    }))
  }

  // Démo : proposer l’onglet affiliation même sans programme seedé.
  if (!pro) return []
  return [
    {
      id: `aff-demo-${serviceId}`,
      kind: 'affiliate' as const,
      title: 'Programme d’affiliation',
      subtitle: `${name} · Rejoindre`,
      priceLabel: '10 %',
      badge: 'Affiliation',
      ...(logo ? { avatarSrc: logo } : {}),
      partnerName: name,
      profileTo,
      detailTo: `${profileTo}?onglet=affiliation`,
    },
  ].slice(0, limit)
}

function adPlanOffersForCreator(handle: string, limit = 2): PartnerOffer[] {
  const creator = findCreator(handle)
  if (!creator) return []
  const profileTo = paths.creator(creator.handle)
  const plans = getPublishedStudioAdPlans().slice(0, limit)
  return plans.map((plan) => ({
    id: `ad-${creator.handle}-${plan.id}`,
    kind: 'ad_plan' as const,
    title: plan.name,
    subtitle: `@${creator.handle} · Publicité`,
    priceLabel: formatPrice(plan.price ?? 0),
    badge: 'Forfait pub',
    ...(creator.avatar ? { avatarSrc: creator.avatar } : {}),
    partnerName: creator.name,
    profileTo,
    detailTo: paths.creatorAdPlan(creator.handle, plan.id),
    ...(plan.imageSrc ? { imageSrc: plan.imageSrc } : {}),
  }))
}

/** Offres liées à l’hôte d’un événement Market Event. */
export function partnerOffersForEvent(
  event: MarketEvent,
  limit = 3,
): PartnerOffer[] {
  const out: PartnerOffer[] = []
  const ref = event.host.proRef
  if (ref) {
    const pro = findDemoPro(ref)
    const serviceId = pro?.service.id ?? ref
    out.push(...subscriptionOffersForService(serviceId, 1))
    out.push(...affiliateOffersForService(serviceId, 1))
  }
  // Si l’hôte est aussi un @créateur connu, proposer un forfait pub.
  const maybeHandle = event.host.name.toLowerCase().replace(/\s+/g, '.')
  const creatorOffers = adPlanOffersForCreator(maybeHandle, 1)
  if (creatorOffers.length > 0) out.push(...creatorOffers)
  return out.slice(0, limit)
}

/** Offres liées à un item du fil immersif. */
export function partnerOffersForFeedItem(
  item: FeedItem,
  limit = 3,
): PartnerOffer[] {
  switch (item.kind) {
    case 'event':
      return partnerOffersForEvent(item.event, limit)
    case 'ad':
    case 'pro':
    case 'pro_post': {
      const serviceId = item.pro.service.id
      return [
        ...subscriptionOffersForService(serviceId, 1),
        ...affiliateOffersForService(serviceId, 1),
      ].slice(0, limit)
    }
    case 'cote':
      return adPlanOffersForCreator(item.market.creatorHandle, limit)
    case 'coins':
      return adPlanOffersForCreator(item.event.creatorHandle, limit)
    case 'post': {
      const to = item.post.author.to ?? ''
      const match = to.match(/\/createur\/([^/?#]+)/)
      if (match?.[1]) return adPlanOffersForCreator(match[1], limit)
      return []
    }
    case 'product': {
      const ref = item.product.proRef
      if (!ref) return []
      const pro = findDemoPro(ref)
      const serviceId = pro?.service.id ?? ref
      return [
        ...subscriptionOffersForService(serviceId, 1),
        ...affiliateOffersForService(serviceId, 1),
      ].slice(0, limit)
    }
    default:
      return []
  }
}

/** Rail Explorer : mélange d’offres (adhésions live + pub + affiliation). */
export function getExplorePartnerOffers(limit = 8): PartnerOffer[] {
  const out: PartnerOffer[] = []
  out.push(...getExploreMembershipOffers(Math.min(4, limit)))

  for (const pro of DEMO_PROS.slice(0, 4)) {
    out.push(...affiliateOffersForService(pro.service.id, 1))
    if (out.length >= limit) break
  }
  for (const handle of ['awa.cuisine', 'amadou.ba', 'moussa.tech'] as const) {
    out.push(...adPlanOffersForCreator(handle, 1))
    if (out.length >= limit) break
  }
  const seen = new Set<string>()
  return out
    .filter((o) => {
      if (seen.has(o.id)) return false
      seen.add(o.id)
      return true
    })
    .slice(0, limit)
}

export { getExploreMembershipOffers }
