/**
 * STOCKAGE TEMPORAIRE des campagnes publicitaires créées depuis cet appareil.
 *
 * Démo frontend : après paiement Wallet, la campagne passe en « active » et est
 * injectée dans les canaux choisis (Accueil, Explorer, publications). Le serveur
 * confirmera paiement, validation, diffusion et résultats en production.
 */
import { DEFAULT_AD_CHANNELS } from '@/lib/ad-packs'
import { createId } from '@/lib/ids'
import type {
  AdCampaign,
  AdCampaignStatus,
  AdChannel,
  AdCta,
  AdPackId,
  AdTargetKind,
} from '@/types/ads'

const STORAGE_KEY = 'africonnect.ad-campaigns.v2'
const MAX_CAMPAIGNS = 30

type Listener = () => void

let campaigns: readonly AdCampaign[] | null = null
const listeners = new Set<Listener>()

const STATUSES: readonly AdCampaignStatus[] = [
  'pending_payment',
  'in_review',
  'active',
  'finished',
  'refused',
]
const PACKS: readonly AdPackId[] = ['bronze', 'silver', 'gold']
const TARGETS: readonly AdTargetKind[] = ['establishment', 'item', 'promotion']
const CTAS: readonly AdCta[] = ['discover', 'visit', 'order', 'book', 'follow']
const CHANNELS: readonly AdChannel[] = ['home', 'explore', 'publications']

function isChannel(value: unknown): value is AdChannel {
  return typeof value === 'string' && (CHANNELS as readonly string[]).includes(value)
}

function isCampaign(value: unknown): value is AdCampaign {
  if (typeof value !== 'object' || value === null) return false
  const item = value as Partial<AdCampaign>
  return (
    typeof item.id === 'string' &&
    typeof item.reference === 'string' &&
    typeof item.serviceId === 'string' &&
    typeof item.title === 'string' &&
    typeof item.text === 'string' &&
    typeof item.image === 'string' &&
    typeof item.createdAt === 'number' &&
    item.pack !== undefined &&
    PACKS.includes(item.pack) &&
    item.target !== undefined &&
    TARGETS.includes(item.target) &&
    item.cta !== undefined &&
    CTAS.includes(item.cta) &&
    item.status !== undefined &&
    STATUSES.includes(item.status) &&
    typeof item.results === 'object' &&
    item.results !== null
  )
}

function normalize(campaign: AdCampaign): AdCampaign {
  const channels =
    Array.isArray(campaign.channels) && campaign.channels.length > 0
      ? campaign.channels.filter(isChannel)
      : [...DEFAULT_AD_CHANNELS]
  return {
    ...campaign,
    channels: channels.length > 0 ? channels : [...DEFAULT_AD_CHANNELS],
  }
}

function persist(next: readonly AdCampaign[]) {
  campaigns = next
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  } catch {
    // Quota dépassé (image volumineuse) : la campagne reste en mémoire.
  }
  listeners.forEach((listener) => listener())
}

/** Campagnes créées sur cet appareil, de la plus récente à la plus ancienne. */
export function getStoredCampaigns(): readonly AdCampaign[] {
  if (campaigns) return campaigns
  let loaded: AdCampaign[] = []
  try {
    const parsed: unknown = JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? 'null')
    if (Array.isArray(parsed)) loaded = parsed.filter(isCampaign).map(normalize)
  } catch {
    // Données illisibles : aucune campagne enregistrée.
  }
  campaigns = loaded
  return campaigns
}

/** Toutes les campagnes actives (locales) diffusées sur un canal. */
export function getActiveCampaignsForChannel(channel: AdChannel): readonly AdCampaign[] {
  return getStoredCampaigns().filter(
    (campaign) =>
      campaign.status === 'active' && campaign.channels.includes(channel),
  )
}

export function subscribeCampaigns(listener: Listener): () => void {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

export type NewAdCampaign = Pick<
  AdCampaign,
  'serviceId' | 'pack' | 'target' | 'title' | 'text' | 'cta' | 'image' | 'channels'
> &
  Partial<Pick<AdCampaign, 'itemId' | 'itemName'>>

/**
 * Enregistre une campagne après paiement Wallet (démo) : statut « active » pour
 * qu’elle apparaisse immédiatement sur les canaux choisis.
 */
export function addCampaign(campaign: NewAdCampaign, now: number): AdCampaign {
  const digits = Array.from(
    crypto.getRandomValues(new Uint8Array(6)),
    (byte) => byte % 10,
  ).join('')
  const channels =
    campaign.channels.length > 0 ? [...campaign.channels] : [...DEFAULT_AD_CHANNELS]
  const created: AdCampaign = {
    ...campaign,
    channels,
    id: createId(),
    reference: `PUB-${new Date(now).getFullYear()}-${digits}`,
    // Démo : paiement Wallet déjà confirmé localement → diffusion immédiate.
    status: 'active',
    createdAt: now,
    results: { views: 0, visits: 0, subscribers: 0 },
    local: true,
  }
  persist([created, ...getStoredCampaigns()].slice(0, MAX_CAMPAIGNS))
  return created
}
