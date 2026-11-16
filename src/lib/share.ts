export type ShareResult = 'shared' | 'copied' | 'cancelled' | 'failed'

/**
 * Partage un lien avec la feuille de partage du système quand elle existe,
 * sinon le copie dans le presse-papiers.
 */
export async function shareOrCopy(url: string, title: string): Promise<ShareResult> {
  if (typeof navigator.share === 'function') {
    try {
      await navigator.share({ title, url })
      return 'shared'
    } catch (error) {
      // L'utilisateur a fermé la feuille de partage : ce n'est pas une erreur.
      if (error instanceof DOMException && error.name === 'AbortError') return 'cancelled'
    }
  }
  try {
    await navigator.clipboard.writeText(url)
    return 'copied'
  } catch {
    return 'failed'
  }
}
