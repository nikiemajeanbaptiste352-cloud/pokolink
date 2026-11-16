/**
 * Types du module Publicité de l'Espace Pro (rapport Rewards, section 9).
 * Le serveur décide de tout : paiement, validation de l'annonce, diffusion, vues, visites,
 * abonnements et points attribués. Le frontend ne prépare qu'une demande de campagne.
 */

/** Forfaits publicitaires V5. */
export type AdPackId = 'bronze' | 'silver' | 'gold'

/** Ce que la campagne met en avant. */
export type AdTargetKind = 'establishment' | 'item' | 'promotion'

/** Texte du bouton de l'annonce. */
export type AdCta = 'discover' | 'visit' | 'order' | 'book' | 'follow'

/**
 * Étape de vie d'une campagne :
 *   pending_payment : demande créée, paiement en attente de confirmation par le serveur
 *   in_review       : payée, annonce en cours de validation
 *   active          : diffusée
 *   finished        : objectifs atteints ou campagne terminée
 *   refused         : annonce refusée (le serveur précise le motif)
 */
export type AdCampaignStatus =
  'pending_payment' | 'in_review' | 'active' | 'finished' | 'refused'

/** Les trois types de mission rémunérée de l'utilisateur. */
export type AdMissionType = 'view' | 'visit' | 'subscription'

/**
 * Canaux de diffusion d’une campagne sponsorisée :
 *   home          : fil Accueil
 *   explore       : fil Explorer
 *   publications  : canal / publications de l’établissement (gestion centralisée)
 */
export type AdChannel = 'home' | 'explore' | 'publications'

export interface AdPack {
  id: AdPackId
  label: string
  /** Prix du forfait en FCFA. */
  price: number
  /** Objectifs de diffusion du forfait. */
  targets: Record<'views' | 'visits' | 'subscribers', number>
  /** Budget Rewards de la campagne, en FCFA. */
  rewardBudget: number
  /** Budget Rewards en points nominaux. */
  rewardPoints: number
  /** Points offerts à l'utilisateur pour chaque mission validée. */
  rewardPerMission: Record<AdMissionType, number>
}

export interface AdResults {
  views: number
  visits: number
  subscribers: number
}

export interface AdCampaign {
  id: string
  /** Référence provisoire : le serveur attribuera la définitive. */
  reference: string
  serviceId: string
  pack: AdPackId
  target: AdTargetKind
  /** Produit ou prestation mis en avant (cible « item »). */
  itemId?: string
  itemName?: string
  title: string
  text: string
  cta: AdCta
  /** Image en data URL, chaîne vide si aucune. */
  image: string
  /** Canaux où l’annonce est diffusée (Accueil, Explorer, publications). */
  channels: readonly AdChannel[]
  status: AdCampaignStatus
  createdAt: number
  /** Résultats mesurés par le serveur. */
  results: AdResults
  /** Vrai pour les campagnes créées sur cet appareil. */
  local: boolean
}
