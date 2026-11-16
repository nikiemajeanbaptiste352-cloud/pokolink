import { Radio, Wallet } from 'lucide-react'
import { useState } from 'react'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'

import { BackLink } from '@/components/common/BackLink'
import { EmptyState } from '@/components/common/EmptyState'
import { PageHeader } from '@/components/common/PageHeader'
import { buttonVariants } from '@/components/ui/button'
import { WalletPaymentForm } from '@/components/wallet/WalletPaymentForm'
import { useAfriLearnCommerce } from '@/hooks/use-afrilearn-commerce'
import { useProfile } from '@/hooks/use-profile'
import { useWalletBalances } from '@/hooks/use-wallet'
import {
  canManageCanal,
  findCanal,
  getMemberSubscription,
  hasCanalMemberAccess,
} from '@/lib/afrilearn-commerce-store'
import {
  formatPlanDuration,
  getLearnCanalMemberPlan,
  memberPlanPrice,
} from '@/lib/afrilearn-plans'
import { settleLearnCanalMemberPayment } from '@/lib/afrilearn-wallet'
import { formatPrice } from '@/lib/format'
import { splitName } from '@/lib/payment-labels'
import { paths } from '@/routes/paths'
import type { LearnCanalMemberPlanId } from '@/types/afrilearn-commerce'

/** Paiement Wallet d’un forfait abonné visiteur → accès Canal Pro. */
export function LearnCanalMemberPayPage() {
  useAfriLearnCommerce()
  const { canalId, planId } = useParams()
  const canal = findCanal(canalId)
  const plan = getLearnCanalMemberPlan(planId)
  const profile = useProfile()
  const { firstName, lastName } = splitName(profile.name)
  const { available } = useWalletBalances()
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const [done, setDone] = useState(false)
  const [payError, setPayError] = useState<string | undefined>()

  const ownerActive = canal ? canManageCanal(canal.ownerHandle) : false
  const isOwner =
    canal &&
    canal.ownerHandle.toLowerCase() ===
      profile.handle.replace(/^@/, '').toLowerCase()
  const already =
    canal && hasCanalMemberAccess(canal.id, profile.handle)
  const memberSub =
    canal && already
      ? getMemberSubscription(canal.id, profile.handle)
      : undefined

  if (
    !canal ||
    !canal.published ||
    !ownerActive ||
    !canal.memberPlansEnabled ||
    !plan
  ) {
    return (
      <>
        <PageHeader
          title="S’abonner"
          leading={
            <BackLink
              to={canalId ? paths.learnCanalPublic(canalId) : paths.learnMarket}
              label="Canal"
              history
            />
          }
        />
        <EmptyState
          icon={Radio}
          title="Forfait indisponible"
          description="Ce canal n’accepte pas les abonnements visiteurs pour le moment."
          action={
            <Link
              to={canalId ? paths.learnCanalPublic(canalId) : paths.learnMarket}
              className={buttonVariants()}
            >
              Retour au canal
            </Link>
          }
          className="py-16"
        />
      </>
    )
  }

  if (isOwner) {
    return (
      <>
        <PageHeader
          title="S’abonner"
          leading={
            <BackLink
              to={paths.learnCanalPublic(canal.id)}
              label="Canal"
              history
            />
          }
        />
        <EmptyState
          icon={Radio}
          title="Votre propre canal"
          description="Vous ne pouvez pas vous abonner à votre Canal Pro. Choisissez un autre canal sur le marché éducatif pour tester le paiement Wallet."
          action={
            <Link to={paths.learnMarket} className={buttonVariants()}>
              Marché éducatif
            </Link>
          }
          className="py-16"
        />
      </>
    )
  }

  const price = memberPlanPrice(canal, plan.id)
  const shortfall = Math.max(0, price - available)

  function onSent(walletPaymentId: string, ticketId: string): boolean {
    if (done) return false
    const settled = settleLearnCanalMemberPayment({
      walletPaymentId,
      canalId: canal!.id,
      memberHandle: profile.handle,
      planId: plan!.id as LearnCanalMemberPlanId,
    })
    setDone(true)
    if (!settled.ok) {
      setPayError(
        'Paiement Wallet reçu, mais l’accès au canal n’a pas pu être activé. Réessayez ou ouvrez le Marché.',
      )
      return false
    }
    navigate(
      `${paths.learnCanalAccess(canal!.id)}?paye=1&ticket=${encodeURIComponent(ticketId)}`,
      { replace: true },
    )
    return false
  }

  return (
    <>
      <PageHeader
        title="S’abonner au canal"
        leading={
          <BackLink
            to={paths.learnCanalPublic(canal.id)}
            label="Canal"
            history
          />
        }
      />
      <div className="space-y-4 px-4 pb-10">
        {already && memberSub ? (
          <p
            role="status"
            className="rounded-2xl border border-brand/30 bg-brand/5 px-3.5 py-3 text-[13px] font-semibold text-brand"
          >
            Abonnement actif ({memberSub.planName}) jusqu’au{' '}
            {new Date(memberSub.expiresAt).toLocaleDateString('fr-FR')}. Un nouvel
            achat prolonge la durée.
          </p>
        ) : null}

        <dl className="divide-y rounded-2xl border bg-card px-4 shadow-card">
          <div className="flex justify-between gap-3 py-3">
            <dt className="text-muted-foreground">Canal</dt>
            <dd className="text-right font-extrabold">{canal.name}</dd>
          </div>
          <div className="flex justify-between gap-3 py-3">
            <dt className="text-muted-foreground">Forfait</dt>
            <dd className="font-extrabold">{plan.name}</dd>
          </div>
          <div className="flex justify-between gap-3 py-3">
            <dt className="text-muted-foreground">Durée</dt>
            <dd className="font-bold">{formatPlanDuration(plan.durationDays)}</dd>
          </div>
          <div className="flex justify-between gap-3 py-3">
            <dt className="text-muted-foreground">À payer</dt>
            <dd className="text-title font-extrabold tabular-nums text-brand">
              {formatPrice(price)}
            </dd>
          </div>
        </dl>

        <section className="flex items-center gap-3 rounded-2xl border bg-card p-3.5 shadow-card">
          <span className="grid size-10 place-items-center rounded-xl bg-brand/10 text-brand">
            <Wallet className="size-5" aria-hidden="true" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-semibold uppercase text-muted-foreground">
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
            title={`${canal.name} · ${plan.name}`}
            detail={`Abonnement visiteur · ${formatPlanDuration(plan.durationDays)}`}
            amount={price}
            fees={0}
            enableRewards={false}
            enableMerchantCredit={false}
            payer={{ firstName, lastName }}
            beneficiary={{
              name: canal.name,
              handle: canal.ownerHandle,
              business: 'AfriLearn · Canal Pro',
              serviceId: `learn-canal-member-${canal.id}`,
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
