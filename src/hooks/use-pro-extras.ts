import { useCallback, useSyncExternalStore } from 'react'

import { useServiceItems } from '@/hooks/use-services'
import { getProExtras, subscribeProExtras, updateProExtras } from '@/lib/pro-extras-store'
import type { ProExtras } from '@/types/pro'
import type { Service } from '@/types/service'

/**
 * Données privées d'UN service pour Canal, Avis, Abonnements et Événements.
 * `update` reçoit une fonction qui renvoie le nouvel état complet.
 */
export function useProExtras(service: Service) {
  const items = useServiceItems(service.id)
  const data = useSyncExternalStore(subscribeProExtras, () =>
    getProExtras(service, items),
  )
  const update = useCallback(
    (mutate: (current: ProExtras) => ProExtras) =>
      updateProExtras(service, items, mutate),
    [service, items],
  )
  return { data, update, items }
}
