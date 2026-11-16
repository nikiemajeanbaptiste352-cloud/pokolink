/**
 * Statistiques publiques des réseaux sociaux d’un créateur (démo locale).
 * À remplacer par l’API lorsque les comptes liés seront disponibles.
 */
import type { StudioAdPlatform } from '@/types/studio-ads'

export interface CreatorSocialStat {
  platform: StudioAdPlatform
  handle: string
  followers: number
  /** Taux d’engagement moyen (0–1). */
  engagementRate: number
  avgViews: number
}

const DEFAULTS: readonly CreatorSocialStat[] = [
  {
    platform: 'tiktok',
    handle: '@createur',
    followers: 42_000,
    engagementRate: 0.068,
    avgViews: 18_500,
  },
  {
    platform: 'instagram',
    handle: '@createur',
    followers: 28_400,
    engagementRate: 0.041,
    avgViews: 9_200,
  },
  {
    platform: 'youtube',
    handle: '@createur',
    followers: 12_100,
    engagementRate: 0.055,
    avgViews: 24_000,
  },
  {
    platform: 'facebook',
    handle: 'Créateur AfriConnect',
    followers: 19_800,
    engagementRate: 0.032,
    avgViews: 6_400,
  },
  {
    platform: 'whatsapp',
    handle: 'Canal diffusé',
    followers: 3_200,
    engagementRate: 0.12,
    avgViews: 2_800,
  },
]

/** Variantes démo par @identifiant créateur. */
const BY_HANDLE: Record<string, readonly CreatorSocialStat[]> = {
  'awa.cuisine': [
    {
      platform: 'tiktok',
      handle: '@awa.cuisine',
      followers: 86_200,
      engagementRate: 0.074,
      avgViews: 32_000,
    },
    {
      platform: 'instagram',
      handle: '@awa.cuisine',
      followers: 54_100,
      engagementRate: 0.048,
      avgViews: 14_200,
    },
    {
      platform: 'youtube',
      handle: '@AwaCuisine',
      followers: 21_400,
      engagementRate: 0.061,
      avgViews: 41_000,
    },
    {
      platform: 'facebook',
      handle: 'Awa Cuisine',
      followers: 33_500,
      engagementRate: 0.029,
      avgViews: 8_100,
    },
    {
      platform: 'whatsapp',
      handle: 'Recettes Awa',
      followers: 5_800,
      engagementRate: 0.14,
      avgViews: 4_200,
    },
  ],
  'moussa.tech': [
    {
      platform: 'tiktok',
      handle: '@moussa.tech',
      followers: 61_000,
      engagementRate: 0.081,
      avgViews: 27_500,
    },
    {
      platform: 'instagram',
      handle: '@moussa.tech',
      followers: 38_200,
      engagementRate: 0.039,
      avgViews: 11_000,
    },
    {
      platform: 'youtube',
      handle: '@MoussaTech',
      followers: 48_900,
      engagementRate: 0.058,
      avgViews: 55_000,
    },
    {
      platform: 'facebook',
      handle: 'Moussa Tech',
      followers: 22_100,
      engagementRate: 0.027,
      avgViews: 7_200,
    },
  ],
  'amadou.ba': [
    {
      platform: 'tiktok',
      handle: '@amadou.ba',
      followers: 19_400,
      engagementRate: 0.062,
      avgViews: 8_800,
    },
    {
      platform: 'instagram',
      handle: '@amadou.ba',
      followers: 14_200,
      engagementRate: 0.045,
      avgViews: 5_100,
    },
    {
      platform: 'youtube',
      handle: '@AmadouBa',
      followers: 7_600,
      engagementRate: 0.052,
      avgViews: 12_400,
    },
    {
      platform: 'whatsapp',
      handle: 'Amadou · actus',
      followers: 1_900,
      engagementRate: 0.11,
      avgViews: 1_400,
    },
  ],
}

function withHandle(
  rows: readonly CreatorSocialStat[],
  handle: string,
): CreatorSocialStat[] {
  return rows.map((row) =>
    row.handle.startsWith('@')
      ? { ...row, handle: `@${handle}` }
      : row,
  )
}

/** Stats réseaux pour la page publique / fiche forfait. */
export function getCreatorSocialStats(
  handle: string,
): readonly CreatorSocialStat[] {
  const key = handle.replace(/^@/, '')
  const own = BY_HANDLE[key]
  if (own) return own
  return withHandle(DEFAULTS, key)
}

/** Canal de contact affiché au clic sur Contacter. */
export interface CreatorContactChannel {
  id: string
  label: string
  /** Numéro affiché. */
  display: string
  /** Lien `tel:` ou `https://wa.me/…`. */
  href: string
  kind: 'phone' | 'whatsapp'
}

const CONTACT_BY_HANDLE: Record<string, readonly CreatorContactChannel[]> = {
  'awa.cuisine': [
    {
      id: 'phone',
      label: 'Téléphone',
      display: '+226 70 12 34 56',
      href: 'tel:+22670123456',
      kind: 'phone',
    },
    {
      id: 'whatsapp',
      label: 'WhatsApp',
      display: '+226 70 12 34 56',
      href: 'https://wa.me/22670123456',
      kind: 'whatsapp',
    },
  ],
  'moussa.tech': [
    {
      id: 'phone',
      label: 'Téléphone',
      display: '+226 76 98 76 54',
      href: 'tel:+22676987654',
      kind: 'phone',
    },
    {
      id: 'whatsapp',
      label: 'WhatsApp',
      display: '+226 76 98 76 54',
      href: 'https://wa.me/22676987654',
      kind: 'whatsapp',
    },
  ],
  'amadou.ba': [
    {
      id: 'phone',
      label: 'Téléphone',
      display: '+221 77 123 45 67',
      href: 'tel:+221771234567',
      kind: 'phone',
    },
    {
      id: 'whatsapp',
      label: 'WhatsApp',
      display: '+221 77 123 45 67',
      href: 'https://wa.me/221771234567',
      kind: 'whatsapp',
    },
  ],
}

/** Numéros / WhatsApp du créateur (démo) pour la feuille Contacter. */
export function getCreatorContactChannels(
  handle: string,
): readonly CreatorContactChannel[] {
  const key = handle.replace(/^@/, '')
  return (
    CONTACT_BY_HANDLE[key] ?? [
      {
        id: 'phone',
        label: 'Téléphone',
        display: '+221 70 000 00 00',
        href: 'tel:+221700000000',
        kind: 'phone',
      },
      {
        id: 'whatsapp',
        label: 'WhatsApp',
        display: '+221 70 000 00 00',
        href: 'https://wa.me/221700000000',
        kind: 'whatsapp',
      },
    ]
  )
}

/** Met en avant les plateformes du forfait, puis le reste. */
export function orderSocialStatsForPlan(
  stats: readonly CreatorSocialStat[],
  planPlatforms: readonly StudioAdPlatform[],
): readonly CreatorSocialStat[] {
  const priority = new Set(planPlatforms)
  return [...stats].sort((a, b) => {
    const ap = priority.has(a.platform) ? 0 : 1
    const bp = priority.has(b.platform) ? 0 : 1
    return ap - bp
  })
}
