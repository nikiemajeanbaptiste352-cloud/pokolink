/**
 * Fil immersif d'Accueil et d'Explorer : publications, événements Market Event, événements
 * Creator Market, publications d'Espaces Pro, produits et établissements dans un même fil.
 *
 * Publicité et recommandations : même source que le panneau Accueil et Explorer
 * (`recommendations.ts` + canaux ads home/explore).
 */
import { findDemoPro, findDemoProduct, DEMO_PROS } from '@/lib/directory'
import { getEventPath } from '@/lib/event-links'
import { TEMP_COIN_EVENTS } from '@/lib/placeholder-coin-markets'
import { TEMP_POSTS } from '@/lib/placeholder-data'
import {
  TEMP_RESTAURANTS,
  TEMP_SERVICES,
  TEMP_SHOPS,
} from '@/lib/placeholder-explore'
import { TEMP_MARKETS } from '@/lib/placeholder-markets'
import { getPublicPosts } from '@/lib/pro-public'
import {
  getPopularEvents,
  getPopularProducts,
  getSponsoredRecommendations,
} from '@/lib/recommendations'
import { paths } from '@/routes/paths'
import type { FeedItem } from '@/types/feed'

export type FeedFilter = 'all' | 'events' | 'creator' | 'pro' | 'products'

export const FEED_FILTERS: readonly { id: FeedFilter; label: string }[] = [
  { id: 'all', label: 'Pour vous' },
  { id: 'events', label: 'Market Event' },
  { id: 'creator', label: 'Creator Market' },
  { id: 'pro', label: 'Services Pro' },
  { id: 'products', label: 'Produits' },
]

export function matchesFeedFilter(item: FeedItem, filter: FeedFilter): boolean {
  switch (filter) {
    case 'all':
      return true
    case 'events':
      return item.kind === 'event'
    case 'creator':
      return item.kind === 'cote' || item.kind === 'coins'
    case 'pro':
      return item.kind === 'pro_post' || item.kind === 'pro' || item.kind === 'ad'
    case 'products':
      return item.kind === 'product'
  }
}

/** Nombre maximal d'Espaces Pro qui publient dans le fil (une publication chacun). */
const MAX_PRO_POSTS = 8

/** Alterne les sources une à une pour que le fil mélange les types de contenu. */
function interleave(sources: readonly (readonly FeedItem[])[]): FeedItem[] {
  const result: FeedItem[] = []
  const longest = Math.max(0, ...sources.map((source) => source.length))
  for (let i = 0; i < longest; i += 1) {
    for (const source of sources) {
      const item = source[i]
      if (item) result.push(item)
    }
  }
  return result
}

/**
 * `home` : publications de la communauté en premier. `explore` : découverte (événements,
 * produits, établissements suggérés), sans publications de la communauté.
 */
export function buildFeed(scope: 'home' | 'explore', now: number): FeedItem[] {
  const posts: FeedItem[] = TEMP_POSTS.map((post) => ({
    kind: 'post',
    id: `post:${post.id}`,
    post,
  }))

  const events: FeedItem[] = getPopularEvents(now, 12).map((event) => ({
    kind: 'event',
    id: `event:${event.id}`,
    event,
  }))

  const cotes: FeedItem[] = TEMP_MARKETS.filter(
    (market) => market.status !== 'closed',
  ).map((market, index) => ({ kind: 'cote', id: `cote:${market.id}`, market, index }))

  const coins: FeedItem[] = TEMP_COIN_EVENTS.filter(
    (event) => event.state !== 'closed',
  ).map((event, index) => ({ kind: 'coins', id: `coins:${event.id}`, event, index }))

  const proPosts: FeedItem[] = []
  for (const pro of DEMO_PROS) {
    if (proPosts.length >= MAX_PRO_POSTS) break
    const post = getPublicPosts(pro.extras)[0]
    if (post)
      proPosts.push({
        kind: 'pro_post',
        id: `pro_post:${pro.service.id}:${post.id}`,
        pro,
        post,
      })
  }

  const products: FeedItem[] = getPopularProducts(12).map((product) => ({
    kind: 'product',
    id: `product:${product.id}`,
    product,
    pro: findDemoProduct(product.id)?.pro,
  }))

  const suggestions: FeedItem[] = []
  const suggest = (proRef: string, label: string) => {
    const pro = findDemoPro(proRef)
    if (pro) suggestions.push({ kind: 'pro', id: `pro:${proRef}`, pro, label })
  }
  TEMP_SHOPS.forEach((shop) => suggest(shop.proRef, 'Boutique'))
  TEMP_SERVICES.forEach((service) => suggest(service.proRef, 'Service'))
  TEMP_RESTAURANTS.forEach((restaurant) => suggest(restaurant.proRef, 'Restaurant'))

  const ads = getSponsoredRecommendations(scope, 8)

  return scope === 'home'
    ? interleave([ads, posts, events, proPosts, cotes, products, coins, suggestions])
    : interleave([ads, events, products, proPosts, cotes, suggestions, coins])
}

/**
 * Espace de diffusion d'un élément : là où le toucher mène. `undefined` pour une
 * publication de la communauté, qui n'a pas d'espace propre (pas de profil d'utilisateur
 * pour l'instant).
 */
export function getFeedPath(item: FeedItem): string | undefined {
  switch (item.kind) {
    case 'post':
      return undefined
    case 'event':
      return getEventPath(item.event.id) ?? paths.events
    case 'cote':
      return paths.marketFeed(item.market.id)
    case 'coins':
      return paths.coinFeed(item.event.id)
    case 'pro_post':
      return paths.establishmentPosts(item.pro.service.username)
    case 'product':
      return paths.product(item.product.id)
    case 'pro':
      return paths.establishment(item.pro.service.username)
    case 'ad': {
      const handle = item.pro.service.username || item.pro.service.id
      if (item.campaign.target === 'item' && item.campaign.itemId) {
        return paths.product(item.campaign.itemId)
      }
      return paths.establishment(handle)
    }
  }
}
