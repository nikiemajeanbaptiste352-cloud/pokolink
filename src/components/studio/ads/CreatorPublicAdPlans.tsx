import { ChevronRight, Megaphone } from 'lucide-react'
import { Link } from 'react-router-dom'

import { EmptyState } from '@/components/common/EmptyState'
import { Media } from '@/components/common/Media'
import { buttonVariants } from '@/components/ui/button'
import { useStudioAdPlans } from '@/hooks/use-studio-ads'
import type { CreatorProfile } from '@/lib/creators'
import { formatPrice } from '@/lib/format'
import { STUDIO_AD_PLATFORM_LABEL } from '@/lib/studio-ads-labels'
import { paths } from '@/routes/paths'
import type { StudioAdPlan } from '@/types/studio-ads'

/**
 * Liste publique des forfaits : un clic ouvre la fiche (stats réseaux + Contacter / Commander).
 */
export function CreatorPublicAdPlans({
  creator,
}: {
  creator: CreatorProfile
}) {
  const plans = useStudioAdPlans().filter((p) => p.status === 'published')

  if (creator.isMe) {
    return (
      <section aria-label="Mes tarifs publicitaires" className="space-y-3 px-4 py-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-caption font-bold text-muted-foreground">
            Aperçu public de vos forfaits
          </p>
          <Link
            to={paths.studioAdPlans}
            className="text-caption font-semibold text-brand hover:underline"
          >
            Gérer dans Studio
          </Link>
        </div>
        {plans.length === 0 ? (
          <EmptyState
            icon={Megaphone}
            tone="info"
            title="Aucun forfait publié"
            description="Publiez un forfait dans Creator Studio pour qu’il apparaisse ici."
            action={
              <Link to={paths.studioAdPlans} className={buttonVariants()}>
                Mes tarifs publicitaires
              </Link>
            }
            className="py-10"
          />
        ) : (
          <ul className="space-y-3">
            {plans.map((plan) => (
              <li key={plan.id}>
                <PublicAdPlanCard
                  plan={plan}
                  to={paths.creatorAdPlan(creator.handle, plan.id)}
                />
              </li>
            ))}
          </ul>
        )}
      </section>
    )
  }

  return (
    <section aria-label="Tarifs publicitaires" className="space-y-3 px-4 py-3">
      <p className="text-caption text-muted-foreground">
        Touchez un forfait pour voir les statistiques réseaux, puis Contacter ou
        Commander. Vous payez le prix affiché ; la commission 10 % est déduite du
        créateur.
      </p>
      {plans.length === 0 ? (
        <EmptyState
          icon={Megaphone}
          tone="info"
          title="Aucun forfait"
          description="Ce créateur n’a pas encore publié de tarifs publicitaires."
          className="py-10"
        />
      ) : (
        <ul className="space-y-3">
          {plans.map((plan) => (
            <li key={plan.id}>
              <PublicAdPlanCard
                plan={plan}
                to={paths.creatorAdPlan(creator.handle, plan.id)}
              />
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

function PublicAdPlanCard({
  plan,
  to,
}: {
  plan: StudioAdPlan
  to: string
}) {
  return (
    <Link
      to={to}
      className="flex gap-3 rounded-2xl border bg-card p-4 shadow-card transition-colors hover:bg-muted/40"
    >
      <Media
        src={plan.imageSrc}
        alt=""
        icon={Megaphone}
        className="size-16 shrink-0 rounded-xl"
      />
      <span className="min-w-0 flex-1 space-y-1">
        <span className="block truncate text-body font-extrabold">{plan.name}</span>
        <span className="line-clamp-2 block text-caption text-muted-foreground">
          {plan.description}
        </span>
        <span className="block text-caption font-semibold text-muted-foreground">
          {plan.platforms.map((p) => STUDIO_AD_PLATFORM_LABEL[p]).join(' · ')}
        </span>
        <span className="block text-title font-extrabold text-brand tabular-nums">
          {formatPrice(plan.price ?? 0)}
        </span>
      </span>
      <ChevronRight
        className="mt-1 size-5 shrink-0 text-muted-foreground"
        aria-hidden="true"
      />
      <span className="sr-only">Voir le détail, les statistiques et commander</span>
    </Link>
  )
}
