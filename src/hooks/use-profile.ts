import { useMemo } from 'react'

import { useLocalStore } from '@/hooks/use-local-store'
import { mergeProfile, profileStore } from '@/lib/profile-store'
import type { UserProfile } from '@/types/profile'

/** Profil de l'utilisateur connecté, avec ses modifications locales. */
export function useProfile(): UserProfile {
  const override = useLocalStore(profileStore)
  return useMemo(() => mergeProfile(override), [override])
}
