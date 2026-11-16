/**
 * Creator Studio — forfaits publicitaires, commandes et devis (espace privé).
 * Données fournies / confirmées côté serveur ; le frontend stocke une démo locale.
 */

export type StudioAdPlanStatus = 'draft' | 'published' | 'disabled'

export type StudioAdPlatform =
  | 'tiktok'
  | 'instagram'
  | 'youtube'
  | 'facebook'
  | 'whatsapp'
  | 'other'

export type StudioAdOrderStatus =
  | 'pending'
  | 'accepted'
  | 'refused'
  | 'needs_info'
  | 'in_progress'
  | 'completed'
  | 'cancelled'

export type StudioAdRequestKind = 'order' | 'quote'

/** Stats d’un réseau social renseignées sur le forfait (affichées en public). */
export interface StudioAdSocialStat {
  platform: StudioAdPlatform
  /** Identifiant ou nom du compte, ex. @awa.cuisine. */
  handle: string
  followers: number
  /** Taux d’engagement (0–1), ex. 0.045 = 4,5 %. */
  engagementRate: number
  avgViews: number
}

/** Forfait publicitaire proposé par le créateur. */
export interface StudioAdPlan {
  id: string
  name: string
  description: string
  imageSrc?: string
  platforms: readonly StudioAdPlatform[]
  /** Stats des plateformes du forfait (page publique). */
  socialStats: readonly StudioAdSocialStat[]
  /** Prestations incluses. */
  inclusions: readonly string[]
  /** Prix FCFA (obligatoire pour Commander). */
  price: number | null
  /** Délais et conditions (texte libre). */
  conditions: string
  /** Délai indicatif, ex. « 5–7 jours ». */
  turnaround: string
  status: StudioAdPlanStatus
  createdAt: number
  updatedAt: number
}

/** Commande ou demande de devis reçue d’un annonceur. */
export interface StudioAdOrder {
  id: string
  number: string
  kind: StudioAdRequestKind
  planId: string
  planName: string
  advertiserName: string
  advertiserHandle?: string
  /** Prix accepté (FCFA) ; null si devis en cours. */
  acceptedPrice: number | null
  orderedAt: number
  /** Date souhaitée de réalisation (ms). */
  desiredAt?: number
  campaignBrief: string
  status: StudioAdOrderStatus
  /** Motif de refus ou note d’avancement. */
  note?: string
  updatedAt: number
}

/** Agrégats stats pub (fournis / préparés pour l’UI démo). */
export interface StudioAdStatsSnapshot {
  planViews: number
  uniqueInterests: number
  quoteRequests: number
  ordersReceived: number
  ordersAccepted: number
  ordersCompleted: number
  ordersCancelledOrRefused: number
  revenue: number
  averageOrderValue: number
  conversionRate: number
  /** Séries pour graphiques (du plus ancien au plus récent). */
  ordersSeries: readonly { label: string; value: number }[]
  revenueSeries: readonly { label: string; value: number }[]
  revenueByPlan: readonly { label: string; value: number }[]
  ordersByPlan: readonly { label: string; value: number }[]
  statusBreakdown: readonly { label: string; value: number }[]
  funnel: readonly { label: string; value: number }[]
}
