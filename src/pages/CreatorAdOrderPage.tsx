import { Info, Megaphone } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'

import { BackLink } from '@/components/common/BackLink'
import { EmptyState } from '@/components/common/EmptyState'
import { Media } from '@/components/common/Media'
import { PageHeader } from '@/components/common/PageHeader'
import { WalletPaymentForm } from '@/components/wallet/WalletPaymentForm'
import { buttonVariants } from '@/components/ui/button'
import { useProfile } from '@/hooks/use-profile'
import { useStudioAdPlans } from '@/hooks/use-studio-ads'
import { findCreator } from '@/lib/creators'
import { formatPrice } from '@/lib/format'
import { splitName } from '@/lib/payment-labels'
import {
  STUDIO_AD_PLATFORM_FEE_RATE,
  STUDIO_AD_PLATFORM_LABEL,
  studioAdCreatorNet,
  studioAdPlatformFee,
} from '@/lib/studio-ads-labels'
import { placeStudioAdOrder } from '@/lib/studio-ads-store'
import { paths } from '@/routes/paths'

import { NotFoundPage } from './NotFoundPage'

/**
 * Commande d’un forfait publicitaire : l’acheteur paie le prix du forfait.
 * Commission 10 % déduite du créateur (crédit net = prix − commission).
 */
export function CreatorAdOrderPage() {
  const { handle, planId } = useParams()
  const creator = findCreator(handle)
  const plans = useStudioAdPlans()
  const profile = useProfile()

  if (!creator || !handle) return <NotFoundPage />

  const plan = plans.find((p) => p.id === planId && p.status === 'published')
  if (!plan || !(plan.price != null && plan.price > 0)) {
    return (
      <>
        <PageHeader
          title="Commander"
          leading={
            <BackLink
              to={paths.creatorAdPlans(creator.handle)}
              label="Forfaits"
              history
            />
          }
        />
        <EmptyState
          icon={Megaphone}
          title="Forfait indisponible"
          description="Ce forfait n’est plus publié ou n’a pas de prix."
          action={
            <Link
              to={paths.creatorAdPlans(creator.handle)}
              className={buttonVariants()}
            >
              Voir les forfaits
            </Link>
          }
          className="py-16"
        />
      </>
    )
  }

  const feePct = Math.round(STUDIO_AD_PLATFORM_FEE_RATE * 100)
  const commission = studioAdPlatformFee(plan.price)
  const creatorNet = studioAdCreatorNet(plan.price)
  const names = splitName(profile.name)

  return (
    <>
      <PageHeader
        title="Paiement publicité"
        leading={
          <BackLink
            to={paths.creatorAdPlan(creator.handle, plan.id)}
            label="Forfait"
            history
          />
        }
      />

      <div className="space-y-4 px-4 py-4">
        <article className="flex gap-3 rounded-2xl border bg-card p-4 shadow-card">
          <Media
            src={plan.imageSrc}
            alt=""
            icon={Megaphone}
            className="size-16 shrink-0 rounded-xl"
          />
          <div className="min-w-0 flex-1 space-y-1">
            <h2 className="text-body font-extrabold">{plan.name}</h2>
            <p className="text-caption text-muted-foreground">
              @{creator.handle} ·{' '}
              {plan.platforms.map((p) => STUDIO_AD_PLATFORM_LABEL[p]).join(' · ')}
            </p>
            <p className="line-clamp-2 text-caption text-muted-foreground">
              {plan.description}
            </p>
          </div>
        </article>

        <dl className="divide-y rounded-2xl border bg-card px-4 shadow-card">
          <Row label="Forfait" value={formatPrice(plan.price)} />
          <Row label="Total à payer" value={formatPrice(plan.price)} bold />
        </dl>

        <p className="flex items-start gap-2 text-caption text-muted-foreground">
          <Info className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          Vous payez le prix total du forfait ({formatPrice(plan.price)}). La
          commission plateforme ({feePct} % = {formatPrice(commission)}) est
          déduite du créateur, qui est crédité de {formatPrice(creatorNet)}.
        </p>

        <WalletPaymentForm
          purpose="advertising"
          title={`${plan.name} · @${creator.handle}`}
          detail={`Forfait publicitaire · total acheteur ${formatPrice(plan.price)} · commission créateur ${feePct} % · net créateur ${formatPrice(creatorNet)}`}
          amount={plan.price}
          fees={0}
          unitPrice={plan.price}
          quantity={1}
          itemReference={plan.id}
          {...(plan.imageSrc ? { itemImageSrc: plan.imageSrc } : {})}
          payer={{ firstName: names.firstName, lastName: names.lastName }}
          beneficiary={{
            name: creator.name,
            handle: creator.handle,
            business: creator.name,
            ...(creator.avatar ? { avatarSrc: creator.avatar } : {}),
            verified: creator.verified,
          }}
          recipient={`@${creator.handle}`}
          enableRewards={false}
          waitingLabel="Confirmer"
          actionLabel="Payer et commander"
          onSent={() => {
            placeStudioAdOrder({
              plan,
              advertiserName: profile.name,
              advertiserHandle: profile.handle,
              campaignBrief: `Commande payée depuis la page @${creator.handle}.`,
              kind: 'order',
            })
          }}
        />
      </div>
    </>
  )
}

function Row({
  label,
  value,
  bold,
}: {
  label: string
  value: string
  bold?: boolean
}) {
  return (
    <div className="flex items-baseline justify-between gap-3 py-3">
      <dt className="text-body text-muted-foreground">{label}</dt>
      <dd
        className={
          bold
            ? 'text-title font-extrabold tabular-nums'
            : 'text-body font-semibold tabular-nums'
        }
      >
        {value}
      </dd>
    </div>
  )
}
