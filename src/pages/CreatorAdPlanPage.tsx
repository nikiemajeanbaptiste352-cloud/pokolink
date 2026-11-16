import { Megaphone, MessageCircle, Phone, ShoppingCart } from 'lucide-react'
import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'

import { BackLink } from '@/components/common/BackLink'
import { BottomSheet } from '@/components/common/BottomSheet'
import { EmptyState } from '@/components/common/EmptyState'
import { Media } from '@/components/common/Media'
import { PageHeader } from '@/components/common/PageHeader'
import { CreatorSocialStatsPanel } from '@/components/studio/ads/CreatorSocialStatsPanel'
import { Button, buttonVariants } from '@/components/ui/button'
import { useStartConversation } from '@/hooks/use-conversations'
import { useStudioAdPlans } from '@/hooks/use-studio-ads'
import { getCreatorContactChannels } from '@/lib/creator-social-stats'
import { findCreator } from '@/lib/creators'
import { formatPrice } from '@/lib/format'
import {
  creatorAdPlanContext,
  creatorRecipient,
} from '@/lib/messaging-contexts'
import {
  STUDIO_AD_PLATFORM_FEE_RATE,
  STUDIO_AD_PLATFORM_LABEL,
  studioAdCreatorNet,
} from '@/lib/studio-ads-labels'
import { cn } from '@/lib/utils'
import { paths } from '@/routes/paths'

import { NotFoundPage } from './NotFoundPage'

/**
 * Fiche publique d’un forfait : détail, stats réseaux,
 * Contacter (messagerie ou numéros) et Commander (paiement + 10 %).
 */
export function CreatorAdPlanPage() {
  const { handle, planId } = useParams()
  const creator = findCreator(handle)
  const plans = useStudioAdPlans()
  const startConversation = useStartConversation()
  const [contactOpen, setContactOpen] = useState(false)

  if (!creator || !handle) return <NotFoundPage />

  const plan = plans.find((p) => p.id === planId && p.status === 'published')
  if (!plan) {
    return (
      <>
        <PageHeader
          title="Forfait"
          leading={
            <BackLink
              to={paths.creatorAdPlans(creator.handle)}
              label="Publicité"
              history
            />
          }
        />
        <EmptyState
          icon={Megaphone}
          title="Forfait introuvable"
          description="Ce forfait n’est plus publié ou n’existe pas."
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

  const profile = creator
  const offer = plan
  const feePct = Math.round(STUDIO_AD_PLATFORM_FEE_RATE * 100)
  const planPrice = offer.price ?? 0
  const creatorNet = studioAdCreatorNet(planPrice)
  const orderTo = paths.creatorAdOrder(profile.handle, offer.id)
  const contacts = getCreatorContactChannels(profile.handle)

  function openMessaging() {
    setContactOpen(false)
    startConversation({
      recipient: creatorRecipient(profile),
      context: creatorAdPlanContext(profile, offer),
    })
  }

  return (
    <>
      <PageHeader
        title="Forfait publicitaire"
        leading={
          <BackLink
            to={paths.creatorAdPlans(creator.handle)}
            label="Publicité"
            history
          />
        }
      />

      <div className="space-y-5 px-4 py-4 pb-8">
        <article className="space-y-3 rounded-2xl border bg-card p-4 shadow-card">
          <div className="flex gap-3">
            <Media
              src={plan.imageSrc}
              alt=""
              icon={Megaphone}
              className="size-20 shrink-0 rounded-xl"
            />
            <div className="min-w-0 flex-1 space-y-1">
              <h1 className="text-title font-extrabold">{plan.name}</h1>
              <p className="text-caption text-muted-foreground">
                @{creator.handle} · {creator.name}
              </p>
              <p className="text-caption font-semibold text-muted-foreground">
                {plan.platforms.map((p) => STUDIO_AD_PLATFORM_LABEL[p]).join(' · ')}
              </p>
              <p className="text-title font-extrabold text-brand tabular-nums">
                {formatPrice(planPrice)}
              </p>
              <p className="text-caption text-muted-foreground">
                Prix total à payer · commission {feePct} % déduite du créateur (
                {formatPrice(creatorNet)} crédités)
              </p>
            </div>
          </div>

          <p className="text-body">{plan.description}</p>

          <div>
            <p className="text-[12px] font-semibold text-muted-foreground">
              Prestations incluses
            </p>
            <ul className="mt-1 space-y-1 text-body text-muted-foreground">
              {plan.inclusions.map((item) => (
                <li key={item}>· {item}</li>
              ))}
            </ul>
          </div>

          <dl className="divide-y rounded-xl border px-3">
            <div className="flex justify-between gap-3 py-2.5">
              <dt className="text-caption text-muted-foreground">Délais</dt>
              <dd className="text-right text-caption font-semibold">
                {plan.turnaround}
              </dd>
            </div>
            <div className="flex justify-between gap-3 py-2.5">
              <dt className="text-caption text-muted-foreground">Conditions</dt>
              <dd className="min-w-0 text-right text-caption font-semibold break-words">
                {plan.conditions}
              </dd>
            </div>
          </dl>
        </article>

        <CreatorSocialStatsPanel
          handle={creator.handle}
          planPlatforms={plan.platforms}
          planStats={plan.socialStats}
        />

        <div className="grid grid-cols-2 gap-2">
          <Button
            type="button"
            variant="outline"
            size="lg"
            className="w-full"
            onClick={() => setContactOpen(true)}
          >
            <MessageCircle aria-hidden="true" />
            Contacter
          </Button>
          <Link
            to={orderTo}
            className={cn(
              buttonVariants({ size: 'lg' }),
              'w-full justify-center',
            )}
          >
            <ShoppingCart aria-hidden="true" />
            Commander
          </Link>
        </div>
      </div>

      <BottomSheet
        open={contactOpen}
        onClose={() => setContactOpen(false)}
        title="Contacter"
        subtitle={`@${creator.handle} · ${creator.name}`}
      >
        <div className="space-y-2">
          <Button
            type="button"
            size="lg"
            className="w-full justify-start"
            onClick={openMessaging}
          >
            <MessageCircle aria-hidden="true" />
            Messagerie AfriConnect
          </Button>
          {contacts.map((channel) => (
            <a
              key={channel.id}
              href={channel.href}
              className={cn(
                buttonVariants({ variant: 'outline', size: 'lg' }),
                'w-full justify-start',
              )}
            >
              <Phone aria-hidden="true" />
              <span className="min-w-0 flex-1 text-left">
                <span className="block text-body font-bold">{channel.label}</span>
                <span className="block text-caption text-muted-foreground">
                  {channel.display}
                </span>
              </span>
            </a>
          ))}
        </div>
      </BottomSheet>
    </>
  )
}
