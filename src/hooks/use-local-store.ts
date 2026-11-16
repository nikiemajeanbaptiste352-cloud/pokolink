import { useSyncExternalStore } from 'react'

import type { LocalStore } from '@/lib/local-store'

/** Valeur courante d'un `LocalStore` (se met à jour à chaque changement). */
export function useLocalStore<T>(store: LocalStore<T>): T {
  return useSyncExternalStore(store.subscribe, store.get)
}
