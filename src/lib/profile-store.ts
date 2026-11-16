/**
 * Profil de l'utilisateur modifié sur cet appareil (nom, bio, ville, pays, photo).
 *
 * STOCKAGE TEMPORAIRE : l'identifiant (@handle), la vérification, les statistiques et le solde
 * viennent du serveur et ne se modifient pas ici. À remplacer par l'API (mise à jour du profil).
 */
import { createLocalStore } from '@/lib/local-store'
import { TEMP_PROFILE } from '@/lib/placeholder-profile'
import type { UserProfile } from '@/types/profile'

export interface ProfileOverride {
  name?: string
  bio?: string
  city?: string
  country?: string
  phone?: string
  avatarSrc?: string
}

const KEYS = ['name', 'bio', 'city', 'country', 'phone', 'avatarSrc'] as const

export const profileStore = createLocalStore<ProfileOverride>(
  'africonnect.profile.v1',
  (raw) => {
    const override: ProfileOverride = {}
    if (typeof raw !== 'object' || raw === null) return override
    const record = raw as Record<string, unknown>
    for (const key of KEYS) {
      const value = record[key]
      if (typeof value === 'string') override[key] = value
    }
    return override
  },
)

/** Profil courant : l'exemple du serveur, complété par les modifications locales. */
export function mergeProfile(override: ProfileOverride): UserProfile {
  return {
    ...TEMP_PROFILE,
    name: override.name?.trim() || TEMP_PROFILE.name,
    bio: override.bio ?? TEMP_PROFILE.bio,
    city: override.city?.trim() || TEMP_PROFILE.city,
    country: override.country?.trim() || TEMP_PROFILE.country,
    phone: override.phone?.trim() || TEMP_PROFILE.phone,
    ...(override.avatarSrc ? { avatarSrc: override.avatarSrc } : {}),
  }
}

export function getProfile(): UserProfile {
  return mergeProfile(profileStore.get())
}

export function saveProfile(next: ProfileOverride) {
  profileStore.set(next)
}
