import {
  Bell,
  ChevronRight,
  GraduationCap,
  Mic,
  Percent,
  Search,
  SearchX,
  Sparkles,
  X,
} from 'lucide-react'
import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react'

import { EmptyState } from '@/components/common/EmptyState'
import { IconLink } from '@/components/common/IconLink'
import { PageHeader } from '@/components/common/PageHeader'
import { SearchField } from '@/components/common/SearchField'
import { CategoryCard } from '@/components/explore/CategoryCard'
import { EventCard } from '@/components/explore/EventCard'
import { ExploreSection } from '@/components/explore/ExploreSection'
import { LocationBar } from '@/components/explore/LocationBar'
import { ProductCard } from '@/components/explore/ProductCard'
import { RestaurantCard } from '@/components/explore/RestaurantCard'
import { ServiceCard } from '@/components/explore/ServiceCard'
import { PartnerOfferCard } from '@/components/explore/PartnerOfferCard'
import { SponsoredExploreCard } from '@/components/explore/SponsoredExploreCard'
import { Button } from '@/components/ui/button'
import { useNotifications } from '@/hooks/use-notifications'
import { useNow } from '@/hooks/use-now'
import { useServices } from '@/hooks/use-services'
import { getStoredCampaigns, subscribeCampaigns } from '@/lib/ad-campaigns-store'
import {
  countForTarget,
  EXPLORE_CITIES,
  EXPLORE_PROS,
  EXPLORE_RESTAURANTS,
  getLiveExploreEvents,
  getLiveExploreProducts,
  isRestaurantTarget,
  selectEvents,
  selectProducts,
  selectPros,
  selectRestaurants,
} from '@/lib/explore'
import { TEMP_CATEGORIES } from '@/lib/placeholder-explore'
import {
  getExploreMembershipOffers,
  getExplorePartnerOffers,
} from '@/lib/partner-offers'
import {
  getProExtrasRevision,
  subscribeProExtras,
} from '@/lib/pro-extras-store'
import {
  getPopularEvents,
  getPopularProducts,
  getRecommendedPros,
  getSponsoredRecommendations,
} from '@/lib/recommendations'
import { paths } from '@/routes/paths'
import type { Category } from '@/types/explore'

const HOME_EVENTS = 8
const HOME_DEALS = 8
const HOME_PRODUCTS = 8
const HOME_PROS = 6
const HOME_RESTAURANTS = 6

const CATEGORIES: readonly Category[] = TEMP_CATEGORIES.map((category) =>
  category.target ? { ...category, count: countForTarget(category.target) } : category,
)

/**
 * Marketplace AfriConnect : catégories, puis événements populaires en tête,
 * suivi des offres / produits / boutiques.
 */
export function ExplorePage() {
  const now = useNow(60_000)
  const { unread } = useNotifications()
  const searchRef = useRef<HTMLInputElement>(null)
  const [searchOpen, setSearchOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [city, setCity] = useState<string | null>(null)
  const [categoryId, setCategoryId] = useState<string | null>(null)
  // Même store publicitaire que le panneau Accueil / fil Accueil.
  const campaigns = useSyncExternalStore(subscribeCampaigns, getStoredCampaigns)
  // Forfaits / events / produits publiés depuis l’Espace Pro.
  const proExtrasEpoch = useSyncExternalStore(
    subscribeProExtras,
    getProExtrasRevision,
  )
  const { items: catalogItems } = useServices()

  const category = CATEGORIES.find((item) => item.id === categoryId)
  const target = category?.target ?? null
  const browsing = categoryId !== null
  const restaurantBrowse = isRestaurantTarget(target)
  const showProducts = !browsing || target?.section === 'products' || target === null
  const showPros = !browsing || (target?.section === 'pro' && !restaurantBrowse)
  const showRestaurants = !browsing || restaurantBrowse

  const filters = useMemo(() => ({ query, city, target }), [query, city, target])
  const liveProducts = useMemo(
    () => getLiveExploreProducts(),
    // eslint-disable-next-line react-hooks/exhaustive-deps -- catalogue + extras
    [proExtrasEpoch, catalogItems],
  )
  const liveEvents = useMemo(
    () => getLiveExploreEvents(),
    // eslint-disable-next-line react-hooks/exhaustive-deps -- events Pro
    [proExtrasEpoch],
  )
  const products = useMemo(
    () => selectProducts(liveProducts, filters),
    [liveProducts, filters],
  )
  const deals = useMemo(
    () => products.filter((product) => product.promoPrice !== undefined),
    [products],
  )
  const pros = useMemo(() => selectPros(EXPLORE_PROS, filters), [filters])
  const restaurants = useMemo(
    () => selectRestaurants(EXPLORE_RESTAURANTS, { query }),
    [query],
  )
  const events = useMemo(
    () => selectEvents(liveEvents, { query, city, target: null }, now),
    [liveEvents, query, city, now],
  )

  const sponsored = useMemo(
    () =>
      getSponsoredRecommendations('explore', 6).flatMap((item) =>
        item.kind === 'ad' ? [item] : [],
      ),
    // eslint-disable-next-line react-hooks/exhaustive-deps -- campaigns déclenche le refresh
    [campaigns],
  )
  const popularEventsHome = useMemo(
    () => getPopularEvents(now, HOME_EVENTS),
    // eslint-disable-next-line react-hooks/exhaustive-deps -- proExtrasEpoch
    [now, proExtrasEpoch],
  )
  const popularProductsHome = useMemo(
    () => getPopularProducts(HOME_PRODUCTS),
    // eslint-disable-next-line react-hooks/exhaustive-deps -- catalogue live
    [proExtrasEpoch, catalogItems],
  )
  const recommendedProsHome = useMemo(() => getRecommendedPros(HOME_PROS), [])
  const membershipOffers = useMemo(
    () => getExploreMembershipOffers(8),
    // eslint-disable-next-line react-hooks/exhaustive-deps -- proExtrasEpoch = republish
    [proExtrasEpoch],
  )
  const partnerOffers = useMemo(
    () => getExplorePartnerOffers(8),
    // eslint-disable-next-line react-hooks/exhaustive-deps -- proExtrasEpoch = republish
    [proExtrasEpoch],
  )

  const home = !browsing && query === '' && city === null
  const filteredEmpty =
    (showProducts ? products.length === 0 : true) &&
    (showPros ? pros.length === 0 : true) &&
    (showRestaurants && restaurantBrowse ? restaurants.length === 0 : true)
  const nothing = !home && filteredEmpty && (browsing || events.length === 0)

  useEffect(() => {
    if (!searchOpen) return
    searchRef.current?.focus()
  }, [searchOpen])

  function selectCategory(next: Category) {
    setCategoryId((current) => (current === next.id ? null : next.id))
  }

  function reset() {
    setQuery('')
    setCity(null)
    setCategoryId(null)
  }

  function closeSearch() {
    setSearchOpen(false)
    setQuery('')
  }

  function seeAllProducts() {
    const produits = CATEGORIES.find((item) => item.id === 'produits')
    if (produits) setCategoryId(produits.id)
  }

  return (
    <>
      <PageHeader
        title="Explorer"
        large
        actions={
          <>
            <Button
              type="button"
              size="icon"
              variant="secondary"
              aria-label={searchOpen ? 'Fermer la recherche' : 'Rechercher'}
              aria-expanded={searchOpen}
              aria-controls="explore-search"
              onClick={() => {
                if (searchOpen) closeSearch()
                else setSearchOpen(true)
              }}
            >
              {searchOpen ? (
                <X className="size-5" aria-hidden="true" />
              ) : (
                <Search className="size-5" aria-hidden="true" />
              )}
            </Button>
            <IconLink to={paths.learn} icon={GraduationCap} label="AfriLearn" />
            <IconLink
              to={paths.notifications}
              icon={Bell}
              label="Notifications"
              count={unread}
            />
          </>
        }
      />

      {searchOpen ? (
        <div
          id="explore-search"
          className="sticky top-(--header-height) z-10 space-y-2 border-b bg-background/95 px-4 pt-2.5 pb-2 backdrop-blur"
        >
          <SearchField
            ref={searchRef}
            label="Rechercher un produit, un service ou un événement"
            placeholder="Produit, boutique, restaurant…"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            trailing={<Mic className="size-5" aria-hidden="true" />}
            className="bg-card shadow-sm ring-1 ring-border"
          />
          <LocationBar value={city} cities={EXPLORE_CITIES} onChange={setCity} />
        </div>
      ) : null}

      <div className="page-body gap-4 pb-4">
        {home && sponsored.length > 0 ? (
          <ExploreSection
            id="explore-sponsored"
            title="Sponsorisé"
            description="Publicité · canal Explorer"
            rowLabel="Annonces sponsorisées"
            layout="rail"
          >
            {sponsored.map((item) => (
              <SponsoredExploreCard key={item.id} item={item} />
            ))}
          </ExploreSection>
        ) : null}

        {home && popularEventsHome.length > 0 ? (
          <ExploreSection
            id="explore-events-popular"
            title="Événements populaires"
            description="Market Event · recommandés Accueil & Explorer"
            to={paths.events}
            rowLabel="Événements populaires"
            layout="rail"
          >
            {popularEventsHome.map((event) => (
              <EventCard key={event.id} event={event} now={now} />
            ))}
          </ExploreSection>
        ) : null}

        {home && membershipOffers.length > 0 ? (
          <ExploreSection
            id="explore-membership-offers"
            title="Cartes d’adhésion"
            description="Forfaits publiés · souscription directe"
            rowLabel="Cartes d’adhésion"
            layout="rail"
          >
            {membershipOffers.map((offer) => (
              <PartnerOfferCard key={offer.id} offer={offer} />
            ))}
          </ExploreSection>
        ) : null}

        {home && partnerOffers.length > 0 ? (
          <ExploreSection
            id="explore-partner-offers"
            title="Offres partenaires"
            description="Adhésions · forfaits pub · affiliation · photo → profil · carte → détail"
            rowLabel="Offres partenaires"
            layout="rail"
          >
            {partnerOffers.map((offer) => (
              <PartnerOfferCard key={offer.id} offer={offer} />
            ))}
          </ExploreSection>
        ) : null}

        {!home && (query !== '' || city !== null) && events.length > 0 ? (
          <ExploreSection
            id="explore-events-filtered"
            title="Événements"
            description="Résultats Market Event"
            to={paths.events}
            rowLabel="Événements"
            layout="rail"
          >
            {events.slice(0, HOME_EVENTS).map((event) => (
              <EventCard key={event.id} event={event} now={now} />
            ))}
          </ExploreSection>
        ) : null}

        {browsing ? (
          <div className="flex items-center justify-between gap-3 px-4">
            <p className="text-caption text-muted-foreground">
              <span className="font-bold text-foreground">{category?.label}</span>
              {showProducts && products.length > 0
                ? ` · ${products.length} article${products.length > 1 ? 's' : ''}`
                : null}
              {showPros && pros.length > 0
                ? ` · ${pros.length} service${pros.length > 1 ? 's' : ''}`
                : null}
            </p>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="shrink-0"
              onClick={() => setCategoryId(null)}
            >
              Tout
            </Button>
          </div>
        ) : null}

        {/* Filtre catégorie : grille produits / services */}
        {browsing && showProducts && products.length > 0 ? (
          <ExploreSection
            id="explore-products-filtered"
            title={category?.label ?? 'Produits'}
            description="Touchez une carte pour ouvrir la fiche"
            rowLabel="Produits"
            layout="grid"
            gridClassName="grid-cols-2 gap-3 sm:grid-cols-3"
          >
            {products.map((product) => (
              <ProductCard key={product.id} product={product} fluid />
            ))}
          </ExploreSection>
        ) : null}

        {browsing && restaurantBrowse && restaurants.length > 0 ? (
          <ExploreSection
            id="explore-restaurants-filtered"
            title="Restaurants"
            description="Ouverts près de vous"
            rowLabel="Restaurants"
            layout="grid"
            gridClassName="grid-cols-2 gap-3 sm:grid-cols-3"
          >
            {restaurants.map((restaurant) => (
              <RestaurantCard key={restaurant.id} restaurant={restaurant} fluid />
            ))}
          </ExploreSection>
        ) : null}

        {browsing && showPros && pros.length > 0 ? (
          <ExploreSection
            id="explore-pros-filtered"
            title={category?.label ?? 'Services'}
            description="Établissements et prestataires"
            rowLabel="Services Pro"
            layout="grid"
            gridClassName="grid-cols-1 gap-3 sm:grid-cols-2"
          >
            {pros.map((pro) => (
              <ServiceCard key={pro.service.id} pro={pro} fluid />
            ))}
          </ExploreSection>
        ) : null}

        {/* Accueil : rails puis grille */}
        {!browsing ? (
          <>
            {deals.length > 0 ? (
              <ExploreSection
                id="explore-deals"
                title="Offres du moment"
                description="Promotions en cours"
                rowLabel="Promotions"
                layout="rail"
                action={
                  <button
                    type="button"
                    onClick={seeAllProducts}
                    className="-my-2 -mr-1 inline-flex min-h-11 items-center gap-0.5 rounded-full px-1 text-caption font-semibold text-muted-foreground hover:text-foreground"
                  >
                    <Percent className="size-3.5" aria-hidden="true" />
                    Voir tout
                    <ChevronRight className="size-4" aria-hidden="true" />
                  </button>
                }
              >
                {deals.slice(0, HOME_DEALS).map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </ExploreSection>
            ) : null}

            <ExploreSection
              id="explore-categories"
              title="Catégories"
              description="Top et services près de vous"
              rowLabel="Catégories"
              layout="rail"
            >
              {CATEGORIES.map((item) => (
                <CategoryCard
                  key={item.id}
                  category={item}
                  selected={item.id === categoryId}
                  onSelect={selectCategory}
                />
              ))}
            </ExploreSection>

            {popularProductsHome.length > 0 ? (
              <ExploreSection
                id="explore-products"
                title="Produits populaires"
                description="Même sélection recommandée que l’Accueil"
                rowLabel="Produits"
                layout="grid"
                gridClassName="grid-cols-2 gap-3 sm:grid-cols-3"
                action={
                  <button
                    type="button"
                    onClick={seeAllProducts}
                    className="-my-2 -mr-1 inline-flex min-h-11 items-center gap-0.5 rounded-full px-1 text-caption font-semibold text-muted-foreground hover:text-foreground"
                  >
                    <Sparkles className="size-3.5" aria-hidden="true" />
                    Voir tout
                    <ChevronRight className="size-4" aria-hidden="true" />
                  </button>
                }
              >
                {popularProductsHome.map((product) => (
                  <ProductCard key={product.id} product={product} fluid />
                ))}
              </ExploreSection>
            ) : null}

            {recommendedProsHome.length > 0 ? (
              <ExploreSection
                id="explore-pros"
                title="Boutiques & services"
                description="Recommandés près de vous"
                rowLabel="Services Pro"
                layout="rail"
              >
                {recommendedProsHome.map((pro) => (
                  <ServiceCard key={pro.service.id} pro={pro} />
                ))}
              </ExploreSection>
            ) : null}

            {restaurants.length > 0 ? (
              <ExploreSection
                id="explore-restaurants"
                title="Restaurants"
                description="Distance, délai et ouverture"
                rowLabel="Restaurants"
                layout="rail"
                action={
                  <button
                    type="button"
                    onClick={() => {
                      const next = CATEGORIES.find((item) => item.id === 'restaurants')
                      if (next) setCategoryId(next.id)
                    }}
                    className="-my-2 -mr-1 inline-flex min-h-11 items-center gap-0.5 rounded-full px-1 text-caption font-semibold text-muted-foreground hover:text-foreground"
                  >
                    Voir tout
                    <ChevronRight className="size-4" aria-hidden="true" />
                  </button>
                }
              >
                {restaurants.slice(0, HOME_RESTAURANTS).map((restaurant) => (
                  <RestaurantCard key={restaurant.id} restaurant={restaurant} />
                ))}
              </ExploreSection>
            ) : null}

            {!home && events.length > 0 ? (
              <ExploreSection
                id="explore-events"
                title="Événements"
                description="Market Event : offres, lives et tirages"
                to={paths.events}
                rowLabel="Événements"
                layout="rail"
              >
                {events.map((event) => (
                  <EventCard key={event.id} event={event} now={now} />
                ))}
              </ExploreSection>
            ) : null}
          </>
        ) : null}

        {nothing ? (
          <EmptyState
            icon={SearchX}
            title="Aucun résultat"
            description="Essayez une autre catégorie, un autre mot ou une autre ville."
            action={
              <Button type="button" variant="outline" onClick={reset}>
                Réinitialiser
              </Button>
            }
            className="py-10"
          />
        ) : null}
      </div>
    </>
  )
}
