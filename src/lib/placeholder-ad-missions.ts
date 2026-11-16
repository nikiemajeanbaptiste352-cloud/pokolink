/**
 * DONNÉES TEMPORAIRES : missions publicitaires proposées à l'utilisateur (rapport Rewards §9).
 * Le serveur décide des campagnes éligibles, des points et de la validation.
 * À remplacer par l'API (TanStack Query).
 */
import { AD_DAILY_LIMITS, getAdPack } from '@/lib/ad-packs'
import { paths } from '@/routes/paths'
import type { RewardsAdMission } from '@/types/ad-missions'

const bronze = getAdPack('bronze')
const silver = getAdPack('silver')

/** Missions d'exemple visibles dans Rewards → Missions publicitaires. */
export const PLACEHOLDER_AD_MISSIONS: readonly RewardsAdMission[] = [
  {
    id: 'adm-demo-view-1',
    type: 'view',
    campaignId: 'ad-demo-1',
    campaignTitle: 'Découvrez notre établissement',
    businessName: 'Saveurs du Plateau',
    businessHandle: 'saveurs-plateau',
    pack: 'silver',
    points: silver.rewardPerMission.view,
    dailyLimit: AD_DAILY_LIMITS.view,
    doneToday: 3,
    status: 'available',
    to: paths.establishment('saveurs-plateau'),
  },
  {
    id: 'adm-demo-visit-1',
    type: 'visit',
    campaignId: 'ad-demo-1',
    campaignTitle: 'Découvrez notre établissement',
    businessName: 'Saveurs du Plateau',
    businessHandle: 'saveurs-plateau',
    pack: 'silver',
    points: silver.rewardPerMission.visit,
    dailyLimit: AD_DAILY_LIMITS.visit,
    doneToday: 1,
    status: 'available',
    to: paths.establishment('saveurs-plateau'),
  },
  {
    id: 'adm-demo-sub-1',
    type: 'subscription',
    campaignId: 'ad-demo-1',
    campaignTitle: 'Découvrez notre établissement',
    businessName: 'Saveurs du Plateau',
    businessHandle: 'saveurs-plateau',
    pack: 'silver',
    points: silver.rewardPerMission.subscription,
    dailyLimit: AD_DAILY_LIMITS.subscription,
    doneToday: 0,
    status: 'available',
    to: paths.establishmentPosts('saveurs-plateau'),
  },
  {
    id: 'adm-demo-view-2',
    type: 'view',
    campaignId: 'ad-demo-2',
    campaignTitle: 'Offre de rentrée',
    businessName: 'Mode Africaine',
    businessHandle: 'mode-africaine',
    pack: 'bronze',
    points: bronze.rewardPerMission.view,
    dailyLimit: AD_DAILY_LIMITS.view,
    doneToday: 10,
    status: 'capped',
    to: paths.establishment('mode-africaine'),
  },
  {
    id: 'adm-demo-visit-2',
    type: 'visit',
    campaignId: 'ad-demo-2',
    campaignTitle: 'Offre de rentrée',
    businessName: 'Mode Africaine',
    businessHandle: 'mode-africaine',
    pack: 'bronze',
    points: bronze.rewardPerMission.visit,
    dailyLimit: AD_DAILY_LIMITS.visit,
    doneToday: 3,
    status: 'done',
    to: paths.establishment('mode-africaine'),
  },
]
