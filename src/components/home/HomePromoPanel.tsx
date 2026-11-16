import {
  ArrowRight,
  CalendarDays,
  Coins,
  Megaphone,
  Package,
  Sparkles,
} from 'lucide-react'
import { useEffect, useMemo, useRef, useState, useSyncExternalStore, type UIEvent } from 'react'
import { Link } from 'react-router-dom'

import { Media } from '@/components/common/Media'
import { useNow } from '@/hooks/use-now'
import { formatPercent } from '@/components/market/market-utils'
import { Sparkline } from '@/components/market/Sparkline'
import {
  coinValueHistory,
  getCoinPriceChange,
} from '@/components/market/coins/coin-utils'
import { AD_CTA_LABEL, getAdPack } from '@/lib/ad-packs'
import { getStoredCampaigns, subscribeCampaigns } from '@/lib/ad-campaigns-store'
import type { DemoPro } from '@/lib/directory'
import { getExploreEventPath, getProductPath } from '@/lib/explore'
import { EVENT_KINDS, getEventState } from '@/lib/events'
import { formatCount, formatPrice } from '@/lib/format'
import { TEMP_COIN_EVENTS } from '@/lib/placeholder-coin-markets'
import {
  getPopularEvents,
  getPopularProducts,
  getSponsoredRecommendations,
  resolveEventImage,
  resolveProductImage,
  resolveSponsoredImage,
} from '@/lib/recommendations'
import { cn } from '@/lib/utils'
import { paths } from '@/routes/paths'
import type { AdCampaign } from '@/types/ads'
import type { CoinEvent } from '@/types/coin-market'
import type { Product } from '@/types/explore'
import type { MarketEvent } from '@/types/event'

const AUTO_MS = 5_500
const GAP_PX = 14

type PromoSlide =
  | {
      id: string
      kind: 'sponsored'
      eyebrow: string
      title: string
      text: string
      cta: string
      to: string
      image?: string
      meta: string
      campaign: AdCampaign
      pro: DemoPro
    }
  | {
      id: string
      kind: 'product'
      eyebrow: string
      title: string
      text: string
      cta: string
      to: string
      image?: string
      meta: string
      product: Product
    }
  | {
      id: string
      kind: 'event'
      eyebrow: string
      title: string
      text: string
      cta: string
      to: string
      image?: string
      meta: string
      event: MarketEvent
    }
  | {
      id: string
      kind: 'coin'
      eyebrow: string
      title: string
      text: string
      cta: string
      to: string
      image?: string
      meta: string
      coin: CoinEvent
      priceSeries: number[]
      priceChange: number
      currentPrice: number
    }

function buildSlides(now: number): PromoSlide[] {
  const slides: PromoSlide[] = []

  for (const item of getSponsoredRecommendations('home', 3)) {
    if (item.kind !== 'ad') continue
    const { campaign, pro } = item
    const pack = getAdPack(campaign.pack)
    const handle = pro.service.username || pro.service.id
    slides.push({
      id: item.id,
      kind: 'sponsored',
      eyebrow: 'Sponsorisé',
      title: campaign.title,
      text: campaign.text,
      cta: AD_CTA_LABEL[campaign.cta],
      to:
        campaign.target === 'item' && campaign.itemId
          ? paths.product(campaign.itemId)
          : paths.establishment(handle),
      image: resolveSponsoredImage(campaign, pro),
      meta: `${pro.service.name} · ${pack.label}`,
      campaign,
      pro,
    })
  }

  for (const product of getPopularProducts(4)) {
    const price = product.promoPrice ?? product.price
    slides.push({
      id: `product:${product.id}`,
      kind: 'product',
      eyebrow: product.promoPrice !== undefined ? 'Promo' : 'Populaire',
      title: product.name,
      text: `${product.seller} · ★ ${product.rating.toFixed(1).replace('.', ',')}`,
      cta: 'Voir',
      to: getProductPath(product),
      image: resolveProductImage(product),
      meta: formatPrice(price),
      product,
    })
  }

  for (const event of getPopularEvents(now, 2)) {
    const state = getEventState(event, now)
    const kind = EVENT_KINDS[event.kind]
    slides.push({
      id: `event:${event.id}`,
      kind: 'event',
      eyebrow: state === 'live' ? 'En direct' : 'Événement',
      title: event.title,
      text: event.description,
      cta: 'Participer',
      to: getExploreEventPath(event),
      image: resolveEventImage(event),
      meta: `${kind.label} · ${formatCount(event.participants)}`,
      event,
    })
  }

  for (const coin of TEMP_COIN_EVENTS.filter(
    (item) =>
      item.indexHistory.length > 2 &&
      (item.state === 'running' ||
        item.state === 'purchases_open' ||
        item.state === 'closing'),
  ).slice(0, 3)) {
    const { ratio } = getCoinPriceChange(coin)
    const started = coin.state !== 'purchases_open' && coin.state !== 'purchases_closed'
    const current = started ? coin.coinValue : coin.coinPrice
    slides.push({
      id: `coin:${coin.id}`,
      kind: 'coin',
      eyebrow: started ? 'Coins · en cours' : 'Coins · achats ouverts',
      title: `@${coin.creatorHandle}`,
      text: coin.caption,
      cta: 'Participer',
      to: `${paths.markets}?type=coins&evenement=${coin.id}`,
      image: coin.posterSrc,
      meta: `${formatPrice(current)} / coin · ${formatCount(coin.participants)}`,
      coin,
      priceSeries: coinValueHistory(coin),
      priceChange: ratio,
      currentPrice: current,
    })
  }

  return slides
}

function toneFor(kind: PromoSlide['kind']) {
  if (kind === 'sponsored') {
    return {
      badge: 'bg-gold text-gold-foreground shadow-[0_0_24px_color-mix(in_srgb,var(--gold)_45%,transparent)]',
      cta: 'bg-gold text-gold-foreground hover:bg-gold/90',
      wash: 'from-black/90 via-[#0a3d24]/55 to-transparent',
      rim: 'ring-gold/40',
      glow: 'shadow-[0_18px_50px_-22px_rgba(0,0,0,0.65),0_0_0_1px_color-mix(in_srgb,var(--gold)_28%,transparent)]',
    }
  }
  if (kind === 'product') {
    return {
      badge: 'bg-brand text-brand-foreground',
      cta: 'bg-white text-brand hover:bg-white/95',
      wash: 'from-black/90 via-[#0b6b3a]/45 to-transparent',
      rim: 'ring-white/20',
      glow: 'shadow-[0_18px_50px_-22px_rgba(0,0,0,0.6)]',
    }
  }
  if (kind === 'coin') {
    return {
      badge: 'bg-[#fbbf24] text-neutral-900',
      cta: 'bg-[#fbbf24] text-neutral-900 hover:bg-[#f59e0b]',
      wash: 'from-black/90 via-[#78350f]/45 to-transparent',
      rim: 'ring-[#fbbf24]/35',
      glow: 'shadow-[0_18px_50px_-22px_rgba(0,0,0,0.6)]',
    }
  }
  return {
    badge: 'bg-white/95 text-foreground',
    cta: 'bg-white text-brand hover:bg-white/90',
    wash: 'from-black/90 via-[#14532d]/40 to-transparent',
    rim: 'ring-white/25',
    glow: 'shadow-[0_18px_50px_-22px_rgba(0,0,0,0.6)]',
  }
}

/**
 * Panneaux publicitaires Accueil façon affichage urbain :
 * grands formats expressifs, défilement horizontal (snap).
 */
export function HomePromoPanel() {
  const now = useNow(60_000)
  const campaigns = useSyncExternalStore(subscribeCampaigns, getStoredCampaigns)
  const slides = useMemo(() => buildSlides(now), [campaigns, now])
  const trackRef = useRef<HTMLUListElement>(null)
  const [active, setActive] = useState(0)
  const [paused, setPaused] = useState(false)
  const [slideCount, setSlideCount] = useState(slides.length)

  // Ajustement pendant le rendu quand le nombre de slides change (évite setState dans effect).
  if (slideCount !== slides.length) {
    setSlideCount(slides.length)
    setActive(0)
  }

  useEffect(() => {
    trackRef.current?.scrollTo({ left: 0 })
  }, [slides.length])

  useEffect(() => {
    if (slides.length <= 1 || paused) return
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduce) return
    const timer = window.setInterval(() => {
      const list = trackRef.current
      if (!list) return
      const next = (active + 1) % slides.length
      const slide = list.children[next] as HTMLElement | undefined
      if (!slide) return
      list.scrollTo({ left: slide.offsetLeft - 12, behavior: 'smooth' })
      setActive(next)
    }, AUTO_MS)
    return () => window.clearInterval(timer)
  }, [slides.length, paused, active])

  function onScroll(event: UIEvent<HTMLUListElement>) {
    const list = event.currentTarget
    const first = list.firstElementChild as HTMLElement | null
    if (!first) return
    const index = Math.round(list.scrollLeft / (first.offsetWidth + GAP_PX))
    setActive(Math.min(Math.max(index, 0), slides.length - 1))
  }

  if (slides.length === 0) return null

  return (
    <section
      aria-roledescription="carrousel"
      aria-label="Panneaux publicitaires : À la une"
      className="relative overflow-hidden bg-[linear-gradient(180deg,color-mix(in_srgb,var(--muted)_55%,transparent)_0%,transparent_100%)] pt-3 pb-3"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
          setPaused(false)
        }
      }}
      onTouchStart={() => setPaused(true)}
      onTouchEnd={() => setPaused(false)}
    >
      <div className="mb-2.5 flex items-end justify-between gap-3 px-3 sm:px-4">
        <div>
          <p className="inline-flex items-center gap-1.5 text-[10px] font-extrabold tracking-[0.16em] text-brand uppercase">
            <Sparkles className="size-3.5 text-gold" aria-hidden="true" />
            Affichage
          </p>
          <h2 className="text-body font-extrabold tracking-tight sm:text-title">
            À la une
          </h2>
        </div>
        <p className="text-[11px] font-semibold text-muted-foreground tabular-nums">
          {active + 1} / {slides.length}
        </p>
      </div>

      <ul
        ref={trackRef}
        onScroll={onScroll}
        className="flex snap-x snap-mandatory scroll-px-3 gap-3.5 overflow-x-auto overscroll-x-contain px-3 pb-1 [scrollbar-width:none] sm:scroll-px-4 sm:px-4 [&::-webkit-scrollbar]:hidden"
      >
        {slides.map((slide, slideIndex) => {
          const tone = toneFor(slide.kind)
          const Icon =
            slide.kind === 'sponsored'
              ? Megaphone
              : slide.kind === 'product'
                ? Package
                : slide.kind === 'coin'
                  ? Coins
                  : CalendarDays
          const isActive = slideIndex === active
          const coinFlat =
            slide.kind === 'coin' ? Math.abs(slide.priceChange) < 0.0005 : false

          return (
            <li
              key={slide.id}
              className="w-[min(22rem,calc(100%-2.75rem))] shrink-0 snap-center sm:w-[min(28rem,calc(100%-4rem))]"
            >
              <article
                className={cn(
                  'home-promo-slide group relative isolate flex aspect-[16/10] min-h-[13.5rem] flex-col overflow-hidden rounded-[1.15rem] text-white ring-1 transition-[transform,box-shadow] duration-500 sm:min-h-[16rem] sm:rounded-[1.35rem]',
                  tone.rim,
                  tone.glow,
                  isActive ? 'scale-[1.01]' : 'scale-[0.985] opacity-[0.92]',
                )}
              >
                {/* Cadre type panneau LED / affiche urbaine */}
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 z-20 rounded-[inherit] ring-1 ring-inset ring-white/25"
                />
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-x-3 top-2 z-20 h-px bg-linear-to-r from-transparent via-white/50 to-transparent sm:inset-x-4"
                />

                <div className="home-promo-media absolute inset-0">
                  <Media
                    src={slide.image}
                    alt=""
                    icon={Icon}
                    tone={slide.kind === 'sponsored' ? 'gold' : 'brand'}
                    className="absolute inset-0 size-full scale-105 transition-transform duration-[6s] ease-out group-hover:scale-110"
                  />
                </div>

                <div
                  aria-hidden="true"
                  className={cn(
                    'absolute inset-0 bg-linear-to-t via-40%',
                    tone.wash,
                  )}
                />
                <div
                  aria-hidden="true"
                  className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,color-mix(in_srgb,var(--gold)_22%,transparent),transparent_55%)]"
                />
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 opacity-[0.18]"
                  style={{
                    backgroundImage:
                      'repeating-linear-gradient(0deg, transparent 0 2px, rgba(0,0,0,0.12) 2px 3px)',
                  }}
                />

                <div className="relative z-10 mt-auto flex flex-1 flex-col justify-end gap-3 p-4 sm:p-5">
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={cn(
                          'inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-extrabold tracking-[0.12em] uppercase',
                          tone.badge,
                        )}
                      >
                        <Icon className="size-3" aria-hidden="true" />
                        {slide.eyebrow}
                      </span>
                      {slide.kind === 'sponsored' ? (
                        <span className="rounded-md border border-white/25 bg-black/35 px-2 py-0.5 text-[10px] font-bold tracking-wide text-white/90 uppercase backdrop-blur-sm">
                          Pub
                        </span>
                      ) : null}
                    </div>
                    <h3 className="max-w-[16ch] text-[1.35rem] leading-[1.15] font-extrabold tracking-tight text-balance sm:max-w-[18ch] sm:text-[1.65rem]">
                      {slide.title}
                    </h3>
                    <p className="line-clamp-2 max-w-sm text-[12px] leading-snug text-white/88 sm:text-[13px]">
                      {slide.text}
                    </p>
                    {slide.kind === 'coin' ? (
                      <div className="flex items-end gap-3 rounded-xl bg-black/35 p-2.5 ring-1 ring-white/15 backdrop-blur-sm">
                        <div className="min-w-0">
                          <p className="text-[10px] font-bold tracking-wide text-white/75 uppercase">
                            Prix du coin
                          </p>
                          <p className="text-lg leading-none font-extrabold tabular-nums">
                            {formatPrice(slide.currentPrice)}
                          </p>
                          <p
                            className={cn(
                              'mt-1 text-[11px] font-extrabold tabular-nums',
                              coinFlat && 'text-white/80',
                              !coinFlat &&
                                slide.priceChange > 0 &&
                                'text-[#86efac]',
                              !coinFlat &&
                                slide.priceChange < 0 &&
                                'text-[#fca5a5]',
                            )}
                          >
                            {coinFlat
                              ? 'Stable'
                              : formatPercent(slide.priceChange)}
                          </p>
                        </div>
                        <Sparkline
                          values={slide.priceSeries}
                          baseline={slide.coin.coinPrice}
                          minSpan={Math.max(20, slide.coin.coinPrice * 0.2)}
                          className="h-10 min-w-0 flex-1 text-white"
                        />
                      </div>
                    ) : (
                      <p className="text-[11px] font-bold tracking-wide text-gold uppercase">
                        {slide.meta}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center justify-between gap-3">
                    <Link
                      to={slide.to}
                      className={cn(
                        'inline-flex h-11 items-center gap-1.5 rounded-xl px-4 text-[13px] font-extrabold shadow-lg transition-transform active:scale-[0.98]',
                        tone.cta,
                      )}
                    >
                      {slide.cta}
                      <ArrowRight className="size-4" aria-hidden="true" />
                    </Link>
                    <span
                      aria-hidden="true"
                      className="hidden text-[10px] font-bold tracking-[0.2em] text-white/45 uppercase sm:inline"
                    >
                      AfriConnect
                    </span>
                  </div>
                </div>

                {isActive && !paused && slides.length > 1 ? (
                  <span
                    key={`progress-${slide.id}-${active}`}
                    aria-hidden="true"
                    className="home-promo-progress absolute inset-x-0 bottom-0 z-30 h-1 bg-gold"
                  />
                ) : null}
              </article>
            </li>
          )
        })}
      </ul>

      <div
        role="tablist"
        aria-label="Diapositives"
        className="mt-3 flex justify-center gap-1.5 px-3"
      >
        {slides.map((slide, index) => (
          <button
            key={slide.id}
            type="button"
            role="tab"
            aria-selected={index === active}
            aria-label={`Panneau ${index + 1}`}
            onClick={() => {
              const list = trackRef.current
              const el = list?.children[index] as HTMLElement | undefined
              if (list && el) {
                list.scrollTo({ left: el.offsetLeft - 12, behavior: 'smooth' })
              }
              setActive(index)
            }}
            className={cn(
              'h-1.5 rounded-full transition-all duration-300',
              index === active
                ? 'w-6 bg-brand'
                : 'w-1.5 bg-muted-foreground/30 hover:bg-muted-foreground/50',
            )}
          />
        ))}
      </div>
    </section>
  )
}
