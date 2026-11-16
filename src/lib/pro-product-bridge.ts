/**
 * Pont Espace Pro (catalogue) ↔ Explorer / Accueil.
 * Inclut les articles des services actifs (démo + locaux).
 */
import { getStockLabel, isOrderable } from '@/lib/catalog'
import { DEMO_PROS } from '@/lib/directory'
import { getAverageRating, getPromoPrices } from '@/lib/pro-public'
import { getProExtras } from '@/lib/pro-extras-store'
import { loadServicesState } from '@/lib/services-storage'
import type { Product } from '@/types/explore'
import type { CatalogItem, Service } from '@/types/service'

export interface PublishedProProduct {
  item: CatalogItem
  service: Service
  rating: number
  verified: boolean
}

function pushProduct(
  list: PublishedProProduct[],
  seen: Set<string>,
  entry: PublishedProProduct,
) {
  if (seen.has(entry.item.id)) return
  seen.add(entry.item.id)
  list.push(entry)
}

/** Articles des Espaces Pro actifs (annuaire + locaux). */
export function listPublishedProProducts(): PublishedProProduct[] {
  const seen = new Set<string>()
  const list: PublishedProProduct[] = []

  for (const demo of DEMO_PROS) {
    for (const item of demo.items) {
      pushProduct(list, seen, {
        item,
        service: demo.service,
        rating: demo.rating,
        verified: demo.verified,
      })
    }
  }

  const { services, items } = loadServicesState()
  for (const service of services) {
    if (service.status !== 'active') continue
    const serviceItems = items.filter((i) => i.serviceId === service.id)
    const extras = getProExtras(service, serviceItems)
    const rating = getAverageRating(extras.reviews) ?? 4.2
    for (const item of serviceItems) {
      pushProduct(list, seen, {
        item,
        service,
        rating,
        verified: false,
      })
    }
  }

  return list
}

/** Convertit un article catalogue en carte Explorer. */
export function publishedProductToExplore(
  entry: PublishedProProduct,
): Product {
  const { item, service, rating, verified } = entry
  const demo = DEMO_PROS.find((p) => p.service.id === service.id)
  const { items } = loadServicesState()
  const allItems =
    demo?.items ?? items.filter((i) => i.serviceId === service.id)
  const extras = demo
    ? getProExtras(demo.service, demo.items)
    : getProExtras(service, allItems)
  const promo = getPromoPrices(extras).get(item.id)
  return {
    id: item.id,
    name: item.name,
    price: item.price,
    seller: service.name,
    sellerVerified: verified,
    ...(service.logo ? { sellerLogo: service.logo } : {}),
    rating,
    proRef: service.username || service.id,
    city: service.city,
    category: item.category,
    available: isOrderable(item),
    stockLabel: getStockLabel(item),
    ...(item.image ? { imageSrc: item.image } : {}),
    ...(promo !== undefined && promo < item.price ? { promoPrice: promo } : {}),
  }
}

/** Catalogue Explorer dynamique (démo + services locaux). */
export function getExploreProducts(): Product[] {
  const demoItemIds = new Set(
    DEMO_PROS.flatMap((demo) => demo.items.map((item) => item.id)),
  )
  return listPublishedProProducts()
    .map(publishedProductToExplore)
    .sort((a, b) => {
      // Produits des Espaces Pro locaux d’abord (visibilité après publication).
      const aLocal = demoItemIds.has(a.id) ? 0 : 1
      const bLocal = demoItemIds.has(b.id) ? 0 : 1
      return (
        bLocal - aLocal ||
        Number(b.promoPrice !== undefined) - Number(a.promoPrice !== undefined) ||
        b.rating - a.rating
      )
    })
}
