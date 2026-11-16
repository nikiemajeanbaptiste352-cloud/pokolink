import {
  EyeOff,
  Globe,
  Megaphone,
  Pause,
  Pencil,
  Play,
  Plus,
} from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'

import { BottomSheet } from '@/components/common/BottomSheet'
import { EmptyState } from '@/components/common/EmptyState'
import { Media } from '@/components/common/Media'
import { StatusPill } from '@/components/pro/shared'
import { StudioAdPlanForm } from '@/components/studio/ads/StudioAdPlanForm'
import { StudioSection } from '@/components/studio/parts'
import { Button, buttonVariants } from '@/components/ui/button'
import { useProfile } from '@/hooks/use-profile'
import { useStudioAdPlans } from '@/hooks/use-studio-ads'
import { formatPrice } from '@/lib/format'
import {
  STUDIO_AD_PLAN_STATUS_LABEL,
  STUDIO_AD_PLATFORM_FEE_RATE,
  STUDIO_AD_PLATFORM_LABEL,
  studioAdCreatorNet,
} from '@/lib/studio-ads-labels'
import { setStudioAdPlanStatus } from '@/lib/studio-ads-store'
import { cn } from '@/lib/utils'
import { paths } from '@/routes/paths'
import type { StudioAdPlan } from '@/types/studio-ads'

/**
 * Rubrique privée « Forfaits pub » — création et gestion des forfaits.
 */
export function StudioAdPlansTab() {
  const plans = useStudioAdPlans()
  const profile = useProfile()
  const [editing, setEditing] = useState<StudioAdPlan | null | 'new'>(null)

  return (
    <>
      <StudioSection
        title="Forfaits publicitaires"
        description="L’acheteur paie le prix total. La commission plateforme (10 %) est déduite de votre crédit."
      >
        <div className="space-y-2">
          <Button
            type="button"
            size="lg"
            className="h-12 w-full text-base font-extrabold"
            onClick={() => setEditing('new')}
          >
            <Plus aria-hidden="true" className="size-5" />
            Créer un forfait publicitaire
          </Button>
          <Link
            to={paths.creatorAdPlans(profile.handle)}
            className={cn(
              buttonVariants({ variant: 'outline', size: 'sm' }),
              'w-full justify-center',
            )}
          >
            <Globe aria-hidden="true" />
            Voir sur ma page publique
          </Link>
        </div>

        {plans.length === 0 ? (
          <EmptyState
            icon={Megaphone}
            title="Aucun forfait publicitaire"
            description="Créez votre premier forfait pour le proposer aux annonceurs sur votre page publique."
            action={
              <Button
                type="button"
                size="lg"
                className="font-extrabold"
                onClick={() => setEditing('new')}
              >
                <Plus aria-hidden="true" />
                Créer un forfait publicitaire
              </Button>
            }
            className="py-10"
          />
        ) : (
          <ul className="space-y-3">
            {plans.map((plan) => (
              <li
                key={plan.id}
                className="space-y-3 rounded-2xl border bg-card p-4 shadow-card"
              >
                <div className="flex gap-3">
                  <Media
                    src={plan.imageSrc}
                    alt=""
                    icon={Megaphone}
                    className="size-16 shrink-0 rounded-xl"
                  />
                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="truncate text-body font-extrabold">{plan.name}</h3>
                      <StatusPill>{STUDIO_AD_PLAN_STATUS_LABEL[plan.status]}</StatusPill>
                    </div>
                    <p className="line-clamp-2 text-caption text-muted-foreground">
                      {plan.description}
                    </p>
                    <p className="text-caption font-semibold text-muted-foreground">
                      {plan.platforms.map((p) => STUDIO_AD_PLATFORM_LABEL[p]).join(' · ')}
                    </p>
                    <p className="text-title font-extrabold text-brand tabular-nums">
                      {formatPrice(plan.price ?? 0)}
                    </p>
                    {plan.price != null && plan.price > 0 ? (
                      <p className="text-caption text-muted-foreground">
                        Net crédité après commission{' '}
                        {Math.round(STUDIO_AD_PLATFORM_FEE_RATE * 100)} % :{' '}
                        {formatPrice(studioAdCreatorNet(plan.price))}
                      </p>
                    ) : null}
                  </div>
                </div>
                <ul className="space-y-1 text-caption text-muted-foreground">
                  {plan.inclusions.slice(0, 3).map((item) => (
                    <li key={item}>· {item}</li>
                  ))}
                  {plan.inclusions.length > 3 ? (
                    <li>· +{plan.inclusions.length - 3} autre(s)</li>
                  ) : null}
                </ul>
                <p className="text-caption text-muted-foreground">
                  Délais : {plan.turnaround}
                </p>
                <div className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => setEditing(plan)}
                  >
                    <Pencil aria-hidden="true" />
                    Modifier
                  </Button>
                  {plan.status === 'published' ? (
                    <Button
                      type="button"
                      size="sm"
                      variant="secondary"
                      onClick={() => setStudioAdPlanStatus(plan.id, 'disabled')}
                    >
                      <Pause aria-hidden="true" />
                      Désactiver
                    </Button>
                  ) : (
                    <Button
                      type="button"
                      size="sm"
                      variant="secondary"
                      onClick={() => setStudioAdPlanStatus(plan.id, 'published')}
                    >
                      {plan.status === 'draft' ? (
                        <Play aria-hidden="true" />
                      ) : (
                        <EyeOff aria-hidden="true" />
                      )}
                      {plan.status === 'draft' ? 'Publier' : 'Réactiver'}
                    </Button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </StudioSection>

      <BottomSheet
        open={editing !== null}
        onClose={() => setEditing(null)}
        title={
          editing === 'new' || editing === null
            ? 'Créer un forfait publicitaire'
            : 'Modifier le forfait'
        }
        subtitle="Forfaits pub · Creator Studio"
      >
        {editing !== null ? (
          <StudioAdPlanForm
            key={editing === 'new' ? 'new' : editing.id}
            {...(editing !== 'new' ? { plan: editing } : {})}
            onDone={() => setEditing(null)}
          />
        ) : null}
      </BottomSheet>
    </>
  )
}
