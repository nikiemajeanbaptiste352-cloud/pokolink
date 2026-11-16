import { useContext, useMemo } from 'react'

import { ServicesContext, type ServicesContextValue } from '@/app/services-context'
import type { CatalogItem, Service } from '@/types/service'

/** Accès au magasin de services (doit être utilisé sous `ServicesProvider`). */
export function useServices(): ServicesContextValue {
  const context = useContext(ServicesContext)
  if (!context) {
    throw new Error('useServices doit être utilisé dans un ServicesProvider')
  }
  return context
}

/** Un service par identifiant, ou `undefined` s'il n'existe pas. */
export function useService(serviceId: string | undefined): Service | undefined {
  const { services } = useServices()
  return services.find((s) => s.id === serviceId)
}

/**
 * Un service retrouvé par sa référence publique : son identifiant OU son nom d'utilisateur
 * (`/etablissement/le.delice`).
 */
export function useServiceByRef(ref: string | undefined): Service | undefined {
  const { services } = useServices()
  return services.find((s) => s.id === ref || s.username === ref)
}

/** Le catalogue d'un seul service : les éléments des autres services sont invisibles. */
export function useServiceItems(serviceId: string | undefined): CatalogItem[] {
  const { items } = useServices()
  return useMemo(() => items.filter((i) => i.serviceId === serviceId), [items, serviceId])
}
