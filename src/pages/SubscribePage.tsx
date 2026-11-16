import { Check, Crown, Info } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'

import { BackLink } from '@/components/common/BackLink'
import { EmptyState } from '@/components/common/EmptyState'
import { PageHeader } from '@/components/common/PageHeader'
import { PlanView } from '@/components/pro/plans/PlanParts'
import { ServiceNotFound } from '@/components/services/ServiceNotFound'
import { SubscriptionCardPanel } from '@/components/subscriptions/SubscriptionCardPanel'
import { WalletPaymentForm } from '@/components/wallet/WalletPaymentForm'
import { Button, buttonVariants } from '@/components/ui/button'
import { useNow } from '@/hooks/use-now'
import { usePublicPro } from '@/hooks/use-public-pro'
import { useSubscriptionCards } from '@/hooks/use-subscription-cards'
import {
  applyAffiliateSale,
  recordAffiliateClick,
} from '@/lib/affiliate-store'
import { formatPrice } from '@/lib/format'
import { useProfile } from '@/hooks/use-profile'
import { splitName } from '@/lib/payment-labels'
import { createId } from '@/lib/ids'
import { getPublicPlans } from '@/lib/pro-public'
import { PLAN_DURATION_LABEL, planDurationMs } from '@/lib/pro-labels'
import { updateProExtras } from '@/lib/pro-extras-store'
import { toggleFollow, getFollowed } from '@/lib/follows-store'
import { ensureProChannel } from '@/lib/pro-channel-messaging'
import { activateCard, addCard } from '@/lib/subscription-cards-store'
import { cn } from '@/lib/utils'
import { paths } from '@/routes/paths'

type Step = 'plan' | 'payment' | 'card'

const STEPS: readonly { id: Step; label: string }[] = [
  { id: 'plan', label: 'Forfait' },
  { id: 'payment', label: 'Paiement' },
  { id: 'card', label: 'Ma carte' },
]

function Stepper({ step }: { step: Step }) {
  const current = STEPS.findIndex((item) => item.id === step)
  return (
    <ol aria-label="Étapes de la souscription" className="flex gap-2 px-4">
      {STEPS.map((item, index) => {
        const done = index < current
        const active = index === current
        return (
          <li
            key={item.id}
            aria-current={active ? 'step' : undefined}
            className="flex min-w-0 flex-1 flex-col items-center gap-1 text-center"
          >
            <span
              className={cn(
                'h-1.5 w-full rounded-full',
                done || active ? 'bg-brand' : 'bg-muted',
              )}
              aria-hidden="true"
            />
            <span
              className={cn(
                'inline-flex items-center gap-1 text-caption font-bold',
                active ? 'text-foreground' : 'text-muted-foreground',
              )}
            >
              {done ? (
                <Check className="size-3.5 text-brand" aria-hidden="true" />
              ) : (
                <span>{index + 1}.</span>
              )}
              {item.label}
            </span>
          </li>
        )
      })}
    </ol>
  )
}
/** Horodatage d'une action de l'utilisateur (appelée depuis un événement, jamais au rendu). */
function timestamp() {
  return Date.now()
}

/**
 * Souscription à un forfait d'un Service Pro : choix du forfait, paiement avec le Wallet,
 * puis carte d'abonnement avec son QR code à télécharger. Le frontend n'active jamais la
 * carte : il envoie la demande de paiement ; le serveur confirme le paiement, active la carte
 * et fixe ses dates. D'ici là, la carte est téléchargeable mais « en attente de paiement ».
 */
export function SubscribePage() {
  const { ref, planId } = useParams()
  const [searchParams] = useSearchParams()
  const affParam = searchParams.get('aff') ?? searchParams.get('ref')
  const profile = useProfile()
  const { firstName, lastName } = splitName(profile.name)
  const pro = usePublicPro(ref)
  const now = useNow(60_000)
  const cards = useSubscriptionCards()
  const [step, setStep] = useState<Step>('plan')
  const [accepted, setAccepted] = useState(false)
  const [cardId, setCardId] = useState<string | null>(null)

  const backTo = affParam
    ? `${paths.establishment(ref ?? '')}?onglet=abonnements&aff=${encodeURIComponent(affParam)}`
    : `${paths.establishment(ref ?? '')}?onglet=abonnements`

  useEffect(() => {
    if (affParam) recordAffiliateClick(affParam)
  }, [affParam])

  if (!pro) {
    return (
      <>
        <PageHeader
          title="Souscrire"
          leading={<BackLink to={paths.explore} label="Explorer" history />}
        />
        <ServiceNotFound backTo={paths.explore} />
      </>
    )
  }

  const plan = getPublicPlans(pro.extras).find((item) => item.id === planId)

  if (!plan || pro.owned || plan.price <= 0) {
    return (
      <>
        <PageHeader
          title="Souscrire"
          leading={<BackLink to={backTo} label={pro.service.name} history />}
        />
        <EmptyState
          icon={Crown}
          tone="gold"
          title={
            !plan
              ? 'Forfait introuvable'
              : pro.owned
                ? 'Votre propre forfait'
                : 'Forfait sur devis'
          }
          description={
            !plan
              ? 'Ce forfait n’existe plus ou n’est plus proposé.'
              : pro.owned
                ? 'Vous ne pouvez pas souscrire à un forfait de votre propre établissement.'
                : 'Ce forfait n’a pas de prix fixe : contactez l’établissement pour en discuter.'
          }
          action={
            <Link to={backTo} className={buttonVariants()}>
              Voir les forfaits
            </Link>
          }
          className="py-20"
        />
      </>
    )
  }

  // Locaux après gardes : le narrowing TS ne traverse pas les closures.
  const activePro = pro
  const activePlan = plan
  const card = cardId ? cards.find((item) => item.id === cardId) : undefined
  const conditionsToAccept = Boolean(activePlan.conditions)

  function sent() {
    if (cardId) return
    const now = timestamp()
    // Une seule carte par parcours : le serveur gardera la clé d'idempotence.
    const created = addCard(
      {
        serviceId: activePro.service.id,
        proRef: activePro.service.username,
        planId: activePlan.id,
        planName: activePlan.name,
        planDuration: activePlan.duration,
        price: activePlan.price,
        holderName: profile.name,
      },
      now,
    )
    const durationMs = planDurationMs(activePlan.duration)
    const endsAt = durationMs === null ? undefined : now + durationMs
    activateCard(created.id, now, endsAt)
    // Souscripteur visible côté vendeur (Espace Pro → Souscripteurs).
    updateProExtras(activePro.service, activePro.items, (current) => ({
      ...current,
      planClients: [
        {
          id: createId(),
          name: profile.name,
          planId: activePlan.id,
          subscribedAt: new Date(now).toISOString(),
          endsAt: endsAt ? new Date(endsAt).toISOString() : '',
          status: 'active' as const,
        },
        ...current.planClients,
      ],
    }))
    applyAffiliateSale(activePro.service.id, activePlan.price, now)
    if (!getFollowed().includes(activePro.service.id)) toggleFollow(activePro.service.id)
    ensureProChannel(activePro.service, activePro.extras)
    setCardId(created.id)
    setStep('card')
    window.scrollTo({ top: 0 })
  }

  return (
    <>
      <PageHeader
        title="Souscrire"
        leading={<BackLink to={backTo} label={pro.service.name} history />}
      />

      <div className="space-y-5 py-4">
        <Stepper step={step} />

        {step === 'plan' ? (
          <section className="space-y-4 px-4" aria-label="Forfait choisi">
            <p className="text-body text-muted-foreground">
              Forfait de <strong className="text-foreground">{pro.service.name}</strong>
            </p>
            <PlanView
              name={plan.name}
              description={plan.description}
              price={plan.price}
              duration={plan.duration}
              benefits={plan.benefits}
              conditions={plan.conditions}
              image={plan.image}
            />
            <dl className="divide-y rounded-2xl border bg-card px-4 shadow-card">
              <div className="flex items-baseline justify-between gap-3 py-3">
                <dt className="text-body text-muted-foreground">Titulaire de la carte</dt>
                <dd className="text-body font-bold">{profile.name}</dd>
              </div>
              <div className="flex items-baseline justify-between gap-3 py-3">
                <dt className="text-body text-muted-foreground">Durée</dt>
                <dd className="text-body font-bold">
                  {PLAN_DURATION_LABEL[plan.duration]}
                </dd>
              </div>
              <div className="flex items-baseline justify-between gap-3 py-3">
                <dt className="text-body text-muted-foreground">À payer</dt>
                <dd className="text-title font-extrabold tabular-nums">
                  {formatPrice(plan.price)}
                </dd>
              </div>
            </dl>

            {conditionsToAccept ? (
              <label className="flex min-h-11 cursor-pointer items-start gap-3 rounded-xl bg-muted p-3.5 text-body">
                <input
                  type="checkbox"
                  checked={accepted}
                  onChange={(event) => setAccepted(event.target.checked)}
                  className="mt-0.5 size-5 shrink-0 accent-[var(--brand)]"
                />
                <span>J’ai lu et j’accepte les conditions de ce forfait.</span>
              </label>
            ) : null}

            <Button
              type="button"
              size="lg"
              className="w-full"
              disabled={conditionsToAccept && !accepted}
              onClick={() => {
                setStep('payment')
                window.scrollTo({ top: 0 })
              }}
            >
              Continuer vers le paiement
            </Button>
          </section>
        ) : null}

        {step === 'payment' ? (
          <section className="space-y-4 px-4" aria-label="Paiement du forfait">
            <dl className="divide-y rounded-2xl border bg-card px-4 shadow-card">
              <div className="flex items-baseline justify-between gap-3 py-3">
                <dt className="text-body text-muted-foreground">Forfait</dt>
                <dd className="min-w-0 text-right text-body font-extrabold break-words">
                  {plan.name} · {pro.service.name}
                </dd>
              </div>
              <div className="flex items-baseline justify-between gap-3 py-3">
                <dt className="text-body text-muted-foreground">Montant</dt>
                <dd className="text-title font-extrabold tabular-nums">
                  {formatPrice(plan.price)}
                </dd>
              </div>
            </dl>

            <WalletPaymentForm
              purpose="subscription"
              title={`Forfait ${plan.name} · ${pro.service.name}`}
              detail={PLAN_DURATION_LABEL[plan.duration]}
              amount={plan.price}
              payer={{ firstName, lastName }}
              beneficiary={{
                name: pro.service.name,
                handle: pro.service.username,
                business: pro.service.name,
                serviceId: pro.service.id,
                verified: pro.verified,
                ...(pro.service.logo ? { avatarSrc: pro.service.logo } : {}),
              }}
              recipient={`@${pro.service.username}`}
              waitingLabel="Confirmer"
              actionLabel="Confirmer le paiement"
              onSent={sent}
            />
            <Button
              type="button"
              variant="ghost"
              size="lg"
              className="w-full"
              onClick={() => setStep('plan')}
            >
              Retour au forfait
            </Button>
          </section>
        ) : null}

        {step === 'card' && card ? (
          <section className="space-y-4 px-4" aria-label="Ma carte d’abonnement">
            <div className="space-y-2 rounded-2xl bg-info/10 p-4" role="status">
              <p className="text-title font-extrabold">Demande envoyée</p>
              <p className="text-body">
                Votre paiement est « en attente de confirmation ». Voici votre carte
                d’abonnement : téléchargez-la dès maintenant. Elle devient valable quand
                le serveur confirme le paiement.
              </p>
            </div>

            <SubscriptionCardPanel card={card} now={now} />

            <p className="mx-auto flex max-w-sm items-start gap-2 text-caption text-muted-foreground">
              <Info className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
              Retrouvez cette carte à tout moment dans Profil, Tickets, Abonnements.
            </p>
            <div className="mx-auto grid max-w-sm gap-2">
              <Link
                to={paths.subscriptionCard(card.id)}
                className={buttonVariants({ variant: 'outline', size: 'lg' })}
              >
                Voir ma carte
              </Link>
              <Link
                to={backTo}
                className={buttonVariants({ variant: 'ghost', size: 'lg' })}
              >
                Retour à {pro.service.name}
              </Link>
            </div>
          </section>
        ) : null}
      </div>
    </>
  )
}
