import type {
  AdCampaignStatus,
  AdChannel,
  AdCta,
  AdMissionType,
  AdPack,
  AdPackId,
  AdTargetKind,
} from '@/types/ads'

/**
 * Forfaits publicitaires V5 (rapport Rewards, section 9). Ces valeurs sont affichées pour
 * informer l'annonceur : le serveur reste la référence pour les prix, le budget Rewards, les
 * récompenses par mission, les plafonds quotidiens et la précision des décimales.
 *
 * Répartition : 50 % du prix du forfait pour AfriConnect, 50 % pour le budget Rewards de la
 * campagne (40 % vues, 30 % visites, 30 % abonnements).
 */
export const AD_PACKS: readonly AdPack[] = [
  {
    id: 'bronze',
    label: 'Bronze',
    price: 1_000,
    targets: { views: 5_000, visits: 500, subscribers: 50 },
    rewardBudget: 500,
    rewardPoints: 5_000,
    rewardPerMission: { view: 0.4, visit: 3, subscription: 30 },
  },
  {
    id: 'silver',
    label: 'Argent',
    price: 5_000,
    targets: { views: 30_000, visits: 3_000, subscribers: 300 },
    rewardBudget: 2_500,
    rewardPoints: 25_000,
    rewardPerMission: { view: 1 / 3, visit: 2.5, subscription: 25 },
  },
  {
    id: 'gold',
    label: 'Or',
    price: 15_000,
    targets: { views: 100_000, visits: 10_000, subscribers: 1_000 },
    rewardBudget: 7_500,
    rewardPoints: 75_000,
    rewardPerMission: { view: 0.3, visit: 2.25, subscription: 22.5 },
  },
]

export function getAdPack(id: AdPackId): AdPack {
  return AD_PACKS.find((pack) => pack.id === id) ?? AD_PACKS[0]!
}

export const AD_MISSION_LABEL: Record<AdMissionType, { label: string; hint: string }> = {
  view: { label: 'Vues', hint: 'L’utilisateur voit votre annonce' },
  visit: { label: 'Visites', hint: 'Il ouvre la page de votre établissement' },
  subscription: { label: 'Abonnements', hint: 'Il s’abonne à votre canal' },
}

/** Plafonds quotidiens par utilisateur (rapport, section 9.4). */
export const AD_DAILY_LIMITS: Record<AdMissionType, number> = {
  view: 10,
  visit: 3,
  subscription: 4,
}

export const AD_TARGET_LABEL: Record<
  AdTargetKind,
  { label: string; description: string }
> = {
  establishment: {
    label: 'Mon établissement',
    description: 'Faire connaître votre page et gagner des abonnés.',
  },
  item: {
    label: 'Un produit ou une prestation',
    description: 'Mettre en avant un élément de votre catalogue.',
  },
  promotion: {
    label: 'Une promotion',
    description: 'Annoncer une offre ou un événement ponctuel.',
  },
}

export const AD_CTA_LABEL: Record<AdCta, string> = {
  discover: 'Découvrir',
  visit: 'Visiter',
  order: 'Commander',
  book: 'Réserver',
  follow: 'S’abonner',
}

export const AD_CTAS = Object.keys(AD_CTA_LABEL) as AdCta[]

export const AD_CHANNEL_LABEL: Record<
  AdChannel,
  { label: string; description: string }
> = {
  home: {
    label: 'Accueil',
    description: 'Fil d’actualité de l’application.',
  },
  explore: {
    label: 'Explorer',
    description: 'Marketplace : rail Sponsorisé, produits et événements.',
  },
  publications: {
    label: 'Publications',
    description: 'Canal public de l’établissement (gestion centralisée).',
  },
}

export const AD_CHANNELS = Object.keys(AD_CHANNEL_LABEL) as AdChannel[]

/** Canaux par défaut quand un forfait est pris (tous les espaces de diffusion). */
export const DEFAULT_AD_CHANNELS: readonly AdChannel[] = [
  'home',
  'explore',
  'publications',
]

export const AD_STATUS: Record<AdCampaignStatus, { label: string; message: string }> = {
  pending_payment: {
    label: 'Paiement en attente',
    message:
      'Votre demande est envoyée. Le serveur confirme le paiement depuis votre Wallet FCFA ; rien n’est encore diffusé.',
  },
  in_review: {
    label: 'En validation',
    message: 'Paiement reçu. L’annonce est examinée avant sa diffusion.',
  },
  active: {
    label: 'En diffusion',
    message: 'L’annonce est diffusée. Les résultats sont mesurés par le serveur.',
  },
  finished: {
    label: 'Terminée',
    message: 'La campagne est terminée.',
  },
  refused: {
    label: 'Refusée',
    message: 'L’annonce n’a pas été validée. Modifiez-la et créez une nouvelle campagne.',
  },
}

/** Étapes du parcours d'une campagne, dans l'ordre. */
export const AD_JOURNEY: readonly { id: AdCampaignStatus; label: string }[] = [
  { id: 'pending_payment', label: 'Paiement' },
  { id: 'in_review', label: 'Validation' },
  { id: 'active', label: 'Diffusion' },
  { id: 'finished', label: 'Terminée' },
]

/** Points affichés avec au plus deux décimales (ex. 0,33). */
const pointsFormatter = new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 2 })

export function formatMissionPoints(value: number): string {
  return `${pointsFormatter.format(value)} pt${value >= 2 ? 's' : ''}`
}
