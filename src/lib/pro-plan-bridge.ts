/**
 * Pont Espace Pro (privé) ↔ forfaits d’adhésion publics.
 *
 * Règle produit :
 * - L’Espace Pro **crée / publie** les forfaits (`status: 'active'`).
 * - Accueil, Explorer et la page publique **affichent** les forfaits publiés.
 */
import { DEMO_PROS } from '@/lib/directory'
import { formatPrice } from '@/lib/format'
import { getPublicPlans } from '@/lib/pro-public'
import { getProExtras } from '@/lib/pro-extras-store'
import { loadServicesState } from '@/lib/services-storage'
import { paths } from '@/routes/paths'
import type { PartnerOffer } from '@/types/partner-offer'
import type { Plan } from '@/types/pro'
import type { CatalogItem, Service } from '@/types/service'

export interface PublishedProPlan {
  plan: Plan
  service: Service
}

function pushPlan(
  list: PublishedProPlan[],
  seen: Set<string>,
  plan: Plan,
  service: Service,
) {
  if (seen.has(plan.id)) return
  seen.add(plan.id)
  list.push({ plan, service })
}

/** Tous les forfaits publiés (annuaire démo + Espaces Pro locaux). */
export function listPublishedProPlans(): PublishedProPlan[] {
  const seen = new Set<string>()
  const list: PublishedProPlan[] = []

  for (const demo of DEMO_PROS) {
    // demo.extras (curaté) ; getProExtras si l’utilisateur a modifié un clone local.
    const extras = getProExtras(demo.service, demo.items)
    for (const plan of getPublicPlans(extras)) {
      pushPlan(list, seen, plan, demo.service)
    }
  }

  const { services, items } = loadServicesState()
  for (const service of services) {
    if (service.status !== 'active') continue
    const serviceItems = items.filter((item) => item.serviceId === service.id)
    const extras = getProExtras(service, serviceItems)
    for (const plan of getPublicPlans(extras)) {
      pushPlan(list, seen, plan, service)
    }
  }

  return list
}

/** Convertit un forfait publié en carte d’offre (Accueil / Explorer). */
export function publishedPlanToPartnerOffer({
  plan,
  service,
}: PublishedProPlan): PartnerOffer {
  const username = service.username || service.id
  return {
    id: `sub-${plan.id}`,
    kind: 'subscription',
    title: plan.name,
    subtitle: `${service.name} · Adhésion`,
    priceLabel: plan.price > 0 ? formatPrice(plan.price) : 'Sur devis',
    badge: 'Adhésion',
    ...(service.logo ? { avatarSrc: service.logo } : {}),
    partnerName: service.name,
    profileTo: paths.establishment(username),
    detailTo: paths.subscribe(username, plan.id),
    ...(plan.image ? { imageSrc: plan.image } : {}),
  }
}

/** Offres d’adhésion pour un service (démo ou local), via extras live. */
export function subscriptionOffersForServiceId(
  serviceId: string,
  limit = 2,
): PartnerOffer[] {
  const published = listPublishedProPlans().filter(
    (entry) =>
      entry.service.id === serviceId ||
      entry.service.username === serviceId,
  )
  return published.slice(0, limit).map(publishedPlanToPartnerOffer)
}

/** Résout extras live pour un service (démo ou stockage local). */
export function resolveServiceExtras(
  serviceId: string,
): { service: Service; items: readonly CatalogItem[]; extras: ReturnType<typeof getProExtras> } | null {
  const demo = DEMO_PROS.find(
    (p) => p.service.id === serviceId || p.service.username === serviceId,
  )
  if (demo) {
    return {
      service: demo.service,
      items: demo.items,
      extras: getProExtras(demo.service, demo.items),
    }
  }
  const { services, items } = loadServicesState()
  const service = services.find(
    (s) => s.id === serviceId || s.username === serviceId,
  )
  if (!service) return null
  const serviceItems = items.filter((item) => item.serviceId === service.id)
  return {
    service,
    items: serviceItems,
    extras: getProExtras(service, serviceItems),
  }
}

/** Rail Accueil / Explorer : forfaits d’adhésion publiés. */
export function getExploreMembershipOffers(limit = 8): PartnerOffer[] {
  return listPublishedProPlans()
    .slice(0, limit)
    .map(publishedPlanToPartnerOffer)
}
