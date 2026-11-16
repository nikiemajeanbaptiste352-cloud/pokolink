import type {
  LearnCanalMemberPlan,
  LearnCanalMemberPlanId,
  LearnCanalPlan,
  LearnCanalPro,
} from '@/types/afrilearn-commerce'

/** Forfaits propriétaire : créer / renouveler un Canal Pro (config admin V1). */
export const LEARN_CANAL_PLANS: readonly LearnCanalPlan[] = [
  {
    id: 'starter',
    name: 'Starter',
    description: 'Lancer votre Canal Pro éducatif et publier vos premiers contenus.',
    price: 5_000,
    durationDays: 30,
    benefits: [
      '1 Canal Pro éducatif',
      'Jusqu’à 20 publications',
      'Vitrine publique',
      'Forfaits abonnés visiteurs',
      'Support standard',
    ],
  },
  {
    id: 'pro',
    name: 'Pro',
    description: 'Pour enseignants et créateurs qui vendent aussi des supports.',
    price: 15_000,
    durationDays: 90,
    benefits: [
      'Canal Pro illimité (publications)',
      'Forfaits abonnés personnalisables',
      'Mise en avant marché éducatif',
      'Statistiques de base',
      'Priorité support',
    ],
  },
  {
    id: 'campus',
    name: 'Campus',
    description: 'Établissements et collectifs éducatifs.',
    price: 45_000,
    durationDays: 365,
    benefits: [
      'Tout Pro',
      'Multi-animateurs (à venir)',
      'Rapports mensuels',
      'Accompagnement dédié',
    ],
  },
]

/** Forfait mis en avant sur la page des formules propriétaire. */
export const LEARN_CANAL_PLAN_FEATURED: LearnCanalPlan['id'] = 'pro'

/** Forfait visiteur proposé par défaut (bouton « S’abonner » → paiement). */
export const LEARN_CANAL_MEMBER_PLAN_DEFAULT: LearnCanalMemberPlanId = 'trimestriel'

/**
 * Forfaits d’abonnement des visiteurs à un Canal Pro publié.
 * Le propriétaire peut activer / ajuster les prix dans la gestion du canal.
 */
export const LEARN_CANAL_MEMBER_PLANS: readonly LearnCanalMemberPlan[] = [
  {
    id: 'mensuel',
    name: 'Mensuel',
    description: 'Accès au contenu du canal pendant 30 jours.',
    defaultPrice: 1_500,
    durationDays: 30,
    benefits: [
      'Accès aux publications du canal',
      'Ressources réservées aux abonnés',
      'Renouvelable à tout moment',
    ],
  },
  {
    id: 'trimestriel',
    name: 'Trimestriel',
    description: '3 mois d’accès — tarif avantageux.',
    defaultPrice: 3_500,
    durationDays: 90,
    benefits: [
      'Tout Mensuel',
      'Économie vs 3 mois séparés',
      'Idéal pour un trimestre scolaire',
    ],
  },
  {
    id: 'annuel',
    name: 'Annuel',
    description: 'Une année complète sur le Canal Pro.',
    defaultPrice: 10_000,
    durationDays: 365,
    benefits: [
      'Tout Trimestriel',
      'Meilleur prix à l’année',
      'Suivi pédagogique continu',
    ],
  },
]

export function getLearnCanalPlan(id: string | undefined): LearnCanalPlan | undefined {
  if (!id) return undefined
  return LEARN_CANAL_PLANS.find((p) => p.id === id)
}

export function getLearnCanalMemberPlan(
  id: string | undefined,
): LearnCanalMemberPlan | undefined {
  if (!id) return undefined
  return LEARN_CANAL_MEMBER_PLANS.find((p) => p.id === id)
}

export function memberPlanPrice(
  canal: Pick<LearnCanalPro, 'memberPlanPrices'>,
  planId: LearnCanalMemberPlanId,
): number {
  const override = canal.memberPlanPrices?.[planId]
  if (typeof override === 'number' && override >= 0) return Math.floor(override)
  return getLearnCanalMemberPlan(planId)?.defaultPrice ?? 0
}

export function formatPlanDuration(days: number): string {
  if (days % 365 === 0) {
    const y = days / 365
    return y === 1 ? '1 an' : `${y} ans`
  }
  if (days % 30 === 0) {
    const m = days / 30
    return m === 1 ? '1 mois' : `${m} mois`
  }
  return `${days} jours`
}
