import { Check, Radio } from 'lucide-react'
import { Link } from 'react-router-dom'

import { BackLink } from '@/components/common/BackLink'
import { PageHeader } from '@/components/common/PageHeader'
import { buttonVariants } from '@/components/ui/button'
import { useOwnerCanalSubscription } from '@/hooks/use-afrilearn-commerce'
import { useProfile } from '@/hooks/use-profile'
import { canManageCanal } from '@/lib/afrilearn-commerce-store'
import { formatPrice } from '@/lib/format'
import {
  formatPlanDuration,
  LEARN_CANAL_PLAN_FEATURED,
  LEARN_CANAL_PLANS,
} from '@/lib/afrilearn-plans'
import { cn } from '@/lib/utils'
import { paths } from '@/routes/paths'

/** Formules d’abonnement propriétaire Canal Pro éducatif. */
export function LearnCanalPlansPage() {
  const profile = useProfile()
  const sub = useOwnerCanalSubscription(profile.handle)
  const active = canManageCanal(profile.handle)

  return (
    <>
      <PageHeader
        title="Créer mon Canal Pro"
        leading={<BackLink to={paths.learnMine} label="Mon AfriLearn" history />}
      />
      <div className="space-y-4 px-4 pb-10">
        <p className="text-body text-muted-foreground">
          Choisissez une formule propriétaire, payez avec votre Wallet AfriConnect,
          puis activez les forfaits d’abonnement pour vos visiteurs.
        </p>

        {active && sub ? (
          <div className="rounded-2xl border border-brand/30 bg-brand/5 p-3.5">
            <p className="text-[13px] font-bold text-brand">
              Abonnement actif · {sub.planName}
            </p>
            <Link
              to={paths.learnCanalManage}
              className={cn(buttonVariants({ className: 'mt-2 w-full' }))}
            >
              Continuer vers mon canal
            </Link>
          </div>
        ) : null}

        <ul className="space-y-3">
          {LEARN_CANAL_PLANS.map((plan) => {
            const featured = plan.id === LEARN_CANAL_PLAN_FEATURED
            return (
              <li
                key={plan.id}
                className={cn(
                  'space-y-3 rounded-2xl border bg-card p-4 shadow-card',
                  featured && 'border-brand/40 ring-1 ring-brand/20',
                )}
              >
                <div className="flex items-start gap-3">
                  <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-info/15 text-info">
                    <Radio className="size-5" aria-hidden="true" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-title font-extrabold">{plan.name}</h2>
                      {featured ? (
                        <span className="rounded-md bg-brand/10 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-brand">
                          Recommandé
                        </span>
                      ) : null}
                    </div>
                    <p className="text-caption text-muted-foreground">
                      {plan.description}
                    </p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-title font-extrabold tabular-nums text-brand">
                      {formatPrice(plan.price)}
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      {formatPlanDuration(plan.durationDays)}
                    </p>
                  </div>
                </div>
                <ul className="space-y-1.5">
                  {plan.benefits.map((b) => (
                    <li key={b} className="flex items-start gap-2 text-caption">
                      <Check
                        className="mt-0.5 size-3.5 shrink-0 text-brand"
                        aria-hidden="true"
                      />
                      {b}
                    </li>
                  ))}
                </ul>
                <Link
                  to={paths.learnCanalPay(plan.id)}
                  className={buttonVariants({ className: 'w-full' })}
                >
                  Choisir · payer avec le Wallet
                </Link>
              </li>
            )
          })}
        </ul>
      </div>
    </>
  )
}
