import { Clapperboard, Megaphone, Plus } from 'lucide-react'
import { Link } from 'react-router-dom'

import { Avatar } from '@/components/common/Avatar'
import { EmptyState } from '@/components/common/EmptyState'
import { VerifiedBadge } from '@/components/common/VerifiedBadge'
import { StatTile } from '@/components/pro/shared'
import { StudioSection } from '@/components/studio/parts'
import { StudioEventCard } from '@/components/studio/StudioEventCard'
import { buttonVariants } from '@/components/ui/button'
import { useProfile } from '@/hooks/use-profile'
import { useStudioAdPlans } from '@/hooks/use-studio-ads'
import { formatCount } from '@/lib/format'
import { matchesFilter, sumStats } from '@/lib/studio'
import { cn } from '@/lib/utils'
import { paths } from '@/routes/paths'
import type { StudioEvent } from '@/types/studio'

/** Aperçu du Studio : l'essentiel, ce qui demande une action, les derniers événements. */
export function StudioOverview({
  events,
  onShowHistory,
}: {
  events: readonly StudioEvent[]
  onShowHistory: () => void
}) {
  const profile = useProfile()
  const adPlans = useStudioAdPlans()
  const publishedAds = adPlans.filter((p) => p.status === 'published').length
  const active = events.filter(
    (event) => event.status === 'scheduled' || event.status === 'live',
  ).length
  const inReview = events.filter((event) => event.status === 'in_review').length
  const drafts = events.filter((event) => event.status === 'draft').length
  const totals = sumStats(events)
  const toDo = events.filter(
    (event) => matchesFilter(event, 'attention') || matchesFilter(event, 'draft'),
  )

  if (events.length === 0) {
    return (
      <div className="space-y-6">
        <EmptyState
          icon={Clapperboard}
          tone="violet"
          title="Aucun événement"
          description="Proposez votre premier événement Creator Market : une cote OUI / NON ou des coins."
          action={
            <Link to={paths.studioEventNew} className={buttonVariants({ size: 'lg' })}>
              <Plus aria-hidden="true" />
              Créer un événement
            </Link>
          }
        />
        <StudioSection
          title="Publicité"
          description="Vous pouvez aussi publier des forfaits publicitaires."
        >
          <Link
            to={paths.studioAdPlans}
            className={cn(buttonVariants({ size: 'lg' }), 'w-full justify-center font-extrabold')}
          >
            <Megaphone aria-hidden="true" />
            Créer un forfait publicitaire
          </Link>
        </StudioSection>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 px-4">
        <Avatar name={profile.name} src={profile.avatarSrc} size="xl" />
        <div className="min-w-0">
          <p className="truncate text-title font-extrabold">
            {profile.name}
            {profile.verified ? (
              <VerifiedBadge tone="gold" className="ml-1.5 align-middle" />
            ) : null}
          </p>
          <p className="truncate text-body text-muted-foreground">@{profile.handle}</p>
        </div>
      </div>

      <section aria-label="Chiffres clés" className="px-4">
        <dl className="grid grid-cols-2 gap-3">
          <StatTile label="Actifs ou programmés" value={String(active)} />
          <StatTile label="En revue" value={String(inReview)} />
          <StatTile label="Brouillons" value={String(drafts)} />
          <StatTile label="Vues validées" value={formatCount(totals.views)} />
        </dl>
      </section>

      <StudioSection
        title="Publicité"
        description="Forfaits proposés aux annonceurs sur votre page publique."
      >
        <div className="flex flex-wrap gap-2">
          <Link
            to={paths.studioAdPlans}
            className={cn(buttonVariants({ size: 'sm' }), 'font-extrabold')}
          >
            <Megaphone aria-hidden="true" />
            Forfaits pub ({publishedAds})
          </Link>
          <Link
            to={paths.studioAdOrders}
            className={buttonVariants({ variant: 'outline', size: 'sm' })}
          >
            Commandes
          </Link>
          <Link
            to={paths.creatorAdPlans(profile.handle)}
            className={buttonVariants({ variant: 'outline', size: 'sm' })}
          >
            Page publique
          </Link>
        </div>
      </StudioSection>

      {toDo.length > 0 ? (
        <StudioSection
          title="À traiter"
          description="Brouillons à finir, événements à corriger."
        >
          <ul className="space-y-3">
            {toDo.slice(0, 4).map((event) => (
              <li key={event.id}>
                <StudioEventCard event={event} />
              </li>
            ))}
          </ul>
        </StudioSection>
      ) : null}

      <StudioSection title="Derniers événements">
        <ul className="space-y-3">
          {events.slice(0, 3).map((event) => (
            <li key={event.id}>
              <StudioEventCard event={event} />
            </li>
          ))}
        </ul>
        <button
          type="button"
          onClick={onShowHistory}
          className={buttonVariants({ variant: 'outline' })}
        >
          Voir tout l’historique
        </button>
      </StudioSection>
    </div>
  )
}
