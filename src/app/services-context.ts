import { createContext } from 'react'

import type { CatalogItem, Service, ServiceType } from '@/types/service'

export type ServicePatch = Partial<Omit<Service, 'id' | 'createdAt'>>
export type CatalogItemInput = Omit<CatalogItem, 'id' | 'serviceId'>

export interface ServicesContextValue {
  services: readonly Service[]
  items: readonly CatalogItem[]
  /** Crée un service (brouillon) et renvoie son identifiant. */
  createService: (input: { type: ServiceType; name: string }) => string
  updateService: (id: string, patch: ServicePatch) => void
  /** Supprime un service et toutes ses données (catalogue…). */
  deleteService: (id: string) => void
  addItem: (serviceId: string, input: CatalogItemInput) => string
  updateItem: (id: string, input: CatalogItemInput) => void
  removeItem: (id: string) => void
}

export const ServicesContext = createContext<ServicesContextValue | null>(null)
