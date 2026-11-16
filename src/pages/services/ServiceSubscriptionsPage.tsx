import { Crown, Plus, Users } from 'lucide-react'
import { useState } from 'react'

import { Avatar } from '@/components/common/Avatar'
import { EmptyState } from '@/components/common/EmptyState'
import { FilterChips } from '@/components/common/FilterChips'
import { PlanCard, PlanFormSheet } from '@/components/pro/plans/PlanParts'
import {
  FlashMessage,
  StatTile,
  StatusPill,
} from '@/components/pro/shared'
import { RubriquePage } from '@/components/services/RubriquePage'
import { Button } from '@/components/ui/button'
import { useCurrentService } from '@/hooks/use-current-service'
import { useFlash } from '@/hooks/use-flash'
import { useNow } from '@/hooks/use-now'
import { useProExtras } from '@/hooks/use-pro-extras'
import { formatCount } from '@/lib/format'
import { formatDate, PLAN_DURATION_LABEL } from '@/lib/pro-labels'
import type { Plan, PlanStatus } from '@/types/pro'

type Tab = 'subscribers' | 'plans' | 'clients'

const TABS: readonly { id: Tab; label: string }[] = [
  { id: 'subscribers', label: 'Mes abonnés' },
  { id: 'plans', label: 'Mes forfaits' },
  { id: 'clients', label: 'Souscripteurs' },
]

const DAY = 24 * 60 * 60 * 1000

/** Abonnements : abonnés au service, forfaits commerciaux et clients ayant souscrit. */
export function ServiceSubscriptionsPage() {
  const service = useCurrentService()
  const { data, update } = useProExtras(service)
  const now = useNow(60_000)
  const { message, flash } = useFlash()
  const [tab, setTab] = useState<Tab>('subscribers')
  const [editor, setEditor] = useState<{ open: boolean; plan: Plan | null }>({
    open: false,
    plan: null,
  })

  const { subscribers, plans, planClients } = data
  const sortedSubscribers = [...subscribers].sort((a, b) =>
    b.subscribedAt.localeCompare(a.subscribedAt),
  )
  const newSubscribers = subscribers.filter(
    (s) => now - new Date(s.subscribedAt).getTime() <= 30 * DAY,
  ).length

  function savePlan(plan: Plan, published: boolean) {
    update((current) => {
      const exists = current.plans.some((candidate) => candidate.id === plan.id)
      return {
        ...current,
        plans: exists
          ? current.plans.map((candidate) =>
              candidate.id === plan.id ? plan : candidate,
            )
          : [plan, ...current.plans],
      }
    })
    setEditor({ open: false, plan: null })
    flash(published ? 'Forfait publié (démonstration).' : 'Forfait enregistré.')
  }

  function setStatus(plan: Plan, status: PlanStatus) {
    update((current) => ({
      ...current,
      plans: current.plans.map((candidate) =>
        candidate.id === plan.id ? { ...candidate, status } : candidate,
      ),
    }))
    flash(
      status === 'suspended'
        ? `« ${plan.name} » est suspendu : plus de nouvelle souscription.`
        : `« ${plan.name} » est actif.`,
    )
  }

  return (
    <RubriquePage
      toolId="subscriptions"
      subtitle={`Abonnés et forfaits · ${service.name}`}
      action={
        tab === 'plans' ? (
          <Button onClick={() => setEditor({ open: true, plan: null })}>
            <Plus aria-hidden="true" />
            Créer<span className="sr-only"> un forfait</span>
          </Button>
        ) : null
      }
    >
      <FlashMessage message={message} />

      <FilterChips
        label="Rubriques des abonnements"
        items={TABS}
        value={tab}
        onChange={setTab}
      />

      {tab === 'subscribers' ? (
        <section aria-label="Mes abonnés" className="space-y-3">
          <dl className="grid grid-cols-2 gap-3 px-4">
            <StatTile label="Abonnés" value={formatCount(subscribers.length)} />
            <StatTile label="Nouveaux (30 jours)" value={`+${newSubscribers}`} />
          </dl>
          {sortedSubscribers.length === 0 ? (
            <EmptyState
              icon={Users}
              title="Aucun abonné"
              description="Les personnes qui suivent votre établissement apparaîtront ici."
              className="py-8"
            />
          ) : (
            <ul className="divide-y border-y">
              {sortedSubscribers.map((subscriber) => (
                <li key={subscriber.id} className="flex items-center gap-3 px-4 py-3">
                  <Avatar name={subscriber.name} size="md" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-body font-bold">{subscriber.name}</p>
                    <p className="text-caption text-muted-foreground">
                      Abonné depuis le {formatDate(subscriber.subscribedAt)}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      ) : null}

      {tab === 'plans' ? (
        <section aria-label="Mes forfaits" className="space-y-3">
          {plans.length === 0 ? (
            <EmptyState
              icon={Crown}
              tone="gold"
              title="Aucun forfait"
              description="Créez un forfait (Essentiel, Premium, Entreprise…) pour vendre un abonnement à vos clients."
              action={
                <Button onClick={() => setEditor({ open: true, plan: null })}>
                  <Plus aria-hidden="true" />
                  Créer un forfait
                </Button>
              }
              className="py-8"
            />
          ) : (
            <ul className="space-y-5 px-4">
              {plans.map((plan) => (
                <li key={plan.id}>
                  <PlanCard
                    plan={plan}
                    subscribers={planClients.filter((c) => c.planId === plan.id).length}
                    onEdit={(item) => setEditor({ open: true, plan: item })}
                    onSetStatus={setStatus}
                  />
                </li>
              ))}
            </ul>
          )}
        </section>
      ) : null}

      {tab === 'clients' ? (
        <section aria-label="Souscripteurs" className="space-y-3">
          {planClients.length === 0 ? (
            <EmptyState
              icon={Users}
              title="Aucune souscription"
              description="Les clients qui souscrivent à un forfait apparaîtront ici."
              className="py-8"
            />
          ) : (
            <ul className="divide-y border-y">
              {planClients.map((client) => {
                const plan = plans.find((candidate) => candidate.id === client.planId)
                return (
                  <li key={client.id} className="flex items-center gap-3 px-4 py-3">
                    <Avatar name={client.name} size="md" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-body font-bold">{client.name}</p>
                      <p className="truncate text-caption text-muted-foreground">
                        {plan
                          ? `${plan.name} · ${PLAN_DURATION_LABEL[plan.duration]}`
                          : 'Forfait supprimé'}
                      </p>
                      <p className="text-caption text-muted-foreground">
                        Depuis le {formatDate(client.subscribedAt)}
                        {client.endsAt ? ` · jusqu’au ${formatDate(client.endsAt)}` : ''}
                      </p>
                    </div>
                    <StatusPill>
                      {client.status === 'active' ? 'Actif' : 'Expiré'}
                    </StatusPill>
                  </li>
                )
              })}
            </ul>
          )}
        </section>
      ) : null}

      <PlanFormSheet
        open={editor.open}
        plan={editor.plan}
        onClose={() => setEditor({ open: false, plan: null })}
        onSave={savePlan}
      />
    </RubriquePage>
  )
}
