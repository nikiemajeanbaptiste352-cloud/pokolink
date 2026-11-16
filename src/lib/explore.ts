/**
 * Explorer : produits, Services Pro et événements, construits à partir de l'annuaire
 * d'exemple (`directory.ts`) et de Market Event (`placeholder-events.ts`). Aucune donnée
 * n'est dupliquée : un produit ouvre sa fiche (la pastille de son vendeur ouvre le profil
 * public du Service Pro), un Service Pro ouvre son profil public, un événement ouvre sa
 * page publique.
 *
 * Données d'exemple : l'ordre est fixe, sans recommandation ni distance réelle.
 */
import { DEMO_PROS, findDemoPro, type DemoPro } from '@/lib/directory'
import { getEventPath } from '@/lib/event-links'
import { getDiscountPercent, getEventState } from '@/lib/events'
import { formatPrice } from '@/lib/format'
import { lotteryChanceRuleLabel } from '@/lib/lottery-rules'
import { normalize } from '@/lib/catalog'
import { TEMP_EVENTS } from '@/lib/placeholder-events'
import { TEMP_RESTAURANTS } from '@/lib/placeholder-explore'
import { listPublishedProMarketEvents } from '@/lib/pro-event-bridge'
import { getExploreProducts } from '@/lib/pro-product-bridge'
import { paths } from '@/routes/paths'
import type {
  Category,
  CategorySpotlight,
  CategoryTarget,
  Product,
  Restaurant,
} from '@/types/explore'
import type { MarketEvent } from '@/types/event'

export type ExploreSection = 'all' | 'products' | 'pro' | 'events'

export const EXPLORE_FILTERS: readonly { id: ExploreSection; label: string }[] = [
  { id: 'all', label: 'Tout' },
  { id: 'products', label: 'Produits' },
  { id: 'pro', label: 'Services Pro' },
  { id: 'events', label: 'Événements' },
]

/**
 * Snapshot démo (module load). Pour le catalogue live (services locaux inclus),
 * utiliser `getLiveExploreProducts()`.
 */
export const EXPLORE_PRODUCTS: readonly Product[] = getExploreProducts()

/** Produits Explorer live : démo + catalogues Espaces Pro locaux. */
export function getLiveExploreProducts(): Product[] {
  return getExploreProducts()
}

/** Services Pro : les vérifiés d'abord, puis les plus suivis. */
export const EXPLORE_PROS: readonly DemoPro[] = [...DEMO_PROS].sort(
  (a, b) => Number(b.verified) - Number(a.verified) || b.followers - a.followers,
)

/** Restaurants Explorer : TEMP + couverture / logo de l’annuaire quand disponibles. */
export const EXPLORE_RESTAURANTS: readonly Restaurant[] = TEMP_RESTAURANTS.map(
  (restaurant) => {
    const pro = findDemoPro(restaurant.proRef)
    const imageSrc =
      restaurant.imageSrc || pro?.service.cover || pro?.service.logo || undefined
    return imageSrc ? { ...restaurant, imageSrc } : restaurant
  },
).sort((a, b) => Number(b.open) - Number(a.open) || a.distanceKm - b.distanceKm)

/** Remise affichée sur une carte produit, en pourcentage (0 sans promotion). */
export function getProductDiscount(product: Product): number {
  return product.promoPrice === undefined
    ? 0
    : getDiscountPercent(product.price, product.promoPrice)
}

/** Où mène un produit : sa fiche (défilement vertical). Le vendeur a sa propre pastille. */
export function getProductPath(product: Product): string {
  return paths.product(product.id)
}

/** Où mène la pastille du vendeur : son profil public (Service Pro). */
export function getSellerPath(product: Product): string | undefined {
  return product.proRef ? paths.establishment(product.proRef) : undefined
}

export interface ExploreFilters {
  query: string
  /** `null` = toutes les villes. */
  city: string | null
  /** `null` = toutes les catégories. */
  target: CategoryTarget | null
}

/** Villes présentes dans l'annuaire, pour le sélecteur de localisation. */
export const EXPLORE_CITIES: readonly string[] = [
  ...new Set(DEMO_PROS.map((pro) => pro.service.city)),
].sort((a, b) => a.localeCompare(b, 'fr'))

function matchesText(query: string, ...fields: readonly (string | undefined)[]): boolean {
  const q = normalize(query)
  return q === '' || normalize(fields.filter(Boolean).join(' ')).includes(q)
}

export function selectProducts(
  products: readonly Product[],
  { query, city, target }: ExploreFilters,
): Product[] {
  if (target && target.section !== 'products') return []
  return products.filter(
    (product) =>
      (city === null || product.city === city) &&
      matchesText(query, product.name, product.seller, product.category, product.city),
  )
}

export function selectPros(
  pros: readonly DemoPro[],
  { query, city, target }: ExploreFilters,
): DemoPro[] {
  if (target && target.section !== 'pro') return []
  const types = target?.types
  return pros.filter(
    (pro) =>
      (city === null || pro.service.city === city) &&
      (!types || types.includes(pro.service.type)) &&
      matchesText(
        query,
        pro.service.name,
        pro.tagline,
        pro.service.description,
        pro.service.city,
      ),
  )
}

/** Filtre restaurants (catégorie Restaurants ou recherche libre). */
export function selectRestaurants(
  restaurants: readonly Restaurant[],
  { query }: Pick<ExploreFilters, 'query'>,
): Restaurant[] {
  return restaurants.filter((restaurant) =>
    matchesText(query, restaurant.name, restaurant.proRef),
  )
}

/** Catégorie ciblée uniquement sur les restaurants. */
export function isRestaurantTarget(target: CategoryTarget | null): boolean {
  return (
    target?.section === 'pro' &&
    target.types?.length === 1 &&
    target.types[0] === 'restaurant'
  )
}

/** Ville d'un événement : celle de son organisateur s'il a un profil, sinon en ligne. */
function getEventCity(event: MarketEvent): string | undefined {
  return event.host.proRef ? findDemoPro(event.host.proRef)?.service.city : undefined
}

/** Événements en cours ou à venir (les événements en ligne conviennent à toutes les villes). */
export function selectEvents(
  events: readonly MarketEvent[],
  { query, city, target }: ExploreFilters,
  now: number,
): MarketEvent[] {
  if (target) return []
  return events
    .filter((event) => getEventState(event, now) !== 'ended')
    .filter((event) => {
      const eventCity = getEventCity(event)
      return city === null || eventCity === undefined || eventCity === city
    })
    .filter((event) =>
      matchesText(query, event.title, event.host.name, event.description),
    )
    .sort(
      (a, b) =>
        Number(getEventState(b, now) === 'live') -
          Number(getEventState(a, now) === 'live') || a.startsAt - b.startsAt,
    )
}

/**
 * Snapshot démo. Pour Accueil / Explorer live (events Pro inclus),
 * utiliser `getLiveExploreEvents()`.
 */
export const EXPLORE_EVENTS: readonly MarketEvent[] = TEMP_EVENTS

/** Événements Explorer live : TEMP + publiés Espaces Pro. */
export function getLiveExploreEvents(): MarketEvent[] {
  const seen = new Set(TEMP_EVENTS.map((event) => event.id))
  const fromPro = listPublishedProMarketEvents().filter(
    (event) => !seen.has(event.id),
  )
  return [...TEMP_EVENTS, ...fromPro]
}

/** Destination d'une carte événement : sa page publique, sinon le fil Market Event. */
export function getExploreEventPath(event: MarketEvent): string {
  return getEventPath(event.id) ?? paths.events
}

/** Prix ou conditions de participation, affichés sur la carte. */
export function getEventConditions(event: MarketEvent): string {
  if (event.lottery) {
    const chances = lotteryChanceRuleLabel(event.lottery.prizeValue)
    return event.lottery.entryFee > 0
      ? `Participation : ${formatPrice(event.lottery.entryFee)} · ${chances}`
      : `Participation gratuite · ${chances}`
  }
  if (event.collective) return `Contribution : ${formatPrice(event.collective.entryFee)}`
  if (event.offer) return `Offre : ${formatPrice(event.offer.eventPrice)}`
  return event.reward ? `Récompense : ${event.reward}` : 'Participation libre'
}

/** Nombre de résultats d'une catégorie (calculé, jamais inventé). */
export function countForTarget(target: CategoryTarget | undefined): number {
  if (!target) return EXPLORE_PRODUCTS.length + EXPLORE_PROS.length
  const filters: ExploreFilters = { query: '', city: null, target }
  return target.section === 'products'
    ? selectProducts(EXPLORE_PRODUCTS, filters).length
    : selectPros(EXPLORE_PROS, filters).length
}

/** Distance démo stable (km) à partir d’un identifiant — frontend only. */
function demoDistanceKm(seed: string): number {
  let hash = 0
  for (let i = 0; i < seed.length; i += 1) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0
  }
  return Math.round((0.5 + (hash % 40) / 10) * 10) / 10
}

function formatDistanceKm(km: number): string {
  return `${km.toFixed(1).replace('.', ',')} km`
}

/**
 * Panneau de secours par catégorie quand l’annuaire n’a pas encore d’entrée
 * (Santé, Hôtels, Pharmacies…). Contenu adapté à chaque rubrique.
 */
const CATEGORY_SPOTLIGHT_FALLBACKS: Readonly<Record<string, CategorySpotlight>> = {
  produits: {
    title: 'Sélection marketplace',
    detail: 'Promos et nouveautés',
    badge: 'Top',
    imageSrc:
      'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=400&h=240&fit=crop',
  },
  boutiques: {
    title: 'Boutique du quartier',
    detail: '1,1 km · près de vous',
    badge: '1,1 km',
    imageSrc:
      'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=240&fit=crop',
  },
  restaurants: {
    title: 'Table du jour',
    detail: '1,2 km · 25-35 min',
    badge: 'Ouvert',
    imageSrc:
      'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&h=240&fit=crop',
  },
  transport: {
    title: 'Transport express',
    detail: '0,9 km · départ imminent',
    badge: '0,9 km',
    imageSrc:
      'https://images.unsplash.com/photo-1544620341-11f8f60443b0?w=400&h=240&fit=crop',
  },
  carburant: {
    title: 'Station Total',
    detail: '1,4 km · ouverte 24h/24',
    badge: '1,4 km',
    imageSrc:
      'https://images.unsplash.com/photo-1616432043562-3671ea2e2348?w=400&h=240&fit=crop',
  },
  sante: {
    title: 'Clinique du Plateau',
    detail: '0,7 km · urgences 24h',
    badge: '0,7 km',
    imageSrc:
      'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=400&h=240&fit=crop',
  },
  hotels: {
    title: 'Hôtel Savannah',
    detail: '1,6 km · chambres dispo',
    badge: '1,6 km',
    imageSrc:
      'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&h=240&fit=crop',
  },
  pharmacies: {
    title: 'Pharmacie du Centre',
    detail: '0,5 km · de garde',
    badge: 'Ouvert',
    imageSrc:
      'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=400&h=240&fit=crop',
  },
}

function fallbackSpotlight(category: Category): CategorySpotlight {
  return (
    CATEGORY_SPOTLIGHT_FALLBACKS[category.id] ?? {
      title: category.label,
      detail: 'À découvrir près de vous',
      badge: 'Top',
    }
  )
}

/**
 * Panneau « top / plus proche » pour chaque carte-catégorie du bandeau Explorer.
 * Toujours adapté à la rubrique (produits, restos, transport, santé…).
 */
export function getCategorySpotlight(category: Category): CategorySpotlight {
  const { target } = category
  if (!target) return fallbackSpotlight(category)

  if (target.section === 'products') {
    const product =
      EXPLORE_PRODUCTS.find(
        (item) => item.available !== false && item.promoPrice !== undefined,
      ) ?? EXPLORE_PRODUCTS.find((item) => item.available !== false)
    if (!product) return fallbackSpotlight(category)
    return {
      title: product.name,
      detail: product.seller,
      badge: product.promoPrice !== undefined ? 'Promo' : 'Top',
      ...(product.imageSrc ? { imageSrc: product.imageSrc } : {}),
    }
  }

  if (isRestaurantTarget(target)) {
    const restaurant = [...EXPLORE_RESTAURANTS].sort(
      (a, b) =>
        Number(b.open) - Number(a.open) || a.distanceKm - b.distanceKm,
    )[0]
    if (!restaurant) return fallbackSpotlight(category)
    return {
      title: restaurant.name,
      detail: `${formatDistanceKm(restaurant.distanceKm)} · ${restaurant.eta}`,
      badge: restaurant.open ? 'Ouvert' : 'Fermé',
      ...(restaurant.imageSrc ? { imageSrc: restaurant.imageSrc } : {}),
    }
  }

  const pros = selectPros(EXPLORE_PROS, { query: '', city: null, target })
    .map((pro) => ({ pro, km: demoDistanceKm(pro.service.id) }))
    .sort((a, b) => a.km - b.km)
  const closest = pros[0]
  if (!closest) return fallbackSpotlight(category)

  const { pro, km } = closest
  const cover = pro.service.cover || pro.service.logo || undefined
  return {
    title: pro.service.name,
    detail: `${formatDistanceKm(km)} · près de vous`,
    badge: formatDistanceKm(km),
    ...(cover ? { imageSrc: cover } : {}),
  }
}
