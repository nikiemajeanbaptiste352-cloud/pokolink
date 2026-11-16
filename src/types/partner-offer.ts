/** Offre partenaire affichée sous un contenu Explorer / fil (abo, pub, affiliation). */
export type PartnerOfferKind = 'subscription' | 'ad_plan' | 'affiliate'

export interface PartnerOffer {
  id: string
  kind: PartnerOfferKind
  title: string
  subtitle: string
  priceLabel?: string
  badge: string
  /** Photo / logo du partenaire. */
  avatarSrc?: string
  partnerName: string
  /** Clic photo / indice profil → page publique. */
  profileTo: string
  /** Clic milieu de carte → détail de l’offre. */
  detailTo: string
  imageSrc?: string
}
