import {
  ArrowLeftRight,
  Gift,
  History,
  ShoppingBag,
  Sparkles,
  Store,
  type LucideIcon,
} from 'lucide-react'

import { Link } from 'react-router-dom'

import { BackLink } from '@/components/common/BackLink'
import { PageHeader } from '@/components/common/PageHeader'
import { SectionDivider } from '@/components/common/SectionDivider'
import { SectionHeader } from '@/components/common/SectionHeader'
import { RewardsBalanceCard } from '@/components/rewards/RewardsBalanceCard'
import { RewardsOperationRow } from '@/components/rewards/RewardsOperationRow'
import { useRewardsBalances, useRewardsOperations } from '@/hooks/use-rewards'
import { toneSoft, type Tone } from '@/lib/tones'
import { cn } from '@/lib/utils'
import { paths } from '@/routes/paths'

interface QuickAction {
  id: string
  label: string
  icon: LucideIcon
  tone: Tone
  to: string
}

/** Les quatre parcours du module. */
const QUICK_ACTIONS: readonly QuickAction[] = [
  { id: 'earn', label: 'Gagner', icon: Sparkles, tone: 'gold', to: paths.rewardsEarn },
  {
    id: 'transfer',
    label: 'Transférer',
    icon: ArrowLeftRight,
    tone: 'violet',
    to: paths.rewardsTransfer,
  },
  { id: 'use', label: 'Utiliser', icon: ShoppingBag, tone: 'info', to: paths.rewardsUse },
  {
    id: 'history',
    label: 'Historique',
    icon: History,
    tone: 'neutral',
    to: paths.rewardsHistory,
  },
]

const RECENT_COUNT = 4

const RULES = [
  'Les points ne se retirent pas en FCFA et ne se convertissent pas en Mobile Money.',
  'Vous pourrez transférer vos points à un autre utilisateur AfriConnect.',
  'Vous pourrez acheter des produits éligibles avec vos points, en totalité ou avec un complément en FCFA.',
  'Le solde affiché est celui du serveur : il se met à jour après chaque opération confirmée.',
] as const

/**
 * Rewards : l'écran central des points de fidélité. Il présente le solde, les parcours
 * (Gagner, Transférer, Utiliser, Historique) et l'activité récente. Il est atteint depuis
 * Profil : Rewards n'est pas un onglet de la navigation principale.
 *
 * Aucune opération n'est exécutée par le frontend : le serveur décide de chaque gain,
 * dépense et transfert. Un transfert n'est qu'une demande « en attente ».
 */
export function RewardsPage() {
  const balances = useRewardsBalances()
  const operations = useRewardsOperations()
  const recent = operations.slice(0, RECENT_COUNT)

  return (
    <>
      <PageHeader
        title="Rewards"
        leading={<BackLink to={paths.profile} label="Profil" history />}
      />

      <div className="space-y-4 py-4">
        <RewardsBalanceCard balances={balances} />
      </div>
      <SectionDivider />

      <section aria-labelledby="actions-title" className="space-y-3 py-4">
        <SectionHeader
          title={<span id="actions-title">Actions rapides</span>}
          description="Gagner, transférer, utiliser, historique"
        />
        <ul className="grid grid-cols-4 gap-2 px-4">
          {QUICK_ACTIONS.map(({ id, label, icon: Icon, tone, to }) => (
            <li key={id}>
              <Link
                to={to}
                className="flex h-20 w-full flex-col items-center justify-center gap-1.5 rounded-xl border bg-card px-1 text-caption font-semibold hover:bg-muted"
              >
                <span
                  className={cn(
                    'grid size-9 place-items-center rounded-full',
                    toneSoft[tone],
                  )}
                >
                  <Icon className="size-5" aria-hidden="true" />
                </span>
                {label}
              </Link>
            </li>
          ))}
        </ul>
      </section>
      <SectionDivider />

      <section aria-labelledby="activity-title" className="space-y-1 py-4">
        <SectionHeader
          title={<span id="activity-title">Activité récente</span>}
          description="Gains, dépenses et transferts"
        />
        <ul className="divide-y">
          {recent.map((operation) => (
            <li key={operation.id}>
              <RewardsOperationRow operation={operation} />
            </li>
          ))}
        </ul>
        <p className="px-4 pt-2 text-caption text-muted-foreground">
          <Link to={paths.rewardsHistory} className="font-bold text-brand">
            Voir tout l’historique
          </Link>
        </p>
      </section>
      <SectionDivider />

      <section aria-labelledby="programs-title" className="space-y-3 py-4">
        <SectionHeader
          title={<span id="programs-title">Programmes et avantages</span>}
          description="Vouchers et programmes de fidélité des professionnels"
        />
        <div className="mx-4 flex items-start gap-3 rounded-xl border bg-card p-4 shadow-card">
          <span
            className={cn(
              'grid size-11 shrink-0 place-items-center rounded-xl',
              toneSoft.gold,
            )}
          >
            <Store className="size-5" aria-hidden="true" />
          </span>
          <p className="text-body text-muted-foreground">
            Les vouchers et les programmes propres aux professionnels seront présentés
            ici. Aucun n’est encore disponible.
          </p>
        </div>
      </section>
      <SectionDivider />

      <section aria-labelledby="rules-title" className="space-y-3 py-4 pb-8">
        <SectionHeader
          title={<span id="rules-title">À savoir</span>}
          description="Comment fonctionnent les points"
        />
        <ul className="mx-4 space-y-2">
          {RULES.map((rule) => (
            <li key={rule} className="flex items-start gap-2.5 text-body">
              <Gift className="mt-0.5 size-4 shrink-0 text-gold" aria-hidden="true" />
              {rule}
            </li>
          ))}
        </ul>
      </section>
    </>
  )
}
