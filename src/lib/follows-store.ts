/**
 * Abonnements aux établissements (Espace Pro).
 * Délègue au store unifié `follow-store` avec la clé `establishment:…`.
 * Migre une fois l’ancien localStorage `africonnect.follows.v1`.
 *
 * Important : `getFollowed()` doit renvoyer la **même référence** tant que
 * les suivis n’ont pas changé (`useSyncExternalStore`).
 */
import {
  getFollowing,
  mergeFollowingKeysSilent,
  subscribeFollowing,
  toggleFollowing,
} from '@/lib/follow-store'

const LEGACY_KEY = 'africonnect.follows.v1'
const PREFIX = 'establishment:'

let migrated = false
/** Snapshot stable pour useSyncExternalStore. */
let cachedList: readonly string[] | null = null
let cachedSource: ReadonlySet<string> | null = null

function migrateLegacyFollows(): void {
  if (migrated) return
  migrated = true
  try {
    const raw = window.localStorage.getItem(LEGACY_KEY)
    if (!raw) return
    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed)) return
    const keys: string[] = []
    for (const id of parsed) {
      if (typeof id === 'string' && id) keys.push(`${PREFIX}${id}`)
    }
    if (keys.length > 0) mergeFollowingKeysSilent(keys)
    window.localStorage.removeItem(LEGACY_KEY)
  } catch {
    // Legacy illisible : ignore.
  }
}

function establishmentKey(spaceId: string): string {
  return `${PREFIX}${spaceId}`
}

function buildFollowedList(source: ReadonlySet<string>): readonly string[] {
  return [...source]
    .filter((key) => key.startsWith(PREFIX))
    .map((key) => key.slice(PREFIX.length))
}

export function getFollowed(): readonly string[] {
  migrateLegacyFollows()
  const source = getFollowing()
  if (cachedList && cachedSource === source) return cachedList
  cachedSource = source
  cachedList = buildFollowedList(source)
  return cachedList
}

export function toggleFollow(spaceId: string): void {
  migrateLegacyFollows()
  cachedList = null
  cachedSource = null
  toggleFollowing(establishmentKey(spaceId))
}

export function subscribeFollows(listener: () => void): () => void {
  return subscribeFollowing(() => {
    cachedList = null
    cachedSource = null
    listener()
  })
}
