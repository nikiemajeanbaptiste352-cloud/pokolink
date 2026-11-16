import { useMemo, useSyncExternalStore } from 'react'

import { useServices } from '@/hooks/use-services'
import { findDemoPro, findDemoProduct, type ProHighlight } from '@/lib/directory'
import { getAverageRating, getPromoPrices } from '@/lib/pro-public'
import { getProExtras, subscribeProExtras } from '@/lib/pro-extras-store'
import type { ProExtras } from '@/types/pro'
import type { CatalogItem, Service } from '@/types/service'

/** Un établissement tel que le voit un visiteur (profil public). */
export interface PublicPro {
  service: Service
  items: CatalogItem[]
  extras: ProExtras
  /** L'utilisateur connecté est le propriétaire : il voit « Gérer mon Espace Pro ». */
  owned: boolean
  tagline: string
  verified: boolean
  followers: number
  /** Note moyenne, `null` tant qu'il n'y a aucun avis. */
  rating: number | null
  reviewCount: number
  highlights: readonly ProHighlight[]
}

const NO_ITEMS: CatalogItem[] = []

/**
 * Profil public par référence (nom d'utilisateur ou identifiant). On cherche d'abord parmi
 * les établissements de l'utilisateur (propriétaire), puis dans l'annuaire d'exemple.
 * Un établissement encore en configuration n'est pas public.
 */
export function usePublicPro(ref: string | undefined): PublicPro | undefined {
  const { services, items } = useServices()
  const mine = services.find((s) => s.id === ref || s.username === ref)
  const demo = mine ? undefined : findDemoPro(ref)
  const service = mine ?? demo?.service
  const proItems = useMemo(
    () =>
      mine ? items.filter((i) => i.serviceId === mine.id) : (demo?.items ?? NO_ITEMS),
    [mine, items, demo],
  )
  const extras = useSyncExternalStore(subscribeProExtras, () =>
    mine ? getProExtras(mine, proItems) : (demo?.extras ?? null),
  )

  return useMemo(() => {
    if (!service || !extras || service.status !== 'active') return undefined
    if (demo) {
      return {
        service,
        items: proItems,
        extras,
        owned: false,
        tagline: demo.tagline,
        verified: demo.verified,
        followers: demo.followers,
        rating: demo.rating,
        reviewCount: demo.reviewCount,
        highlights: demo.highlights,
      }
    }
    return {
      service,
      items: proItems,
      extras,
      owned: true,
      tagline: '',
      verified: false,
      followers: extras.subscribers.length,
      rating: getAverageRating(extras.reviews),
      reviewCount: extras.reviews.length,
      highlights: [],
    }
  }, [service, extras, demo, proItems])
}

/** Produit public et ce que la fiche montre de son vendeur. */
export interface PublicProduct {
  item: CatalogItem
  service: Service
  owned: boolean
  siblings: CatalogItem[]
  /** Prix promotionnel annoncé par le vendeur (inférieur au prix du catalogue). */
  promoPrice?: number
  verified: boolean
  /** Note moyenne du vendeur, `null` sans avis. */
  rating: number | null
  reviewCount: number
  followers: number
}

/** Produit public et son vendeur : catalogues des établissements de l'utilisateur, puis annuaire. */
export function usePublicProduct(
  productId: string | undefined,
): PublicProduct | undefined {
  const { services, items } = useServices()
  return useMemo(() => {
    const own = items.find((i) => i.id === productId)
    const ownService = own ? services.find((s) => s.id === own.serviceId) : undefined
    if (own && ownService) {
      if (ownService.status !== 'active') return undefined
      return {
        item: own,
        service: ownService,
        owned: true,
        siblings: items.filter((i) => i.serviceId === ownService.id && i.id !== own.id),
        verified: false,
        rating: null,
        reviewCount: 0,
        followers: 0,
      }
    }
    const demo = findDemoProduct(productId)
    if (!demo) return undefined
    const promo = getPromoPrices(demo.pro.extras).get(demo.item.id)
    return {
      item: demo.item,
      service: demo.pro.service,
      owned: false,
      siblings: demo.pro.items.filter((i) => i.id !== demo.item.id),
      ...(promo !== undefined && promo < demo.item.price ? { promoPrice: promo } : {}),
      verified: demo.pro.verified,
      rating: demo.pro.rating,
      reviewCount: demo.pro.reviewCount,
      followers: demo.pro.followers,
    }
  }, [productId, services, items])
}
