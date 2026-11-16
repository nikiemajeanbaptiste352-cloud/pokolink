/**
 * STOCKAGE TEMPORAIRE des abonnements de cet appareil : clés « type:identifiant »
 * (`creator:…`, `learn:…`, `establishment:…`) dans le localStorage.
 *
 * Les suivis `creator:…` / `learn:…` mettent aussi à jour le delta d’abonnés
 * (`profile-engagement-store`). Les établissements passent par `follows-store`
 * (préfixe `establishment:`). À remplacer par l’API.
 */
import { applyFollowerDelta } from '@/lib/profile-engagement-store'

const STORAGE_KEY = 'africonnect.following.v1'

type Listener = () => void

let following: ReadonlySet<string> | null = null
const listeners = new Set<Listener>()

export function getFollowing(): ReadonlySet<string> {
  if (following) return following
  let loaded: string[] = []
  try {
    const parsed: unknown = JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? 'null')
    if (Array.isArray(parsed))
      loaded = parsed.filter((v): v is string => typeof v === 'string')
  } catch {
    // Données illisibles : aucun abonnement.
  }
  following = new Set(loaded)
  return following
}

export function subscribeFollowing(listener: Listener): () => void {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

function persistFollowing(next: ReadonlySet<string>) {
  following = next
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify([...next]))
  } catch {
    // Quota dépassé : l'état reste en mémoire.
  }
}

/**
 * Ajoute des clés sans notifier (migration pendant `getSnapshot`).
 * Évite les boucles `useSyncExternalStore`.
 */
export function mergeFollowingKeysSilent(keys: readonly string[]): void {
  const next = new Set(getFollowing())
  let changed = false
  for (const key of keys) {
    if (!next.has(key)) {
      next.add(key)
      changed = true
    }
  }
  if (changed) persistFollowing(next)
}

/** Abonne ou désabonne. Les clés `creator:handle` alimentent les stats publiques. */
export function toggleFollowing(key: string) {
  const next = new Set(getFollowing())
  const adding = !next.has(key)
  if (adding) next.add(key)
  else next.delete(key)
  persistFollowing(next)
  if (key.startsWith('creator:')) {
    applyFollowerDelta(key.slice('creator:'.length), adding ? 1 : -1)
  }
  if (key.startsWith('learn:')) {
    applyFollowerDelta(key.slice('learn:'.length), adding ? 1 : -1)
  }
  listeners.forEach((listener) => listener())
}
