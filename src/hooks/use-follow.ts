import { useSyncExternalStore } from 'react'

import { getFollowed, subscribeFollows, toggleFollow } from '@/lib/follows-store'

/** Abonnement de l'utilisateur à un établissement (`professional_space_id`). */
export function useFollow(spaceId: string): { following: boolean; toggle: () => void } {
  const followed = useSyncExternalStore(subscribeFollows, getFollowed)
  return { following: followed.includes(spaceId), toggle: () => toggleFollow(spaceId) }
}
