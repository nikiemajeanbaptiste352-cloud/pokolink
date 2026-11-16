import {
  Clapperboard,
  Coins,
  Film,
  MessageCircle,
  Share2,
  UserCheck,
  UserPlus,
} from 'lucide-react'
import { useEffect, useMemo } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'

import { BackLink } from '@/components/common/BackLink'
import { EmptyState } from '@/components/common/EmptyState'
import { FilterChips, type ChipItem } from '@/components/common/FilterChips'
import { PageHeader } from '@/components/common/PageHeader'
import { ProfileWelcome } from '@/components/common/ProfileWelcome'
import { PublicProfileHeader } from '@/components/common/PublicProfileHeader'
import { CoinEventCard } from '@/components/market/coins/CoinEventCard'
import { StatusBadge } from '@/components/market/StatusBadge'
import { formatCote } from '@/components/market/market-utils'
import { CreatorPublicPosts } from '@/components/profile/CreatorPublicPosts'
import { FlashMessage } from '@/components/pro/shared'
import { CreatorPublicAdPlans } from '@/components/studio/ads/CreatorPublicAdPlans'
import { StudioStatusPill } from '@/components/studio/StudioStatusPill'
import { Button, buttonVariants } from '@/components/ui/button'
import { useStartConversation } from '@/hooks/use-conversations'
import { useFollowing } from '@/hooks/use-following'
import { useLocalStore } from '@/hooks/use-local-store'
import { useProfile } from '@/hooks/use-profile'
import { useShare } from '@/hooks/use-share'
import { useStudioEvents } from '@/hooks/use-studio'
import {
  findCreator,
  getCreatorCoinEvents,
  getCreatorMarkets,
  type CreatorProfile,
} from '@/lib/creators'
import { formatCount } from '@/lib/format'
import { creatorContext, creatorRecipient } from '@/lib/messaging-contexts'
import {
  getFollowerDelta,
  profileEngagementStore,
  recordProfileVisit,
} from '@/lib/profile-engagement-store'
import { localPostsStore } from '@/lib/social-store'
import { formatEventStart, getEventTitle, STUDIO_KINDS } from '@/lib/studio'
import { cn } from '@/lib/utils'
import { paths } from '@/routes/paths'
import type { StudioEvent } from '@/types/studio'

import { NotFoundPage } from './NotFoundPage'

type TabId = 'publications' | 'evenements' | 'publicite' | 'apropos'

const TABS: readonly ChipItem<TabId>[] = [
  { id: 'publications', label: 'Publications' },
  { id: 'evenements', label: 'Événements' },
  { id: 'publicite', label: 'Publicité' },
  { id: 'apropos', label: 'À propos' },
]

function isTab(value: string | null): value is TabId {
  return TABS.some((tab) => tab.id === value)
}

/** Un événement du Studio devient public une fois validé : programmé, en cours ou terminé. */
function isPublicStudioEvent(event: StudioEvent): boolean {
  return (
    event.status === 'scheduled' || event.status === 'live' || event.status === 'ended'
  )
}

function KindIcon({ kind }: { kind: StudioEvent['kind'] }) {
  const Icon = STUDIO_KINDS[kind].icon
  return <Icon className="size-5" aria-hidden="true" />
}

const rowClass =
  'flex min-h-11 items-center gap-3 rounded-xl border bg-card p-3.5 shadow-card transition-colors hover:bg-muted'

/** Page publique d'un créateur : profil, posts privés publiés, Creator Market. */
export function CreatorPage() {
  const { handle } = useParams()
  const creator = findCreator(handle)
  if (!creator) return <NotFoundPage />
  return <CreatorView creator={creator} />
}

function CreatorView({ creator }: { creator: CreatorProfile }) {
  const [searchParams, setSearchParams] = useSearchParams()
  const requested = searchParams.get('onglet')
  const tab: TabId = isTab(requested) ? requested : 'publications'
  const [following, toggleFollowing] = useFollowing(`creator:${creator.handle}`)
  const startConversation = useStartConversation()
  const { message, share } = useShare()
  const studioEvents = useStudioEvents()
  const profile = useProfile()
  const localPosts = useLocalStore(localPostsStore)

  function setTab(next: TabId) {
    setSearchParams(
      next === 'publications' ? {} : { onglet: next },
      { replace: true },
    )
  }

  const engagement = useLocalStore(profileEngagementStore)

  // Visite publique → stats du profil privé (pas sur sa propre page).
  useEffect(() => {
    if (creator.isMe) return
    recordProfileVisit(creator.handle)
  }, [creator.handle, creator.isMe])

  const live = useMemo(() => {
    const delta = getFollowerDelta(creator.handle)
    if (!creator.isMe) {
      return {
        name: creator.name,
        bio: creator.bio,
        city: creator.city,
        avatar: creator.avatar,
        verified: creator.verified,
        followers: creator.followers + delta,
        posts: 0,
      }
    }
    return {
      name: profile.name,
      bio: profile.bio,
      city: profile.city,
      avatar: profile.avatarSrc,
      verified: profile.verified ?? false,
      followers: profile.stats.followers + getFollowerDelta(profile.handle),
      posts: localPosts.length,
    }
  }, [creator, profile, following, localPosts.length, engagement])

  const markets = getCreatorMarkets(creator.handle)
  const coinEvents = getCreatorCoinEvents(creator.handle)
  const mine = creator.isMe ? studioEvents.filter(isPublicStudioEvent) : []
  const total = markets.length + coinEvents.length + mine.length

  return (
    <>
      <ProfileWelcome
        name={live.name}
        eyebrow="Créateur"
        subtitle={live.city || undefined}
        avatarSrc={live.avatar}
      />
      <PageHeader
        title="Créateur"
        leading={<BackLink to={paths.markets} label="Creator Market" history />}
      />
      <FlashMessage message={message} />

      <PublicProfileHeader
        name={live.name}
        handle={creator.handle}
        avatar={live.avatar}
        verified={live.verified}
        subtitle={live.city || undefined}
        bio={live.bio}
        stats={[
          {
            label: 'Abonnés',
            value: formatCount(live.followers),
          },
          {
            label: 'Posts',
            value: String(creator.isMe ? live.posts : '—'),
          },
          {
            label: 'Événements',
            value: `${total}`,
          },
        ]}
        actions={
          creator.isMe ? (
            <>
              <Link
                to={paths.studio}
                className={cn(buttonVariants({ size: 'sm' }), 'flex-1')}
              >
                <Clapperboard aria-hidden="true" />
                Creator Studio
              </Link>
              <Link
                to={paths.profile}
                className={cn(buttonVariants({ variant: 'outline', size: 'sm' }))}
              >
                Profil privé
              </Link>
              <Button
                variant="outline"
                size="sm"
                onClick={() => void share(paths.creator(creator.handle), live.name)}
              >
                <Share2 aria-hidden="true" />
                Partager
              </Button>
            </>
          ) : (
            <>
              <Button
                size="sm"
                variant={following ? 'outline' : 'default'}
                aria-pressed={following}
                onClick={toggleFollowing}
                className="flex-1"
              >
                {following ? (
                  <UserCheck aria-hidden="true" />
                ) : (
                  <UserPlus aria-hidden="true" />
                )}
                {following ? 'Abonné' : 'Suivre'}
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() =>
                  startConversation({
                    recipient: creatorRecipient(creator),
                    context: creatorContext(creator),
                  })
                }
              >
                <MessageCircle aria-hidden="true" />
                Message
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => void share(paths.creator(creator.handle), live.name)}
              >
                <Share2 aria-hidden="true" />
                Partager
              </Button>
            </>
          )
        }
      />

      <FilterChips label="Page du créateur" items={TABS} value={tab} onChange={setTab} />

      {tab === 'publications' ? (
        <CreatorPublicPosts isMe={creator.isMe} />
      ) : null}

      {tab === 'evenements' ? (
        <section aria-label="Événements" className="space-y-3 px-4 py-3">
          {total === 0 ? (
            <EmptyState
              icon={Film}
              tone="info"
              title="Aucun événement"
              description="Les événements validés de ce créateur apparaîtront ici."
              className="py-10"
            />
          ) : null}

          {markets.length > 0 ? (
            <div className="space-y-3">
              <p className="text-caption font-bold text-muted-foreground">
                Creator Market · Cotes
              </p>
              {markets.map((market) => (
                <Link key={market.id} to={paths.marketEvent(market.id)} className={rowClass}>
                  <span className="grid size-10 shrink-0 place-items-center rounded-full bg-accent text-brand">
                    <Film className="size-5" aria-hidden="true" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-body font-bold">
                      {market.caption}
                    </span>
                    <span className="block truncate text-caption text-muted-foreground">
                      {market.title} · cote {formatCote(market.cote)}
                    </span>
                  </span>
                  <StatusBadge status={market.status} />
                </Link>
              ))}
            </div>
          ) : null}

          {coinEvents.length > 0 ? (
            <div className="space-y-3">
              <p className="flex items-center gap-2 pt-1 text-caption font-bold text-muted-foreground">
                <Coins className="size-4" aria-hidden="true" />
                Creator Market · Coins
              </p>
              {coinEvents.map((event) => (
                <CoinEventCard key={event.id} event={event} />
              ))}
            </div>
          ) : null}

          {mine.length > 0 ? (
            <div className="space-y-3">
              <p className="flex items-center justify-between gap-2 pt-1 text-caption font-bold text-muted-foreground">
                <span>Studio · gestion</span>
                <Link to={paths.studio} className="font-semibold text-brand hover:underline">
                  Ouvrir Studio
                </Link>
              </p>
              {mine.map((event) => (
                <Link key={event.id} to={paths.studioEvent(event.id)} className={rowClass}>
                  <span className="grid size-10 shrink-0 place-items-center rounded-full bg-accent text-brand">
                    <KindIcon kind={event.kind} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-body font-bold">
                      {getEventTitle(event)}
                    </span>
                    <span className="block truncate text-caption text-muted-foreground">
                      {STUDIO_KINDS[event.kind].label} · {formatEventStart(event)}
                    </span>
                  </span>
                  <StudioStatusPill status={event.status} />
                </Link>
              ))}
            </div>
          ) : null}
        </section>
      ) : null}

      {tab === 'publicite' ? <CreatorPublicAdPlans creator={creator} /> : null}

      {tab === 'apropos' ? (
        <section aria-label="À propos" className="space-y-3 px-4 py-3">
          <p className="text-body">{live.bio}</p>
          <p className="text-caption text-muted-foreground">
            Les cotes et les coins sont calculés par AfriConnect. Un créateur ne décide ni
            du résultat d’un événement ni des gains des participants.
          </p>
          {creator.isMe ? (
            <p className="text-caption text-muted-foreground">
              Profil synchronisé avec votre espace privé : bio, photo, posts, forfaits
              publicitaires publiés et événements Studio validés.
            </p>
          ) : (
            <p className="text-caption text-muted-foreground">
              Suivre ce créateur met à jour vos abonnements sur votre profil privé.
            </p>
          )}
        </section>
      ) : null}
    </>
  )
}
