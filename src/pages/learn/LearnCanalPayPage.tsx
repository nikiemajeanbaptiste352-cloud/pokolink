import { Radio, Wallet } from 'lucide-react'
import { useState } from 'react'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'

import { BackLink } from '@/components/common/BackLink'
import { EmptyState } from '@/components/common/EmptyState'
import { PageHeader } from '@/components/common/PageHeader'
import { buttonVariants } from '@/components/ui/button'
import { WalletPaymentForm } from '@/components/wallet/WalletPaymentForm'
import { useProfile } from '@/hooks/use-profile'
import { useWalletBalances } from '@/hooks/use-wallet'
import { formatPrice } from '@/lib/format'
import { formatPlanDuration, getLearnCanalPlan } from '@/lib/afrilearn-plans'
import { settleLearnCanalPayment } from '@/lib/afrilearn-wallet'
import { splitName } from '@/lib/payment-labels'
import { paths } from '@/routes/paths'

/** Paiement Wallet d’une formule Canal Pro → activation après confirmation. */
export function LearnCanalPayPage({
  forcedPlanId,
}: {
  forcedPlanId?: string
} = {}) {
  const { planId: paramPlanId } = useParams()
  const plan = getLearnCanalPlan(forcedPlanId ?? paramPlanId)
  const profile = useProfile()
  const { firstName, lastName } = splitName(profile.name)
  const { available } = useWalletBalances()
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const [done, setDone] = useState(false)
  const [payError, setPayError] = useState<string | undefined>()
  const renew = Boolean(forcedPlanId) || pathname.includes('/renouveler')

  if (!plan) {
    return (
      <>
        <PageHeader
          title="Abonnement"
          leading={<BackLink to={paths.learnCanalPlans} label="Formules" history />}
        />
        <EmptyState
          icon={Radio}
          title="Formule introuvable"
          description="Choisissez une formule dans la liste."
          action={
            <Link to={paths.learnCanalPlans} className={buttonVariants()}>
              Voir les formules
            </Link>
          }
          className="py-16"
        />
      </>
    )
  }

  const shortfall = Math.max(0, plan.price - available)

  function onSent(walletPaymentId: string, ticketId: string): boolean {
    if (done) return false
    const settled = settleLearnCanalPayment({
      walletPaymentId,
      ownerHandle: profile.handle,
      planId: plan!.id,
    })
    setDone(true)
    if (!settled.ok) {
      setPayError(
        'Paiement reçu, mais l’abonnement Canal Pro n’a pas pu être activé. Réessayez.',
      )
      return false
    }
    navigate(
      `${paths.learnCanalManage}?paye=1&ticket=${encodeURIComponent(ticketId)}`,
      { replace: true },
    )
    return false
  }

  return (
    <>
      <PageHeader
        title={renew ? 'Renouveler' : 'Payer l’abonnement'}
        leading={
          <BackLink to={paths.learnCanalPlans} label="Formules" history />
        }
      />
      <div className="space-y-4 px-4 pb-10">
        <dl className="divide-y rounded-2xl border bg-card px-4 shadow-card">
          <div className="flex justify-between gap-3 py-3">
            <dt className="text-muted-foreground">Formule</dt>
            <dd className="font-extrabold">{plan.name}</dd>
          </div>
          <div className="flex justify-between gap-3 py-3">
            <dt className="text-muted-foreground">Durée</dt>
            <dd className="font-bold">{formatPlanDuration(plan.durationDays)}</dd>
          </div>
          <div className="flex justify-between gap-3 py-3">
            <dt className="text-muted-foreground">À payer</dt>
            <dd className="text-title font-extrabold tabular-nums text-brand">
              {formatPrice(plan.price)}
            </dd>
          </div>
        </dl>

        <section className="flex items-center gap-3 rounded-2xl border bg-card p-3.5 shadow-card">
          <span className="grid size-10 place-items-center rounded-xl bg-brand/10 text-brand">
            <Wallet className="size-5" aria-hidden="true" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-semibold text-muted-foreground uppercase">
              Wallet AfriConnect
            </p>
            <p className="font-extrabold tabular-nums">{formatPrice(available)}</p>
          </div>
          {shortfall > 0 ? (
            <Link
              to={`${paths.walletDeposit()}?retour=${encodeURIComponent(pathname)}`}
              className="text-[12px] font-bold text-brand"
            >
              Approvisionner
            </Link>
          ) : null}
        </section>

        {shortfall > 0 ? (
          <p className="rounded-xl bg-amber-50 px-3.5 py-2.5 text-caption text-amber-800">
            Solde insuffisant : il manque {formatPrice(shortfall)}. Approvisionnez votre
            Wallet puis revenez payer.
          </p>
        ) : null}

        {payError ? (
          <p role="alert" className="rounded-xl bg-danger/10 px-3.5 py-2.5 text-caption text-danger">
            {payError}
          </p>
        ) : null}

        <div className="rounded-[1.25rem] bg-[#f3f2f7] p-2">
          <WalletPaymentForm
            purpose="subscription"
            domain="afrilearn"
            title={`Canal Pro AfriLearn · ${plan.name}`}
            detail={`Abonnement ${formatPlanDuration(plan.durationDays)}`}
            amount={plan.price}
            fees={0}
            enableRewards={false}
            enableMerchantCredit={false}
            payer={{ firstName, lastName }}
            beneficiary={{
              name: 'AfriConnect',
              handle: 'africonnect',
              business: 'AfriLearn · Canal Pro',
              serviceId: 'africonnect-learn-canal',
              verified: true,
            }}
            waitingLabel="Confirmer"
            actionLabel="Payer avec le Wallet"
            onSent={onSent}
          />
        </div>
      </div>
    </>
  )
}
