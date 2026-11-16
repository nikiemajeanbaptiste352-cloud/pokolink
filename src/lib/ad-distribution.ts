/**
 * Pont publicité → canaux de diffusion (Accueil, Explorer, publications) + missions Rewards.
 * Démo frontend : lit les campagnes actives locales ; le serveur décidera en production.
 */
import {
  AD_CTA_LABEL,
  AD_DAILY_LIMITS,
  getAdPack,
} from '@/lib/ad-packs'
import { getActiveCampaignsForChannel, getStoredCampaigns } from '@/lib/ad-campaigns-store'
import { DEMO_PROS, findDemoPro, type DemoPro } from '@/lib/directory'
import { PLACEHOLDER_AD_MISSIONS } from '@/lib/placeholder-ad-missions'
import { getPlaceholderCampaigns } from '@/lib/placeholder-ads'
import { loadServicesState } from '@/lib/services-storage'
import { paths } from '@/routes/paths'
import type { AdCampaign } from '@/types/ads'
import type { RewardsAdMission } from '@/types/ad-missions'
import type { FeedItem } from '@/types/feed'
import type { ChannelPost } from '@/types/pro'

/** Résout un établissement pour afficher une campagne (démo ou service local). */
export function resolveCampaignPro(campaign: AdCampaign): DemoPro | undefined {
  const fromDemo = findDemoPro(campaign.serviceId)
  if (fromDemo) return fromDemo
  try {
    const local = loadServicesState().services.find((s) => s.id === campaign.serviceId)
    if (!local) return undefined
    return {
      service: local,
      items: [],
      extras: {
        channel: {
          name: local.name,
          description: '',
          avatar: local.logo ?? '',
          mode: 'broadcast',
          visibility: 'public',
          access: 'free',
          notifications: true,
          state: 'active',
        },
        posts: [],
        members: [],
        reviews: [],
        plans: [],
        events: [],
        subscribers: [],
        planClients: [],
      },
      tagline: local.description ?? '',
      verified: false,
      followers: 0,
      rating: 0,
      reviewCount: 0,
      highlights: [],
    }
  } catch {
    return undefined
  }
}

/** Cartes fil « Sponsorisé » pour Accueil ou Explorer. */
export function buildSponsoredFeedItems(channel: 'home' | 'explore'): FeedItem[] {
  const items: FeedItem[] = []
  const seen = new Set<string>()

  for (const campaign of getActiveCampaignsForChannel(channel)) {
    const pro = resolveCampaignPro(campaign)
    if (!pro || seen.has(campaign.id)) continue
    seen.add(campaign.id)
    items.push({ kind: 'ad', id: `ad:${campaign.id}`, campaign, pro })
  }

  // Exemple : première campagne active du premier établissement démo.
  const demoPro = DEMO_PROS[0]
  if (demoPro) {
    const demo = getPlaceholderCampaigns(demoPro.service.id).find(
      (c) => c.status === 'active',
    )
    if (demo && !seen.has(demo.id)) {
      items.push({
        kind: 'ad',
        id: `ad:${demo.id}`,
        campaign: {
          ...demo,
          channels: ['home', 'explore', 'publications'],
        },
        pro: demoPro,
      })
    }
  }

  return items
}

/** Publications sponsorisées injectées dans le canal public d’un établissement. */
export function getSponsoredPublications(serviceId: string): ChannelPost[] {
  return getStoredCampaigns()
    .filter(
      (campaign) =>
        campaign.serviceId === serviceId &&
        campaign.status === 'active' &&
        campaign.channels.includes('publications'),
    )
    .map((campaign) => campaignToChannelPost(campaign))
}

export function campaignToChannelPost(campaign: AdCampaign): ChannelPost {
  const iso = new Date(campaign.createdAt).toISOString()
  return {
    id: `sponsored-${campaign.id}`,
    type: campaign.target === 'promotion' ? 'promotion' : 'announcement',
    title: campaign.title,
    description: campaign.text,
    media: campaign.image
      ? [{ kind: 'image', name: 'annonce', src: campaign.image }]
      : [],
    itemId: campaign.itemId ?? '',
    promoPrice: null,
    status: 'published',
    publishedAt: iso,
    createdAt: iso,
    views: campaign.results.views,
    reactions: 0,
    sponsored: true,
    campaignId: campaign.id,
  }
}

/** Missions Rewards dérivées des campagnes actives locales + exemples. */
export function getRewardsAdMissions(): readonly RewardsAdMission[] {
  const fromLocal: RewardsAdMission[] = []
  for (const campaign of getStoredCampaigns()) {
    if (campaign.status !== 'active') continue
    const pack = getAdPack(campaign.pack)
    const pro = resolveCampaignPro(campaign)
    const handle = pro?.service.username || campaign.serviceId
    const name = pro?.service.name ?? 'Votre établissement'
    const base = {
      campaignId: campaign.id,
      campaignTitle: campaign.title,
      businessName: name,
      businessHandle: handle,
      pack: campaign.pack,
    }
    fromLocal.push(
      {
        id: `adm-local-view-${campaign.id}`,
        type: 'view',
        ...base,
        points: pack.rewardPerMission.view,
        dailyLimit: AD_DAILY_LIMITS.view,
        doneToday: 0,
        status: 'available',
        to: paths.establishment(handle),
      },
      {
        id: `adm-local-visit-${campaign.id}`,
        type: 'visit',
        ...base,
        points: pack.rewardPerMission.visit,
        dailyLimit: AD_DAILY_LIMITS.visit,
        doneToday: 0,
        status: 'available',
        to: paths.establishment(handle),
      },
      {
        id: `adm-local-sub-${campaign.id}`,
        type: 'subscription',
        ...base,
        points: pack.rewardPerMission.subscription,
        dailyLimit: AD_DAILY_LIMITS.subscription,
        doneToday: 0,
        status: 'available',
        to: paths.establishmentPosts(handle),
      },
    )
  }
  const seen = new Set(fromLocal.map((m) => m.id))
  return [...fromLocal, ...PLACEHOLDER_AD_MISSIONS.filter((m) => !seen.has(m.id))]
}

export function adCtaLabel(campaign: AdCampaign): string {
  return AD_CTA_LABEL[campaign.cta]
}
