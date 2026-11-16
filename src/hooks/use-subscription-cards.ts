import { useMemo, useSyncExternalStore } from 'react'

import { usePublicPro } from '@/hooks/use-public-pro'
import { TEMP_SUBSCRIPTIONS } from '@/lib/placeholder-subscriptions'
import { getStoredCards, subscribeCards } from '@/lib/subscription-cards-store'
import { getServiceTypeMeta } from '@/lib/service-types'
import type { SubscriptionCard } from '@/types/subscription'

export interface CardPro {
  name: string
  logo?: string | undefined
  verified: boolean
  /** Domaine d'activité (ex. « Entretien automobile »). */
  domain: string
}

/** Toutes les cartes connues : celles demandées sur cet appareil, puis les exemples. */
export function useSubscriptionCards(): SubscriptionCard[] {
  const stored = useSyncExternalStore(subscribeCards, getStoredCards)
  return useMemo(() => [...stored, ...TEMP_SUBSCRIPTIONS], [stored])
}

/** Cartes de l'utilisateur connecté, de la plus récente à la plus ancienne. */
export function useMySubscriptionCards(): SubscriptionCard[] {
  const cards = useSubscriptionCards()
  return useMemo(
    () => cards.filter((card) => card.mine).sort((a, b) => b.createdAt - a.createdAt),
    [cards],
  )
}

/** Cartes vendues par un Service Pro, de la plus récente à la plus ancienne. */
export function useServiceSubscriptionCards(serviceId: string): SubscriptionCard[] {
  const cards = useSubscriptionCards()
  return useMemo(
    () =>
      cards
        .filter((card) => card.serviceId === serviceId)
        .sort((a, b) => b.createdAt - a.createdAt),
    [cards, serviceId],
  )
}

/** Le Service Pro qui vend le forfait, tel qu'il s'affiche sur la carte. */
export function useCardPro(card: SubscriptionCard): CardPro {
  const pro = usePublicPro(card.proRef)
  return useMemo(() => {
    if (!pro) return { name: 'Service Pro', verified: false, domain: '' }
    return {
      name: pro.service.name,
      logo: pro.service.logo || undefined,
      verified: pro.verified,
      domain: pro.tagline || getServiceTypeMeta(pro.service.type).label,
    }
  }, [pro])
}
