import { useMemo, useSyncExternalStore } from 'react'

import { useLocalStore } from '@/hooks/use-local-store'
import { getFollowing, subscribeFollowing } from '@/lib/follow-store'
import {
  getFollowerDelta,
  getPostViewCount,
  getVisitSeries,
  profileEngagementStore,
} from '@/lib/profile-engagement-store'
import { TEMP_PROFILE } from '@/lib/placeholder-profile'
import { localPostsStore } from '@/lib/social-store'
import type { LocalPost } from '@/lib/social-store'

export interface ProfileLiveStats {
  posts: number
  followers: number
  following: number
  /** Courbe 7 j : vues = visites page publique ; followers = 0 (démo locale). */
  activity: readonly { label: string; views: number; followers: number }[]
  /** Vues par publication locale (privé → public). */
  postStats: readonly { id: string; title: string; views: number }[]
  localPosts: readonly LocalPost[]
}

/**
 * Stats profil connectées : publications locales, abonnements, visites publiques.
 * Remplace les compteurs figés du seed pour le compte connecté.
 */
export function useProfileStats(handle = TEMP_PROFILE.handle): ProfileLiveStats {
  const localPosts = useLocalStore(localPostsStore)
  const engagement = useLocalStore(profileEngagementStore)
  const followingSet = useSyncExternalStore(subscribeFollowing, getFollowing)

  return useMemo(() => {
    const posts = localPosts.length
    const followers = TEMP_PROFILE.stats.followers + getFollowerDelta(handle)
    const following = followingSet.size
    const activity = getVisitSeries(handle, 7).map((point) => ({
      label: point.label,
      views: point.views,
      followers: 0,
    }))
    const postStats = localPosts.map((post) => ({
      id: post.id,
      title: post.text.trim() || 'Publication',
      views: getPostViewCount(post.id),
    }))
    return {
      posts,
      followers,
      following,
      activity,
      postStats,
      localPosts,
    }
    // engagement force recompute when visits / deltas change
  }, [localPosts, followingSet, handle, engagement])
}
