/**
 * Créateurs : profil public d'un créateur du Creator Market (cotes et coins) et du Creator
 * Studio. Un créateur est identifié par son @identifiant ; ses événements viennent des
 * marchés d'exemple et, pour le compte connecté, du Creator Studio.
 *
 * DONNÉES TEMPORAIRES : biographies, villes et nombres d'abonnés sont des exemples. À
 * remplacer par l'API (TanStack Query) : le serveur fournit le profil et ses chiffres.
 */
import { TEMP_COIN_EVENTS } from '@/lib/placeholder-coin-markets'
import { TEMP_MARKETS } from '@/lib/placeholder-markets'
import { getFollowerDelta } from '@/lib/profile-engagement-store'
import { getProfile } from '@/lib/profile-store'
import { localPostsStore } from '@/lib/social-store'
import type { CoinEvent } from '@/types/coin-market'
import type { CreatorMarket } from '@/types/market'

export interface CreatorProfile {
  handle: string
  name: string
  avatar?: string | undefined
  bio: string
  city: string
  verified: boolean
  followers: number
  /** C'est le compte connecté : la page propose d'ouvrir le Creator Studio. */
  isMe: boolean
}

interface CreatorExtra {
  bio: string
  city: string
  verified: boolean
  followers: number
}

const EXTRAS: Record<string, CreatorExtra> = {
  'awa.cuisine': {
    bio: 'Cuisine africaine, recettes simples et bons plans de Ouaga.',
    city: 'Ouagadougou',
    verified: true,
    followers: 48_200,
  },
  'moussa.tech': {
    bio: 'Tests de téléphones et astuces tech pour tous les budgets.',
    city: 'Bobo-Dioulasso',
    verified: true,
    followers: 31_500,
  },
  'fatou.mode': {
    bio: 'Mode, wax et créateurs locaux.',
    city: 'Dakar',
    verified: false,
    followers: 22_900,
  },
  'ibra.sport': {
    bio: 'Sport, entraînements et vie de club.',
    city: 'Abidjan',
    verified: false,
    followers: 15_400,
  },
  'aminata.beaute': {
    bio: 'Soins, maquillage et routines naturelles.',
    city: 'Ouagadougou',
    verified: true,
    followers: 27_800,
  },
  'kofi.voyage': {
    bio: 'Voyages et découvertes à travers l’Afrique de l’Ouest.',
    city: 'Accra',
    verified: false,
    followers: 19_600,
  },
}

/** Le compte connecté, avec son profil modifié sur l'appareil. */
function buildMe(): CreatorProfile {
  const profile = getProfile()
  return {
    handle: profile.handle,
    name: profile.name,
    avatar: profile.avatarSrc,
    bio: profile.bio,
    city: profile.city,
    verified: profile.verified ?? false,
    followers: profile.stats.followers + getFollowerDelta(profile.handle),
    isMe: true,
  }
}

/** Publications créées en privé (appareil) visibles sur la page publique. */
export function getCreatorLocalPosts() {
  return localPostsStore.get()
}

function collectCreators(): Map<string, CreatorProfile> {
  const creators = new Map<string, CreatorProfile>()
  const add = (handle: string, name: string, avatar: string | undefined) => {
    if (creators.has(handle)) return
    const extra = EXTRAS[handle]
    creators.set(handle, {
      handle,
      name,
      avatar,
      bio: extra?.bio ?? 'Créateur AfriConnect.',
      city: extra?.city ?? '',
      verified: extra?.verified ?? false,
      followers: extra?.followers ?? 0,
      isMe: false,
    })
  }
  for (const market of TEMP_MARKETS) {
    add(market.creatorHandle, market.creatorName, market.creatorAvatar)
  }
  for (const event of TEMP_COIN_EVENTS) {
    add(event.creatorHandle, event.creatorName, event.creatorAvatar)
  }
  return creators
}

const CREATORS = collectCreators()

/** Profil d'un créateur par @identifiant (avec ou sans le « @ »). */
export function findCreator(handle: string | undefined): CreatorProfile | undefined {
  if (!handle) return undefined
  const clean = handle.replace(/^@/, '')
  const me = buildMe()
  return clean === me.handle ? me : CREATORS.get(clean)
}

/** Événements « cotes » d'un créateur. */
export function getCreatorMarkets(handle: string): CreatorMarket[] {
  return TEMP_MARKETS.filter((market) => market.creatorHandle === handle)
}

/** Événements « coins » d'un créateur. */
export function getCreatorCoinEvents(handle: string): CoinEvent[] {
  return TEMP_COIN_EVENTS.filter((event) => event.creatorHandle === handle)
}

/** Tous les créateurs connus (pour la recherche). */
export function listCreators(): CreatorProfile[] {
  return [buildMe(), ...CREATORS.values()]
}
