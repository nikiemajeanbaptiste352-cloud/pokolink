/**
 * Petit stockage local réutilisable (localStorage + abonnés), à lire avec `useLocalStore`.
 *
 * STOCKAGE TEMPORAIRE : ces données restent sur l'appareil. À remplacer par l'API quand le
 * serveur sera branché ; il décide de tout ce qui est financier ou partagé entre utilisateurs.
 */
export interface LocalStore<T> {
  get: () => T
  set: (next: T) => void
  subscribe: (listener: () => void) => () => void
}

/**
 * @param key clé localStorage versionnée
 * @param parse valide la valeur lue (reçoit `null` s'il n'y a rien) et renvoie une valeur sûre
 */
export function createLocalStore<T>(
  key: string,
  parse: (raw: unknown) => T,
): LocalStore<T> {
  let cache: T | undefined
  let loaded = false
  const listeners = new Set<() => void>()

  function get(): T {
    if (!loaded) {
      let raw: unknown
      try {
        raw = JSON.parse(window.localStorage.getItem(key) ?? 'null')
      } catch {
        raw = null
      }
      cache = parse(raw)
      loaded = true
    }
    return cache as T
  }

  function set(next: T) {
    cache = next
    loaded = true
    try {
      window.localStorage.setItem(key, JSON.stringify(next))
    } catch {
      // Quota dépassé : la valeur reste en mémoire pour cette session.
    }
    listeners.forEach((listener) => listener())
  }

  function subscribe(listener: () => void) {
    listeners.add(listener)
    return () => {
      listeners.delete(listener)
    }
  }

  return { get, set, subscribe }
}
