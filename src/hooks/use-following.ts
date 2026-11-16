import { useSyncExternalStore } from 'react'

import { getFollowing, subscribeFollowing, toggleFollowing } from '@/lib/follow-store'

/** Abonnement local à `key` (ex. « creator:awa.cuisine ») et son bouton bascule. */
export function useFollowing(key: string): [boolean, () => void] {
  const set = useSyncExternalStore(subscribeFollowing, getFollowing)
  return [set.has(key), () => toggleFollowing(key)]
}
