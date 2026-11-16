import { AFRICONNECT_AFFILIATE_PLATFORM_RATE } from '@/lib/affiliate-labels'
import type {
  AffiliateMembership,
  AffiliateProgram,
  AffiliateVendorStats,
} from '@/types/affiliate'

const day = 86_400_000
const now = Date.now()

/** Programmes démo — rattachés aux services d’exemple si présents. */
export const TEMP_AFFILIATE_PROGRAMS: readonly AffiliateProgram[] = []

export const TEMP_AFFILIATE_MEMBERSHIPS: readonly AffiliateMembership[] = []

export function buildEmptyVendorStats(): AffiliateVendorStats {
  return {
    activeAffiliates: 0,
    clicks: 0,
    customers: 0,
    orders: 0,
    confirmedPayments: 0,
    salesAmount: 0,
    affiliateCommissions: 0,
    platformCommissions: 0,
    vendorNet: 0,
    clicksSeries: [
      { label: 'S1', value: 0 },
      { label: 'S2', value: 0 },
      { label: 'S3', value: 0 },
      { label: 'S4', value: 0 },
    ],
    ordersSeries: [
      { label: 'S1', value: 0 },
      { label: 'S2', value: 0 },
      { label: 'S3', value: 0 },
      { label: 'S4', value: 0 },
    ],
    salesSeries: [
      { label: 'S1', value: 0 },
      { label: 'S2', value: 0 },
      { label: 'S3', value: 0 },
      { label: 'S4', value: 0 },
    ],
    commissionsSeries: [
      { label: 'S1', value: 0 },
      { label: 'S2', value: 0 },
      { label: 'S3', value: 0 },
      { label: 'S4', value: 0 },
    ],
  }
}

/** Stats démo à partir des memberships d’un programme. */
export function buildVendorStatsFromMembers(
  members: readonly AffiliateMembership[],
): AffiliateVendorStats {
  if (members.length === 0) return buildEmptyVendorStats()
  const active = members.filter((m) => m.status === 'active')
  const clicks = members.reduce((s, m) => s + m.clicks, 0)
  const customers = members.reduce((s, m) => s + m.customers, 0)
  const orders = members.reduce((s, m) => s + m.orders, 0)
  const sales = members.reduce((s, m) => s + m.salesAmount, 0)
  const affiliateCommissions = members.reduce((s, m) => s + m.commissionsAmount, 0)
  const platformCommissions = Math.round(sales * AFRICONNECT_AFFILIATE_PLATFORM_RATE)
  const vendorNet = Math.max(0, sales - affiliateCommissions - platformCommissions)
  return {
    activeAffiliates: active.length,
    clicks,
    customers,
    orders,
    confirmedPayments: orders,
    salesAmount: sales,
    affiliateCommissions,
    platformCommissions,
    vendorNet,
    clicksSeries: [
      { label: 'S1', value: Math.round(clicks * 0.15) },
      { label: 'S2', value: Math.round(clicks * 0.25) },
      { label: 'S3', value: Math.round(clicks * 0.28) },
      { label: 'S4', value: Math.round(clicks * 0.32) },
    ],
    ordersSeries: [
      { label: 'S1', value: Math.max(0, orders - 3) },
      { label: 'S2', value: Math.max(0, orders - 2) },
      { label: 'S3', value: Math.max(0, orders - 1) },
      { label: 'S4', value: orders },
    ],
    salesSeries: [
      { label: 'S1', value: Math.round(sales * 0.18) },
      { label: 'S2', value: Math.round(sales * 0.24) },
      { label: 'S3', value: Math.round(sales * 0.28) },
      { label: 'S4', value: Math.round(sales * 0.3) },
    ],
    commissionsSeries: [
      { label: 'S1', value: Math.round(affiliateCommissions * 0.18) },
      { label: 'S2', value: Math.round(affiliateCommissions * 0.24) },
      { label: 'S3', value: Math.round(affiliateCommissions * 0.28) },
      { label: 'S4', value: Math.round(affiliateCommissions * 0.3) },
    ],
  }
}

/** Seed d’exemple pour un service (appelé à la première ouverture si vide). */
export function createDemoProgramForService(
  serviceId: string,
  nowMs = now,
): AffiliateProgram {
  return {
    id: `afp-demo-${serviceId}`,
    serviceId,
    name: 'Ambassadeurs boutique',
    description:
      'Recommandez notre établissement et gagnez une commission sur chaque paiement commercial attribué à votre lien.',
    collaboration:
      'Partagez le lien vers notre page publique : catalogue, services et réservations.',
    objective: 'Augmenter les ventes via des recommandations de confiance.',
    targetKind: 'service',
    affiliateRate: 0.1,
    platformRate: AFRICONNECT_AFFILIATE_PLATFORM_RATE,
    commissionBase:
      'Montant commercial réellement encaissé, après réductions, hors frais exclus.',
    excludedFees: 'Livraison et taxes lorsqu’elles sont facturées séparément.',
    audience: 'both',
    specialConditions: 'Un seul partenariat par utilisateur. Respect de l’image de marque.',
    promotionRules:
      'Promotion honnête, sans spam. Attribution 30 jours, dernier clic valide.',
    fraudRules:
      'Auto-achats et fraudes interdits. Le vendeur peut suspendre le partenariat.',
    startsAt: nowMs - 14 * day,
    status: 'published',
    showParticipantCount: true,
    createdAt: nowMs - 20 * day,
    updatedAt: nowMs - 2 * day,
  }
}

export function createDemoMemberships(
  program: AffiliateProgram,
  nowMs = now,
): AffiliateMembership[] {
  return [
    {
      id: `afm-1-${program.serviceId}`,
      programId: program.id,
      serviceId: program.serviceId,
      affiliateHandle: 'awa.cuisine',
      affiliateName: 'Awa Cuisine',
      refCode: 'AFF-AWA01',
      status: 'active',
      joinedAt: nowMs - 12 * day,
      clicks: 186,
      customers: 24,
      orders: 18,
      salesAmount: 420_000,
      commissionsAmount: 42_000,
      updatedAt: nowMs - 1 * day,
    },
    {
      id: `afm-2-${program.serviceId}`,
      programId: program.id,
      serviceId: program.serviceId,
      affiliateHandle: 'moussa.tech',
      affiliateName: 'Moussa Tech',
      refCode: 'AFF-MOU02',
      status: 'active',
      joinedAt: nowMs - 8 * day,
      clicks: 94,
      customers: 11,
      orders: 7,
      salesAmount: 155_000,
      commissionsAmount: 15_500,
      updatedAt: nowMs - 2 * day,
    },
  ]
}
