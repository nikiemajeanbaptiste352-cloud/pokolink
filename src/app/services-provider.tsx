import { useEffect, useMemo, useReducer, type ReactNode } from 'react'

import { createId } from '@/lib/ids'
import { createServiceDraft, makeUniqueUsername } from '@/lib/service-defaults'
import {
  loadServicesState,
  saveServicesState,
  type ServicesState,
} from '@/lib/services-storage'
import type { CatalogItem, Service } from '@/types/service'

import {
  ServicesContext,
  type CatalogItemInput,
  type ServicePatch,
  type ServicesContextValue,
} from './services-context'

type Action =
  | { type: 'service/create'; service: Service }
  | { type: 'service/update'; id: string; patch: ServicePatch }
  | { type: 'service/delete'; id: string }
  | { type: 'item/add'; item: CatalogItem }
  | { type: 'item/update'; id: string; input: CatalogItemInput }
  | { type: 'item/remove'; id: string }

function reducer(state: ServicesState, action: Action): ServicesState {
  switch (action.type) {
    case 'service/create':
      return { ...state, services: [...state.services, action.service] }
    case 'service/update':
      return {
        ...state,
        services: state.services.map((s) =>
          s.id === action.id ? { ...s, ...action.patch } : s,
        ),
      }
    case 'service/delete':
      return {
        services: state.services.filter((s) => s.id !== action.id),
        // Indépendance des services : leurs données disparaissent avec eux.
        items: state.items.filter((i) => i.serviceId !== action.id),
      }
    case 'item/add':
      return { ...state, items: [...state.items, action.item] }
    case 'item/update':
      return {
        ...state,
        items: state.items.map((i) =>
          i.id === action.id ? { ...i, ...action.input } : i,
        ),
      }
    case 'item/remove':
      return { ...state, items: state.items.filter((i) => i.id !== action.id) }
  }
}

/** Fournit les services de l'utilisateur et leurs catalogues à toute l'application. */
export function ServicesProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, loadServicesState)

  useEffect(() => {
    saveServicesState(state)
  }, [state])

  const value = useMemo<ServicesContextValue>(
    () => ({
      services: state.services,
      items: state.items,
      createService: ({ type, name }) => {
        const id = createId()
        const username = makeUniqueUsername(
          name,
          new Set(state.services.map((s) => s.username)),
        )
        dispatch({
          type: 'service/create',
          service: createServiceDraft({ id, type, name, username }),
        })
        return id
      },
      updateService: (id, patch) => dispatch({ type: 'service/update', id, patch }),
      deleteService: (id) => dispatch({ type: 'service/delete', id }),
      addItem: (serviceId, input) => {
        const id = createId()
        dispatch({ type: 'item/add', item: { ...input, id, serviceId } })
        return id
      },
      updateItem: (id, input) => dispatch({ type: 'item/update', id, input }),
      removeItem: (id) => dispatch({ type: 'item/remove', id }),
    }),
    [state],
  )

  return <ServicesContext.Provider value={value}>{children}</ServicesContext.Provider>
}
