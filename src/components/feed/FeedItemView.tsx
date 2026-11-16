import { Coins, Gift, Megaphone, Package, Star, Store, TrendingUp, Users } from 'lucide-react'

import { FeedCard, type FeedAuthor } from '@/components/feed/FeedCard'
import { FeedVisual } from '@/components/feed/FeedVisual'
import { PostCard } from '@/components/home/PostCard'
import { COIN_STATE_LABEL, formatIndex } from '@/components/market/coins/coin-utils'
import { formatCote, STATUS_LABEL } from '@/components/market/market-utils'
import { AD_CTA_LABEL, getAdPack } from '@/lib/ad-packs'
import {
  EVENT_HUES,
  EVENT_KINDS,
  EVENT_STATE_LABEL,
  formatCountdown,
  getDiscountPercent,
  getEventState,
  hasParticipationPage,
} from '@/lib/events'
import { getFeedPath } from '@/lib/feed'
import { formatCount, formatPrice, formatRating } from '@/lib/format'
import { getEventHostProfilePath, proProfilePath } from '@/lib/messaging-contexts'
import { hueOf } from '@/lib/hue'
import { formatAgo } from '@/lib/pro-public'
import { cn } from '@/lib/utils'
import { paths } from '@/routes/paths'
import type { FeedItem } from '@/types/feed'

/** Teintes provisoires des vidéos du Creator Market (comme dans le fil plein écran). */
const CREATOR_HUES = [150, 28, 285, 210] as const

/** Légende suivie de ses mots-clés : « Légende #Cuisine #Dakar ». */
function withHashtags(caption: string, tags: readonly string[]): string {
  return [caption, ...tags.map((tag) => `#${tag}`)].join(' ')
}

const chip =
  'inline-flex items-center gap-1 rounded-full bg-black/55 px-2 py-0.5 text-caption font-bold'

interface FeedItemViewProps {
  item: FeedItem
  /** Heure courante (voir `useNow`). */
  now: number
}

/** Une carte du fil : chaque type de contenu mène à son propre espace de diffusion. */
export function FeedItemView({ item, now }: FeedItemViewProps) {
  const to = getFeedPath(item)

  switch (item.kind) {
    case 'post':
      return <PostCard post={item.post} />

    case 'event': {
      const { event } = item
      const state = getEventState(event, now)
      const { icon: KindIcon, label } = EVENT_KINDS[event.kind]
      const author: FeedAuthor = {
        name: event.host.name,
        avatarSrc: event.host.avatarSrc,
        verified: event.host.verified,
        to: getEventHostProfilePath(event),
      }
      const offer = event.offer
      const percent = offer ? getDiscountPercent(offer.normalPrice, offer.eventPrice) : 0
      const countdown =
        state === 'upcoming'
          ? `Début dans ${formatCountdown(event.startsAt - now)}`
          : `Fin dans ${formatCountdown(event.endsAt - now)}`
      return (
        <FeedCard
          author={author}
          badge={{ label: 'Market Event', icon: KindIcon }}
          time={EVENT_STATE_LABEL[state]}
          title={event.title}
          text={event.description}
          visual={
            <FeedVisual
              to={to!}
              label={`Ouvrir l’événement : ${event.title}`}
              hue={EVENT_HUES[event.kind]}
              icon={KindIcon}
              video={event.kind === 'live'}
            >
              <span className="flex flex-wrap items-center gap-2">
                <span className={cn(chip, state === 'live' && 'bg-[#b91c1c]')}>
                  {EVENT_STATE_LABEL[state]}
                </span>
                <span className={chip}>{countdown}</span>
              </span>
              {offer ? (
                <span className="block text-headline font-extrabold">
                  {formatPrice(offer.eventPrice)}
                  {percent > 0 ? (
                    <span className="ml-2 text-body font-bold text-amber-300">
                      -{percent} %
                    </span>
                  ) : null}
                </span>
              ) : event.reward ? (
                <span className="flex items-center gap-1.5 text-body font-bold">
                  <Gift className="size-4 shrink-0" aria-hidden="true" />
                  {event.reward}
                </span>
              ) : null}
            </FeedVisual>
          }
          link={{
            to: to!,
            title: event.title,
            subtitle: `${label} · ${formatCount(event.participants)} participants`,
            action: hasParticipationPage(event) ? 'Participer' : 'Voir l’événement',
          }}
          partnershipLink={event.partnershipLink}
        />
      )
    }

    case 'cote': {
      const { market, index } = item
      return (
        <FeedCard
          author={{
            name: market.creatorName,
            avatarSrc: market.creatorAvatar,
            to: paths.creator(market.creatorHandle),
          }}
          badge={{ label: 'Creator Market · Cotes', icon: TrendingUp }}
          time={market.timeLabel}
          text={withHashtags(market.caption, market.hashtags)}
          visual={
            <FeedVisual
              to={to!}
              label={`Ouvrir le fil Cotes : ${market.creatorName}`}
              hue={CREATOR_HUES[index % CREATOR_HUES.length] ?? 150}
              icon={TrendingUp}
              imageSrc={market.posterSrc}
              video
            >
              <span className={chip}>{STATUS_LABEL[market.status]}</span>
              <span className="block text-caption text-white/85">Cote actuelle</span>
              <span className="block text-headline font-extrabold tabular-nums">
                {formatCote(market.cote)}
              </span>
            </FeedVisual>
          }
          link={{
            to: to!,
            title: `${market.title} · ${market.creatorName}`,
            subtitle: `${formatCount(market.participants)} participants`,
            action: 'Voir le fil Cotes',
          }}
          partnershipLink={market.partnershipLink}
        />
      )
    }

    case 'coins': {
      const { event, index } = item
      return (
        <FeedCard
          author={{
            name: event.creatorName,
            avatarSrc: event.creatorAvatar,
            to: paths.creator(event.creatorHandle),
          }}
          badge={{ label: 'Creator Market · Coins', icon: Coins }}
          time={event.startLabel}
          text={withHashtags(event.caption, event.hashtags)}
          visual={
            <FeedVisual
              to={to!}
              label={`Ouvrir le fil Coins : ${event.creatorName}`}
              hue={CREATOR_HUES[index % CREATOR_HUES.length] ?? 150}
              icon={Coins}
              imageSrc={event.posterSrc}
              video
            >
              <span className={chip}>{COIN_STATE_LABEL[event.state]}</span>
              <span className="block text-caption text-white/85">Prix du coin</span>
              <span className="block text-headline font-extrabold tabular-nums">
                {formatPrice(event.coinPrice)}
              </span>
              {event.state === 'running' ? (
                <span className="block text-caption text-white/85">
                  Indice {formatIndex(event.index)} · départ à 100
                </span>
              ) : null}
            </FeedVisual>
          }
          link={{
            to: to!,
            title: `Coins · ${event.creatorName}`,
            subtitle: `${formatCount(event.soldCoins)} / ${formatCount(event.maxCoins)} coins attribués`,
            action: 'Voir le fil Coins',
          }}
        />
      )
    }

    case 'pro_post': {
      const { pro, post } = item
      const { service } = pro
      const image = post.media.find((media) => media.kind === 'image' && media.src)
      const hasVideo = post.media.some((media) => media.kind === 'video')
      const hue = hueOf(service.username)
      return (
        <FeedCard
          author={{
            name: service.name,
            avatarSrc: service.logo || undefined,
            verified: pro.verified,
            to: proProfilePath(service),
          }}
          badge={{ label: 'Service Pro', icon: Store }}
          time={formatAgo(post.publishedAt, now)}
          title={post.title}
          text={post.description}
          partnershipLink={post.partnershipLink}
          visual={
            image || hasVideo || post.promoPrice !== null ? (
              <FeedVisual
                to={to!}
                label={`Ouvrir le canal de ${service.name}`}
                hue={hue}
                icon={Store}
                imageSrc={image?.src}
                video={hasVideo}
              >
                {post.promoPrice !== null ? (
                  <span className="block text-headline font-extrabold">
                    {formatPrice(post.promoPrice)}
                    <span className="ml-2 text-body font-bold text-amber-300">
                      Promotion
                    </span>
                  </span>
                ) : null}
              </FeedVisual>
            ) : undefined
          }
          link={{
            to: to!,
            title: `Canal de ${service.name}`,
            subtitle: `${formatCount(pro.followers)} abonnés`,
            action: 'Voir le canal',
          }}
        />
      )
    }

    case 'product': {
      const { product, pro } = item
      const author: FeedAuthor = pro
        ? {
            name: pro.service.name,
            avatarSrc: pro.service.logo || undefined,
            verified: pro.verified,
            to: proProfilePath(pro.service),
          }
        : {
            name: product.seller,
            verified: product.sellerVerified,
            to: to ?? paths.search,
          }
      return (
        <FeedCard
          author={author}
          badge={{ label: 'Produit', icon: Package }}
          title={product.name}
          visual={
            <FeedVisual
              to={to!}
              label={`Voir le produit : ${product.name}`}
              hue={270}
              icon={Package}
              imageSrc={product.imageSrc}
            >
              <span className="block text-headline font-extrabold">
                {formatPrice(product.price)}
              </span>
              <span className="flex items-center gap-1 text-caption text-white/85">
                <Star className="size-3.5 fill-current" aria-hidden="true" />
                {formatRating(product.rating)}
              </span>
            </FeedVisual>
          }
          link={{
            to: to!,
            title: product.name,
            subtitle: `${formatPrice(product.price)} · ${product.seller}`,
            action: 'Voir le produit',
          }}
        />
      )
    }

    case 'pro': {
      const { pro, label } = item
      const { service } = pro
      return (
        <FeedCard
          author={{
            name: service.name,
            avatarSrc: service.logo || undefined,
            verified: pro.verified,
            to: proProfilePath(service),
          }}
          badge={{ label: `Suggestion · ${label}`, icon: Store }}
          text={pro.tagline}
          visual={
            <FeedVisual
              to={to!}
              label={`Visiter ${service.name}`}
              hue={hueOf(service.username)}
              icon={Store}
            >
              <span className="flex items-center gap-3 text-body font-bold">
                <span className="inline-flex items-center gap-1">
                  <Star className="size-4 fill-current" aria-hidden="true" />
                  {formatRating(pro.rating)}
                </span>
                <span className="inline-flex items-center gap-1">
                  <Users className="size-4" aria-hidden="true" />
                  {formatCount(pro.followers)} abonnés
                </span>
              </span>
            </FeedVisual>
          }
          link={{
            to: to!,
            title: service.name,
            subtitle: pro.tagline,
            action: 'Visiter',
          }}
        />
      )
    }

    case 'ad': {
      const { campaign, pro } = item
      const { service } = pro
      const pack = getAdPack(campaign.pack)
      return (
        <FeedCard
          author={{
            name: service.name,
            avatarSrc: service.logo || undefined,
            verified: pro.verified,
            to: proProfilePath(service),
          }}
          badge={{ label: 'Sponsorisé', icon: Megaphone }}
          time={`Forfait ${pack.label}`}
          title={campaign.title}
          text={campaign.text}
          visual={
            <FeedVisual
              to={to!}
              label={`Annonce sponsorisée : ${campaign.title}`}
              hue={32}
              icon={Megaphone}
              imageSrc={campaign.image || undefined}
            >
              <span className={cn(chip, 'bg-gold/90 text-gold-foreground')}>
                Sponsorisé
              </span>
            </FeedVisual>
          }
          link={{
            to: to!,
            title: campaign.title,
            subtitle: service.name,
            action: AD_CTA_LABEL[campaign.cta],
          }}
        />
      )
    }
  }
}
