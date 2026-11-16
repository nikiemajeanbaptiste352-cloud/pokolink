import { SearchX } from 'lucide-react'
import { Fragment, useMemo, useState, useSyncExternalStore } from 'react'

import { EmptyState } from '@/components/common/EmptyState'
import { SectionDivider } from '@/components/common/SectionDivider'
import { PartnerOfferStrip } from '@/components/explore/PartnerOfferStrip'
import { FeedFilters } from '@/components/feed/FeedFilters'
import { FeedItemView } from '@/components/feed/FeedItemView'
import { useNow } from '@/hooks/use-now'
import { getStoredCampaigns, subscribeCampaigns } from '@/lib/ad-campaigns-store'
import { buildFeed, matchesFeedFilter, type FeedFilter } from '@/lib/feed'
import { partnerOffersForFeedItem } from '@/lib/partner-offers'
import {
  getProExtrasRevision,
  subscribeProExtras,
} from '@/lib/pro-extras-store'
import { useServices } from '@/hooks/use-services'

/** Fil immersif : filtres par type, puis les cartes séparées par une bande épaisse. */
export function FeedList({ scope }: { scope: 'home' | 'explore' }) {
  const now = useNow(30_000)
  const [filter, setFilter] = useState<FeedFilter>('all')
  // Relire les campagnes actives pour injecter les annonces sponsorisées.
  const campaigns = useSyncExternalStore(subscribeCampaigns, getStoredCampaigns)
  const proExtrasEpoch = useSyncExternalStore(
    subscribeProExtras,
    getProExtrasRevision,
  )
  const { items: catalogItems } = useServices()
  const items = useMemo(
    () => buildFeed(scope, now),
    // campaigns / extras / catalogue → le fil se met à jour.
    // eslint-disable-next-line react-hooks/exhaustive-deps -- volontaire
    [scope, campaigns, proExtrasEpoch, catalogItems, now],
  )
  const visible = items.filter((item) => matchesFeedFilter(item, filter))

  return (
    <section aria-label="Fil d’actualité" className="home-feed">
      <FeedFilters value={filter} onChange={setFilter} />
      {visible.length > 0 ? (
        visible.map((item) => {
          const offers = partnerOffersForFeedItem(item, 3)
          return (
            <Fragment key={item.id}>
              <div className="home-feed-card">
                <FeedItemView item={item} now={now} />
                {offers.length > 0 ? (
                  <PartnerOfferStrip
                    offers={offers}
                    label="Offres du partenaire"
                    className="border-t bg-muted/25 pt-2"
                  />
                ) : null}
              </div>
              <SectionDivider className="home-immersive-divider" />
            </Fragment>
          )
        })
      ) : (
        <EmptyState
          icon={SearchX}
          title="Rien à afficher"
          description="Aucun contenu de ce type pour le moment."
          className="py-16"
        />
      )}
    </section>
  )
}
