import { Bell, Search } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useMemo, useSyncExternalStore } from 'react'

import { IconLink } from '@/components/common/IconLink'
import { Logo } from '@/components/common/Logo'
import { PageHeader } from '@/components/common/PageHeader'
import { ScrollRow } from '@/components/common/ScrollRow'
import { SectionDivider } from '@/components/common/SectionDivider'
import { EventCard } from '@/components/explore/EventCard'
import { PartnerOfferStrip } from '@/components/explore/PartnerOfferStrip'
import { FeedList } from '@/components/feed/FeedList'
import { LocalPosts } from '@/components/home/LocalPosts'
import { PostComposer } from '@/components/home/PostComposer'
import { StoriesRow } from '@/components/home/StoriesRow'
import { HomePromoPanel } from '@/components/home/HomePromoPanel'
import { useNotifications } from '@/hooks/use-notifications'
import { useNow } from '@/hooks/use-now'
import { useProfile } from '@/hooks/use-profile'
import { TEMP_STORIES } from '@/lib/placeholder-data'
import { getExploreMembershipOffers } from '@/lib/partner-offers'
import {
  getProExtrasRevision,
  subscribeProExtras,
} from '@/lib/pro-extras-store'
import { getPopularEvents } from '@/lib/recommendations'
import { paths } from '@/routes/paths'

const HOME_EVENTS = 8

/** Accueil style Facebook : logo + actions, events Market, composer, stories, fil. */
export function HomePage() {
  const { unread } = useNotifications()
  const profile = useProfile()
  const now = useNow(60_000)
  const proExtrasEpoch = useSyncExternalStore(
    subscribeProExtras,
    getProExtrasRevision,
  )
  const popularEvents = useMemo(
    () => getPopularEvents(now, HOME_EVENTS),
    // eslint-disable-next-line react-hooks/exhaustive-deps -- proExtrasEpoch = republish
    [now, proExtrasEpoch],
  )
  const membershipOffers = useMemo(
    () => getExploreMembershipOffers(8),
    // eslint-disable-next-line react-hooks/exhaustive-deps -- proExtrasEpoch = republish
    [proExtrasEpoch],
  )

  return (
    <div className="home-immersive">
      <PageHeader
        title={<Logo />}
        className="home-header-frosted"
        actions={
          <>
            <IconLink
              to={paths.search}
              icon={Search}
              label="Rechercher"
              variant="secondary"
              className="size-10 rounded-full border-0 bg-muted text-foreground shadow-none hover:bg-muted/80"
            />
            <IconLink
              to={paths.notifications}
              icon={Bell}
              label="Notifications"
              count={unread}
              variant="secondary"
              className="size-10 rounded-full border-0 bg-muted text-foreground shadow-none hover:bg-muted/80"
            />
          </>
        }
      />

      {popularEvents.length > 0 ? (
        <>
          <div className="home-immersive-surface space-y-2 py-3">
            <div className="flex items-end justify-between gap-3 px-4">
              <div className="min-w-0">
                <h2 className="text-[15px] font-extrabold tracking-tight">
                  Événements populaires
                </h2>
                <p className="text-[12px] text-muted-foreground">
                  Market Event · défilez pour découvrir
                </p>
              </div>
              <Link
                to={paths.events}
                className="shrink-0 text-[13px] font-bold text-brand"
              >
                Voir tout
              </Link>
            </div>
            <ScrollRow
              label="Événements Market populaires"
              className="snap-x snap-mandatory"
            >
              {popularEvents.map((event) => (
                <EventCard key={event.id} event={event} now={now} />
              ))}
            </ScrollRow>
          </div>
          <SectionDivider className="home-immersive-divider" />
        </>
      ) : null}

      {/* Bloc unique : composer puis stories (ordre Facebook). */}
      <div className="home-immersive-surface">
        <PostComposer
          userName={profile.name}
          firstName={profile.name.split(' ')[0] ?? profile.name}
          avatarSrc={profile.avatarSrc}
        />
        <div className="mx-4 border-t border-black/5" />
        <StoriesRow stories={TEMP_STORIES} />
      </div>
      <SectionDivider className="home-immersive-divider" />

      <div className="home-immersive-surface">
        <HomePromoPanel />
      </div>
      <SectionDivider className="home-immersive-divider" />

      {membershipOffers.length > 0 ? (
        <>
          <div className="home-immersive-surface py-2">
            <PartnerOfferStrip
              offers={membershipOffers}
              label="Cartes d’adhésion"
            />
          </div>
          <SectionDivider className="home-immersive-divider" />
        </>
      ) : null}

      <LocalPosts />
      <FeedList scope="home" />
    </div>
  )
}
