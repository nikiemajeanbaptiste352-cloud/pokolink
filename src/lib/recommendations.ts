/**
 * Recommandations démo partagées entre Accueil (panneau + fil) et Explorer.
 * Même source : publicité active par canal + produits / événements « populaires ».
 * Le serveur décidera l’ordre en production.
 */
import { buildSponsoredFeedItems } from '@/lib/ad-distribution'
import { findDemoPro, type DemoPro } from '@/lib/directory'
import {
  EXPLORE_PRODUCTS,
  EXPLORE_PROS,
  getLiveExploreEvents,
  getLiveExploreProducts,
  selectEvents,
} from '@/lib/explore'
import { EVENT_KIND_FALLBACK_IMAGE, getEventState } from '@/lib/events'
import type { AdCampaign, AdChannel } from '@/types/ads'
import type { Product } from '@/types/explore'
import type { MarketEvent } from '@/types/event'
import type { FeedItem } from '@/types/feed'

/** Visuels maquette par catégorie produit (catalogue sans image). */
const PRODUCT_CATEGORY_IMAGE: Record<string, string> = {
  Électroménager:
    'https://images.unsplash.com/photo-1593359677879-a4b92e8c6923?w=900&h=560&fit=crop',
  Téléphones:
    'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=900&h=560&fit=crop',
  Entretien:
    'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=900&h=560&fit=crop',
  'Objets connectés':
    'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=900&h=560&fit=crop',
  Audio:
    'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=900&h=560&fit=crop',
  Chaussures:
    'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=900&h=560&fit=crop',
  Maison:
    'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=900&h=560&fit=crop',
  Informatique:
    'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=900&h=560&fit=crop',
  Accessoires:
    'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=900&h=560&fit=crop',
}

const PRODUCT_FALLBACK_IMAGES = [
  'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=900&h=560&fit=crop',
  'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=900&h=560&fit=crop',
  'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=900&h=560&fit=crop',
  'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=900&h=560&fit=crop',
] as const

const ESTABLISHMENT_FALLBACK =
  'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=900&h=560&fit=crop'

function pickById(id: string, pool: readonly string[]): string {
  let hash = 0
  for (let i = 0; i < id.length; i += 1) hash = (hash * 31 + id.charCodeAt(i)) >>> 0
  return pool[hash % pool.length]!
}

/** Image affichable pour un produit (vraie photo ou secours maquette). */
export function resolveProductImage(product: Product): string {
  if (product.imageSrc) return product.imageSrc
  if (product.category && PRODUCT_CATEGORY_IMAGE[product.category]) {
    return PRODUCT_CATEGORY_IMAGE[product.category]!
  }
  const pro = product.proRef ? findDemoPro(product.proRef) : undefined
  const fromPro = pro?.service.cover || pro?.service.logo
  if (fromPro) return fromPro
  return pickById(product.id, PRODUCT_FALLBACK_IMAGES)
}

/** Image affichable pour un événement Market Event. */
export function resolveEventImage(event: MarketEvent): string {
  return (
    event.imageSrc ||
    EVENT_KIND_FALLBACK_IMAGE[event.kind] ||
    pickById(event.id, PRODUCT_FALLBACK_IMAGES)
  )
}

/** Image d’une campagne sponsorisée (annonce, produit ciblé ou établissement). */
export function resolveSponsoredImage(campaign: AdCampaign, pro: DemoPro): string {
  if (campaign.image) return campaign.image
  if (campaign.itemId) {
    const product = EXPLORE_PRODUCTS.find((item) => item.id === campaign.itemId)
    if (product) return resolveProductImage(product)
  }
  return pro.service.cover || pro.service.logo || ESTABLISHMENT_FALLBACK
}

/**
 * Annonces actives pour un canal (Accueil ou Explorer).
 * Source unique : `buildSponsoredFeedItems`.
 */
export function getSponsoredRecommendations(
  channel: Extract<AdChannel, 'home' | 'explore'>,
  limit = 6,
): FeedItem[] {
  return buildSponsoredFeedItems(channel).slice(0, limit)
}

/**
 * Produits populaires : catalogue live (démo + Espaces Pro locaux).
 */
export function getPopularProducts(limit = 8): Product[] {
  return getLiveExploreProducts().slice(0, limit)
}

/**
 * Événements populaires : TEMP + publiés Pro, non terminés, par participants.
 */
export function getPopularEvents(now: number, limit = 8): MarketEvent[] {
  return selectEvents(getLiveExploreEvents(), { query: '', city: null, target: null }, now)
    .filter((event) => getEventState(event, now) !== 'ended')
    .slice()
    .sort((a, b) => b.participants - a.participants)
    .slice(0, limit)
}

/** Services Pro mis en avant (vérifiés / suivis — même ordre Explorer). */
export function getRecommendedPros(limit = 6): DemoPro[] {
  return EXPLORE_PROS.slice(0, limit)
}
