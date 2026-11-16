/**
 * Rubriques de la vitrine publique (storefront Amazon / Alibaba).
 * L'identifiant `profil` (adresse `?onglet=profil`) s'affiche « À propos ».
 */
export const PRO_TABS = [
  { id: 'accueil', label: 'Boutique' },
  { id: 'catalogue', label: 'Produits' },
  { id: 'evenements', label: 'Événements' },
  { id: 'publications', label: 'Actus' },
  { id: 'avis', label: 'Avis' },
  { id: 'abonnements', label: 'Forfaits' },
  { id: 'affiliation', label: 'Affiliation' },
  { id: 'profil', label: 'À propos' },
  { id: 'contact', label: 'Contact' },
] as const satisfies readonly { id: string; label: string }[]

export type ProTabId = (typeof PRO_TABS)[number]['id']

export function isProTabId(value: string | null): value is ProTabId {
  return PRO_TABS.some((tab) => tab.id === value)
}
