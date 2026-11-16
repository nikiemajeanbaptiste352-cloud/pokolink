/**
 * Lien de partenariat collé dans une publication / vidéo / événement.
 * Accepte une URL absolue ou un chemin interne AfriConnect.
 */

/** Normalise une saisie utilisateur en chemin ou URL utilisable, ou `undefined` si vide/invalide. */
export function normalizePartnershipLink(raw: string): string | undefined {
  const trimmed = raw.trim()
  if (!trimmed) return undefined

  // Chemin interne
  if (trimmed.startsWith('/')) return trimmed

  // URL absolue http(s)
  try {
    const url = new URL(trimmed)
    if (url.protocol === 'http:' || url.protocol === 'https:') {
      // Même origine → garder le chemin + query pour la navigation SPA
      if (typeof window !== 'undefined' && url.origin === window.location.origin) {
        return `${url.pathname}${url.search}${url.hash}`
      }
      return url.toString()
    }
  } catch {
    // ignore
  }

  // Saisie type « etablissement/foo?aff=… » sans slash initial
  if (/^(etablissement|createur|affiliation|studio)\b/i.test(trimmed)) {
    return `/${trimmed.replace(/^\//, '')}`
  }

  return undefined
}

/** Libellé court pour l’aperçu du lien. */
export function partnershipLinkLabel(href: string): string {
  try {
    if (href.startsWith('/')) {
      if (href.includes('affiliation') || href.includes('aff=')) return 'Lien d’affiliation'
      if (href.includes('abonnement')) return 'Forfait d’abonnement'
      if (href.includes('publicite')) return 'Forfait publicitaire'
      if (href.includes('etablissement')) return 'Page partenaire'
      if (href.includes('createur')) return 'Créateur partenaire'
      return 'Lien de partenariat'
    }
    const host = new URL(href).hostname.replace(/^www\./, '')
    return host || 'Lien de partenariat'
  } catch {
    return 'Lien de partenariat'
  }
}

/** Exemple de lien démo pour tests (affiliation). */
export const DEMO_PARTNERSHIP_LINK =
  '/etablissement/boutique.alpha?aff=AFF-AWA01'
