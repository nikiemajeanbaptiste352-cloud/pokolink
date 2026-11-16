import {
  CalendarDays,
  Check,
  Crown,
  Star,
} from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'

import {
  TelegramChannelFeed,
  type TelegramFeedPost,
} from '@/components/channel/TelegramChannelFeed'
import { EmptyState } from '@/components/common/EmptyState'
import { EventFeedCard } from '@/components/events/EventFeedCard'
import { EventSheet } from '@/components/events/EventSheet'
import { EventCard as MarketEventCard } from '@/components/explore/EventCard'
import { Media } from '@/components/common/Media'
import {
  ContactBand,
  OverviewCard,
  RatingDistribution,
} from '@/components/pro-public/ProProfileSections'
import { PostCard } from '@/components/pro-public/ProPostCard'
import { SectionCard } from '@/components/pro-public/SectionCard'
import { Rating } from '@/components/common/Rating'
import type { ProTabId } from '@/lib/pro-tabs'
import { CatalogPicker } from '@/components/services/CatalogPicker'
import { Button, buttonVariants } from '@/components/ui/button'
import type { PublicPro } from '@/hooks/use-public-pro'
import { getEstablishmentEventPath } from '@/lib/event-links'
import { proEventToMarketEvent } from '@/lib/pro-event-bridge'
import { formatCount, formatPrice } from '@/lib/format'
import type { MarketEvent } from '@/types/event'
import { PLAN_DURATION_LABEL } from '@/lib/pro-labels'
import { getSponsoredPublications } from '@/lib/ad-distribution'
import {
  formatAgo,
  getFeaturedEvent,
  getPublicEvents,
  getPublicPlans,
  getPublicPosts,
} from '@/lib/pro-public'
import { getServiceTypeMeta } from '@/lib/service-types'
import { paths } from '@/routes/paths'
import type { Plan, Review } from '@/types/pro'
import type { CatalogItem } from '@/types/service'

interface SectionProps {
  pro: PublicPro
  /** Heure courante, en millisecondes. */
  now: number
}

interface TabLinkProps {
  onSelectTab: (tab: ProTabId) => void
}

// ------------------------------------------------------------------ Éléments

/** Vignette catalogue style Amazon / Temu : image claire, nom + prix sous la photo. */
function PhotoTile({ item, pro }: { item: CatalogItem; pro: PublicPro }) {
  const meta = getServiceTypeMeta(pro.service.type)
  return (
    <li className="min-w-0">
      <Link
        to={paths.product(item.id)}
        className="flex flex-col overflow-hidden rounded-lg bg-[#f6f7f8] ring-1 ring-black/[0.05] transition-shadow hover:shadow-sm"
      >
        <Media
          src={item.image || undefined}
          alt=""
          icon={meta.icon}
          tone={meta.tone}
          className="aspect-square w-full"
        />
        <span className="space-y-0.5 bg-card px-1.5 py-1.5">
          <span className="line-clamp-2 min-h-7 text-[11px] leading-snug font-medium">
            {item.name}
          </span>
          <span className="block truncate text-[12px] font-extrabold text-gold tabular-nums">
            {formatPrice(item.price)}
          </span>
        </span>
      </Link>
    </li>
  )
}

function PlanCard({ plan, pro }: { plan: Plan; pro: PublicPro }) {
  const [params] = useSearchParams()
  const aff = params.get('aff') ?? params.get('ref')
  const payable = plan.price > 0
  const subscribePath = paths.subscribe(pro.service.username, plan.id)
  const subscribeTo = aff
    ? `${subscribePath}?aff=${encodeURIComponent(aff)}`
    : subscribePath
  return (
    <li className="space-y-2 rounded-xl border bg-card p-4 shadow-card">
      <h3 className="text-title font-extrabold">{plan.name}</h3>
      <p className="text-title font-extrabold text-brand tabular-nums">
        {payable ? formatPrice(plan.price) : 'Sur devis'}
        {payable ? (
          <span className="text-caption font-normal text-muted-foreground">
            {' '}
            · {PLAN_DURATION_LABEL[plan.duration]}
          </span>
        ) : null}
      </p>
      {plan.description ? (
        <p className="text-body text-muted-foreground">{plan.description}</p>
      ) : null}
      <ul className="space-y-1 text-body">
        {plan.benefits.map((benefit) => (
          <li key={benefit} className="flex items-start gap-2">
            <Check className="mt-0.5 size-4 shrink-0 text-brand" aria-hidden="true" />
            {benefit}
          </li>
        ))}
      </ul>
      {plan.conditions ? (
        <p className="text-caption text-muted-foreground">{plan.conditions}</p>
      ) : null}
      {pro.owned ? (
        <p className="text-caption text-muted-foreground">
          C’est votre forfait : les clients voient ici le bouton « Souscrire ».
        </p>
      ) : payable ? (
        <Link
          to={subscribeTo}
          className={buttonVariants({ size: 'lg', className: 'w-full' })}
        >
          <Crown aria-hidden="true" />
          Souscrire
          <span className="sr-only"> au forfait {plan.name}</span>
        </Link>
      ) : (
        <p className="text-caption text-muted-foreground">
          Contactez l’établissement pour obtenir un devis.
        </p>
      )}
    </li>
  )
}

function ReviewItem({ review, now }: { review: Review; now: number }) {
  return (
    <li className="space-y-1 rounded-xl bg-muted p-3">
      <p className="flex flex-wrap items-center gap-2 text-body">
        <strong>{review.customerName}</strong>
        <Rating value={review.rating} />
        <span className="text-caption text-muted-foreground">
          {formatAgo(review.createdAt, now)}
        </span>
      </p>
      <p className="text-body">{review.comment}</p>
      {review.reply ? (
        <p className="rounded-lg bg-background p-2 text-caption text-muted-foreground">
          <strong className="text-foreground">Réponse de l’établissement :</strong>{' '}
          {review.reply.comment}
        </p>
      ) : null}
    </li>
  )
}

function RatingSummary({ pro }: { pro: PublicPro }) {
  if (pro.rating === null) {
    return <p className="text-body text-muted-foreground">Pas encore d’avis.</p>
  }
  return (
    <div className="grid gap-3 sm:grid-cols-[auto_minmax(0,1fr)] sm:items-center sm:gap-6">
      <p className="flex items-center gap-3">
        <span className="text-4xl leading-none font-extrabold tabular-nums">
          {pro.rating.toFixed(1).replace('.', ',')}
          <span className="text-body font-bold text-muted-foreground">/5</span>
        </span>
        <Rating value={pro.rating} count={pro.reviewCount} />
      </p>
      <RatingDistribution reviews={pro.extras.reviews} total={pro.reviewCount} />
    </div>
  )
}

// ---------------------------------------------------------------------- Onglets

/**
 * Accueil storefront : sélection catalogue, événements, forfaits, avis — style Amazon / Alibaba.
 */
export function HomeTab({
  pro,
  now,
  onSelectTab,
  onContact,
}: SectionProps & TabLinkProps & { onContact: () => void }) {
  const organic = getPublicPosts(pro.extras)
  const sponsored = getSponsoredPublications(pro.service.id)
  const posts = [...sponsored, ...organic]
  const feed = posts.slice(0, 2)
  const featured = getFeaturedEvent(getPublicEvents(pro.extras), now)
  const featuredMarket = featured
    ? proEventToMarketEvent(featured, pro.service)
    : null
  const plans = getPublicPlans(pro.extras).slice(0, 3)
  const latestReview = pro.extras.reviews[0]
  const meta = getServiceTypeMeta(pro.service.type)
  const establishmentRef = pro.service.username || pro.service.id

  return (
    <div className="space-y-3 bg-[#f4f5f7] px-3 pt-3 pb-4">
      <OverviewCard pro={pro} onSelectTab={onSelectTab} />

      {pro.items.length > 0 ? (
        <SectionCard
          title={`Populaires · ${meta.catalogLabel}`}
          seeAll="Tout voir"
          onSeeAll={() => onSelectTab('catalogue')}
        >
          <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {pro.items.slice(0, 6).map((item) => (
              <PhotoTile key={item.id} item={item} pro={pro} />
            ))}
          </ul>
        </SectionCard>
      ) : null}

      {featuredMarket ? (
        <SectionCard
          title="Événements Market Event"
          seeAll="Voir tout"
          onSeeAll={() => onSelectTab('evenements')}
        >
          <MarketEventCard
            event={featuredMarket}
            now={now}
            fluid
            to={getEstablishmentEventPath(featuredMarket.id, establishmentRef)}
          />
        </SectionCard>
      ) : null}

      {plans.length > 0 ? (
        <SectionCard
          title="Forfaits d’abonnement"
          seeAll="Souscrire"
          onSeeAll={() => onSelectTab('abonnements')}
        >
          <ul className="grid gap-2">
            {plans.map((plan) => (
              <li
                key={plan.id}
                className="flex items-center justify-between gap-3 rounded-xl bg-muted p-3"
              >
                <span className="min-w-0 font-bold">{plan.name}</span>
                <span className="shrink-0 text-body font-extrabold text-brand tabular-nums">
                  {plan.price > 0 ? formatPrice(plan.price) : 'Sur devis'}
                </span>
              </li>
            ))}
          </ul>
        </SectionCard>
      ) : null}

      {feed.length > 0 ? (
        <>
          <h2 className="px-1 pt-1 text-title font-extrabold">Publications</h2>
          <ul className="space-y-3">
            {feed.map((post) => (
              <li key={post.id}>
                <PostCard post={post} pro={pro} now={now} />
              </li>
            ))}
          </ul>
          {posts.length > feed.length ? (
            <Button
              type="button"
              variant="outline"
              size="lg"
              className="w-full bg-card"
              onClick={() => onSelectTab('publications')}
            >
              Voir toutes les publications
            </Button>
          ) : null}
        </>
      ) : null}

      <SectionCard title="Avis" seeAll="Voir tous" onSeeAll={() => onSelectTab('avis')}>
        <RatingSummary pro={pro} />
        {latestReview ? (
          <ul>
            <ReviewItem review={latestReview} now={now} />
          </ul>
        ) : null}
      </SectionCard>

      <ContactBand pro={pro} onContact={onContact} onSelectTab={onSelectTab} />
    </div>
  )
}

/** Catalogue complet, grille marketplace dense (Amazon / Temu). */
export function CatalogueTab({
  pro,
  quantities,
  onAdd,
  onRemove,
  highlightId,
}: {
  pro: PublicPro
  quantities: ReadonlyMap<string, number>
  onAdd: (item: CatalogItem) => void
  onRemove: (item: CatalogItem) => void
  /** Produit à mettre en évidence (ouvert depuis une carte d'Explorer). */
  highlightId?: string | undefined
}) {
  const meta = getServiceTypeMeta(pro.service.type)
  return (
    <section className="space-y-3 bg-[#f4f5f7] pt-3 pb-4">
      <div className="flex items-end justify-between gap-3 px-4">
        <div>
          <h2 className="text-[17px] font-extrabold tracking-tight">{meta.catalogLabel}</h2>
          <p className="text-[11px] text-muted-foreground">
            {pro.items.length} article{pro.items.length > 1 ? 's' : ''} · prix en FCFA
          </p>
        </div>
      </div>
      <CatalogPicker
        serviceType={pro.service.type}
        items={pro.items}
        quantities={quantities}
        onAdd={onAdd}
        onRemove={onRemove}
        highlightId={highlightId}
      />
    </section>
  )
}

/**
 * Fil Market Event sur la page publique : mêmes cartes ; Participer ouvre
 * le panneau adapté à l’événement.
 */
export function EventsTab({
  pro,
  now,
  initialEventId,
}: SectionProps & { initialEventId?: string | null }) {
  const [openEvent, setOpenEvent] = useState<MarketEvent | null>(null)
  const [openedDeepLink, setOpenedDeepLink] = useState<string | null>(null)
  const marketEvents = useMemo(
    () =>
      getPublicEvents(pro.extras).map((event) =>
        proEventToMarketEvent(event, pro.service),
      ),
    [pro.extras, pro.service],
  )

  const deepMatch =
    initialEventId != null
      ? (marketEvents.find((event) => event.id === initialEventId) ?? null)
      : null
  if (deepMatch && openedDeepLink !== deepMatch.id) {
    setOpenedDeepLink(deepMatch.id)
    setOpenEvent(deepMatch)
  }

  function handleOpenEvent(target: MarketEvent) {
    setOpenEvent(target)
  }

  if (marketEvents.length === 0) {
    return (
      <section className="space-y-3 px-4 pb-4">
        <EmptyState
          icon={CalendarDays}
          title="Aucun événement publié"
          description={
            pro.owned
              ? 'Créez et publiez un événement dans votre Espace Pro → Événements.'
              : 'Les événements publiés par cet établissement apparaîtront ici.'
          }
          action={
            pro.owned ? (
              <Link
                to={`${paths.service(pro.service.id)}/evenements`}
                className={buttonVariants()}
              >
                Ouvrir Événements (Espace Pro)
              </Link>
            ) : undefined
          }
          className="py-6"
        />
      </section>
    )
  }

  return (
    <section className="relative bg-neutral-900">
      <h2 className="sr-only">Événements Market Event</h2>
      <div
        role="region"
        aria-label="Fil des événements"
        tabIndex={0}
        className="max-h-[min(40rem,calc(100dvh-8rem))] snap-y snap-mandatory overflow-y-auto overscroll-contain scrollbar-none focus-visible:outline-2 focus-visible:-outline-offset-4 focus-visible:outline-white"
      >
        {marketEvents.map((event) => (
          <div key={event.id} className="h-[min(36rem,70dvh)] shrink-0 snap-start snap-always">
            <EventFeedCard event={event} now={now} onOpen={handleOpenEvent} />
          </div>
        ))}
      </div>
      <EventSheet
        event={openEvent}
        now={now}
        onClose={() => setOpenEvent(null)}
      />
    </section>
  )
}

export function PostsTab({ pro }: SectionProps) {
  const organic = getPublicPosts(pro.extras)
  const sponsored = getSponsoredPublications(pro.service.id)
  const seen = new Set(sponsored.map((post) => post.id))
  const posts = [...sponsored, ...organic.filter((post) => !seen.has(post.id))]
  const channelName = pro.extras.channel.name || pro.service.name
  const feedPosts: TelegramFeedPost[] = [...posts]
    .sort((a, b) => {
      const ta = Date.parse(a.publishedAt || a.createdAt)
      const tb = Date.parse(b.publishedAt || b.createdAt)
      return ta - tb
    })
    .map((post) => {
      const image = post.media.find((m) => m.kind === 'image' && m.src)?.src
      const text = [post.title.trim(), post.description.trim()]
        .filter(Boolean)
        .join('\n\n')
      return {
        id: post.id,
        text: text || 'Publication',
        createdAt: Date.parse(post.publishedAt || post.createdAt) || 0,
        views: post.views,
        author: channelName,
        ...(image ? { imageSrc: image } : {}),
        ...(post.sponsored ? { badge: 'Sponsorisé' } : {}),
      }
    })

  return (
    <section className="bg-muted/40">
      <h2 className="sr-only">Publications</h2>
      <TelegramChannelFeed
        title={channelName}
        subtitle={`${formatCount(pro.extras.members.length)} abonné${pro.extras.members.length > 1 ? 's' : ''} · lecture publique`}
        avatarSrc={pro.extras.channel.avatar || undefined}
        description={
          pro.extras.channel.description ||
          `Actualités de ${pro.service.name}.`
        }
        tagline={pro.service.name}
        posts={feedPosts}
        className="h-[min(70dvh,36rem)] md:h-[min(70dvh,36rem)]"
        readOnlyFooter={
          <p className="mx-auto max-w-[34rem] text-center text-[12px] text-[#6d7a88]">
            Canal public · abonnez-vous depuis la fiche établissement
          </p>
        }
      />
    </section>
  )
}

export function ReviewsTab({ pro, now }: SectionProps) {
  const reviews = pro.extras.reviews
  return (
    <section className="space-y-3 px-4 pb-4">
      <h2 className="text-title font-bold">Avis</h2>
      <RatingSummary pro={pro} />
      {reviews.length === 0 ? (
        <EmptyState
          icon={Star}
          tone="gold"
          title="Pas encore d’avis"
          description="Les avis des clients apparaîtront ici."
          className="py-6"
        />
      ) : (
        <ul className="space-y-2">
          {reviews.map((review) => (
            <ReviewItem key={review.id} review={review} now={now} />
          ))}
        </ul>
      )}
    </section>
  )
}

export function PlansTab({ pro }: { pro: PublicPro }) {
  const plans = getPublicPlans(pro.extras)
  return (
    <section className="space-y-3 bg-muted/50 px-3 pt-3 pb-4">
      <h2 className="px-1 text-title font-extrabold">Abonnements</h2>
      {plans.length === 0 ? (
        <EmptyState
          icon={Crown}
          title="Aucun forfait"
          description="Cet établissement ne propose pas de forfait pour le moment."
          className="py-6"
        />
      ) : (
        <>
          <p className="px-1 text-body text-muted-foreground">
            Payez avec votre Wallet : vous recevez une carte d’abonnement avec un QR code,
            à présenter au prestataire.
          </p>
          <ul className="space-y-3">
            {plans.map((plan) => (
              <PlanCard key={plan.id} plan={plan} pro={pro} />
            ))}
          </ul>
        </>
      )}
    </section>
  )
}
