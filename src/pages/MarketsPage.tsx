import { CalendarX, ChevronDown, ChevronUp, LayoutList, Search } from 'lucide-react'
import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react'
import { Link, useSearchParams } from 'react-router-dom'

import { buttonVariants } from '@/components/ui/button'
import { BuyCoinsSheet } from '@/components/market/coins/BuyCoinsSheet'
import { CoinFeedCard } from '@/components/market/coins/CoinFeedCard'
import { CoinWithdrawSheet } from '@/components/market/coins/CoinWithdrawSheet'
import { MarketFeedCard } from '@/components/market/MarketFeedCard'
import { PositionSheet } from '@/components/market/PositionSheet'
import {
  getEventParticipations,
  subscribeEventParticipations,
} from '@/lib/event-participation-store'
import {
  getLocalCoinPositions,
  subscribeCoinPositions,
} from '@/lib/coin-positions-store'
import { getCoinPositions } from '@/lib/market-data'
import { TEMP_COIN_EVENTS } from '@/lib/placeholder-coin-markets'
import { TEMP_MARKETS } from '@/lib/placeholder-markets'
import { cn } from '@/lib/utils'
import { paths } from '@/routes/paths'
import type { CoinEvent, CoinPosition } from '@/types/coin-market'
import type { CreatorMarket } from '@/types/market'

type Tab = 'all' | 'mine'

type Kind = 'factor' | 'coins'

const KINDS: readonly { id: Kind; label: string }[] = [
  { id: 'factor', label: 'Cotes' },
  { id: 'coins', label: 'Coins' },
]

const TABS: readonly { id: Tab; label: string }[] = [
  { id: 'all', label: 'Pour vous' },
  { id: 'mine', label: 'Participés' },
]

const overlayButton = cn(
  buttonVariants({ variant: 'ghost', size: 'icon' }),
  'bg-black/40 text-white hover:bg-black/55 hover:text-white',
)

interface SheetState {
  market: CreatorMarket
}

/**
 * Creator Performance Market en fil vertical plein écran (façon TikTok) :
 * chaque événement occupe l'écran, on fait défiler pour passer au suivant.
 */
export function MarketsPage() {
  const [tab, setTab] = useState<Tab>('all')
  // Lien venant d'un fil (`?type=coins&evenement=…`) : on arrive sur l'événement en question.
  const [searchParams, setSearchParams] = useSearchParams()
  const sharedId = searchParams.get('evenement')
  const kind: Kind = searchParams.get('type') === 'coins' ? 'coins' : 'factor'
  function setKind(next: Kind) {
    const params = new URLSearchParams(searchParams)
    if (next === 'coins') params.set('type', 'coins')
    else params.delete('type')
    setSearchParams(params, { replace: true })
  }
  const feedRef = useRef<HTMLDivElement>(null)
  const [sheet, setSheet] = useState<SheetState | null>(null)
  const [scroll, setScroll] = useState({ key: '', index: 0 })
  const [buying, setBuying] = useState<CoinEvent | null>(null)
  const [withdrawing, setWithdrawing] = useState<CoinPosition | null>(null)
  // « Détails » : masque toutes les informations pour ne laisser que la vidéo.
  const [clean, setClean] = useState(false)
  const toggleClean = () => setClean((value) => !value)
  const participations = useSyncExternalStore(
    subscribeEventParticipations,
    getEventParticipations,
  )
  const localCoinPositions = useSyncExternalStore(
    subscribeCoinPositions,
    getLocalCoinPositions,
  )
  const positionByEvent = useMemo(() => {
    const map = new Map<string, CoinPosition>()
    for (const position of getCoinPositions()) {
      if (!map.has(position.eventId)) map.set(position.eventId, position)
    }
    return map
  }, [localCoinPositions])
  const joinedFactor = useMemo(
    () =>
      new Set(
        participations
          .filter((item) => item.source === 'factor')
          .map((item) => item.eventId),
      ),
    [participations],
  )
  const joinedCoins = useMemo(
    () =>
      new Set(
        participations
          .filter((item) => item.source === 'coins')
          .map((item) => item.eventId),
      ),
    [participations],
  )
  const markets =
    tab === 'mine'
      ? TEMP_MARKETS.filter((market) => joinedFactor.has(market.id))
      : TEMP_MARKETS
  const coinEvents = useMemo(() => {
    const base =
      tab === 'mine'
        ? TEMP_COIN_EVENTS.filter((event) => joinedCoins.has(event.id))
        : TEMP_COIN_EVENTS
    // Achats ouverts en premier : le CTA « Acheter » est visible dès l’entrée.
    return [...base].sort((a, b) => {
      const rank = (state: CoinEvent['state']) =>
        state === 'purchases_open' ? 0 : state === 'running' ? 1 : 2
      return rank(a.state) - rank(b.state)
    })
  }, [tab, joinedCoins])

  const feedKey = `${kind}-${tab}`
  const count = kind === 'factor' ? markets.length : coinEvents.length
  // Un changement d'onglet remet le fil en haut : l'index mémorisé ne vaut que pour son fil.
  const active =
    scroll.key === feedKey ? Math.min(scroll.index, Math.max(0, count - 1)) : 0

  /** Événement affiché : un écran = une cote (snap TikTok). */
  function onScroll() {
    const feed = feedRef.current
    if (!feed || feed.clientHeight === 0) return
    const index = Math.round(feed.scrollTop / feed.clientHeight)
    setScroll((previous) =>
      previous.key === feedKey && previous.index === index
        ? previous
        : { key: feedKey, index: Math.max(0, Math.min(index, count - 1)) },
    )
  }

  function goTo(index: number) {
    const target = feedRef.current?.children[Math.min(Math.max(index, 0), count - 1)]
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    target?.scrollIntoView({ block: 'start', behavior: reduceMotion ? 'auto' : 'smooth' })
  }

  function onKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    // Seulement quand le fil lui-même a le focus : les boutons gardent leurs touches.
    if (event.target !== event.currentTarget) return
    const next = event.key === 'ArrowDown' || event.key === 'PageDown'
    const previous = event.key === 'ArrowUp' || event.key === 'PageUp'
    if (!next && !previous) return
    event.preventDefault()
    goTo(active + (next ? 1 : -1))
  }

  useEffect(() => {
    if (!sharedId) return
    const target = [...(feedRef.current?.querySelectorAll('article') ?? [])].find(
      (article) => article.dataset.eventId === sharedId,
    )
    target?.scrollIntoView({ block: 'start' })
  }, [sharedId, feedKey])

  return (
    <div className="cote-tiktok relative isolate bg-black">
      <div
        // `key` : changer d'onglet remet le fil tout en haut.
        key={feedKey}
        ref={feedRef}
        onScroll={onScroll}
        onKeyDown={onKeyDown}
        role="region"
        aria-label={
          kind === 'factor'
            ? 'Fil des cotes Creator Market'
            : 'Fil des coins Creator Market'
        }
        tabIndex={0}
        className="cote-tiktok-feed h-full scrollbar-none overflow-y-auto overscroll-y-contain focus-visible:outline-2 focus-visible:-outline-offset-4 focus-visible:outline-white"
      >
        {count === 0 ? (
          <div className="cote-tiktok-slide flex h-full flex-col items-center justify-center gap-3 px-8 text-center text-white">
            <CalendarX className="size-12 text-white/70" aria-hidden="true" />
            <p className="text-title font-bold">
              {tab === 'mine' ? 'Aucune participation' : 'Aucun événement'}
            </p>
            <p className="max-w-72 text-body text-white/85">
              {tab === 'mine'
                ? kind === 'factor'
                  ? 'Prenez une position OUI / NON : l’événement apparaîtra ici.'
                  : 'Achetez des coins : l’événement apparaîtra ici.'
                : 'Aucun événement dans ce filtre pour le moment.'}
            </p>
            {tab === 'mine' ? (
              <button
                type="button"
                onClick={() => setTab('all')}
                className="inline-flex h-11 items-center rounded-full bg-white px-5 text-sm font-semibold text-neutral-900"
              >
                Voir tous les événements
              </button>
            ) : null}
          </div>
        ) : kind === 'factor' ? (
          markets.map((market, index) => (
            <MarketFeedCard
              key={market.id}
              market={market}
              index={index}
              active={index === active}
              clean={clean}
              onToggleClean={toggleClean}
              onParticipate={(target) => setSheet({ market: target })}
            />
          ))
        ) : (
          coinEvents.map((event, index) => (
            <CoinFeedCard
              key={event.id}
              event={event}
              index={index}
              active={index === active}
              clean={clean}
              onToggleClean={toggleClean}
              onBuy={setBuying}
              myPosition={positionByEvent.get(event.id) ?? null}
              onWithdraw={setWithdrawing}
            />
          ))
        )}
      </div>

      {count > 1 && !clean && active === 0 ? (
        <p
          aria-hidden="true"
          className="cote-tiktok-hint pointer-events-none absolute inset-x-0 bottom-[7.5rem] z-10 flex flex-col items-center gap-1 text-white [@media(max-height:700px)]:hidden md:bottom-8"
        >
          <ChevronDown className="size-5 animate-bounce opacity-90" />
          <span className="rounded-full bg-black/55 px-3 py-1 text-[11px] font-bold tracking-wide uppercase">
            Glisser
          </span>
        </p>
      ) : null}

      {count > 1 && !clean ? (
        <>
          {/* Mobile : repères de position, un point par événement. */}
          {count <= 10 ? (
            <ol
              aria-hidden="true"
              className="pointer-events-none absolute top-1/2 left-1.5 z-20 flex -translate-y-1/2 flex-col gap-1.5 md:hidden"
            >
              {Array.from({ length: count }, (_, index) => (
                <li
                  key={index}
                  className={cn(
                    'w-1 rounded-full bg-white transition-all duration-300',
                    index === active ? 'h-5 opacity-100' : 'h-1.5 opacity-40',
                  )}
                />
              ))}
            </ol>
          ) : null}

          {/* Ordinateur : précédent, position, suivant. */}
          <div className="absolute top-1/2 left-4 z-20 hidden -translate-y-1/2 flex-col items-center gap-2 md:flex">
            <button
              type="button"
              aria-label="Événement précédent"
              disabled={active === 0}
              onClick={() => goTo(active - 1)}
              className={cn(overlayButton, 'disabled:opacity-40')}
            >
              <ChevronUp className="size-5" aria-hidden="true" />
            </button>
            <span
              className="text-caption font-bold text-white tabular-nums"
              style={{ textShadow: '0 1px 3px rgb(0 0 0 / 0.6)' }}
            >
              {active + 1} / {count}
            </span>
            <button
              type="button"
              aria-label="Événement suivant"
              disabled={active >= count - 1}
              onClick={() => goTo(active + 1)}
              className={cn(overlayButton, 'disabled:opacity-40')}
            >
              <ChevronDown className="size-5" aria-hidden="true" />
            </button>
          </div>
        </>
      ) : null}

      {clean ? null : (
        <header className="pt-safe pointer-events-none absolute inset-x-0 top-0 z-20 bg-linear-to-b from-black/70 to-transparent text-white">
          <h1 className="sr-only">Creator Market</h1>
          <div className="flex h-(--header-height) items-center gap-1 px-2 sm:gap-2 sm:px-4">
            <Link
              to={paths.marketsList}
              aria-label="Voir la liste des événements"
              className={cn(overlayButton, 'pointer-events-auto shrink-0')}
            >
              <LayoutList className="size-5" aria-hidden="true" />
            </Link>

            <div
              role="group"
              aria-label="Type d’événement"
              className="pointer-events-auto mx-2 flex min-w-0 flex-1 rounded-full bg-black/55 p-0.5 sm:mx-3"
            >
              {KINDS.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  aria-pressed={kind === item.id}
                  onClick={() => setKind(item.id)}
                  className={cn(
                    'inline-flex h-10 min-w-0 flex-1 items-center justify-center rounded-full px-3 text-[13px] font-bold whitespace-nowrap transition-colors sm:h-11 sm:text-body',
                    kind === item.id
                      ? 'bg-white text-black'
                      : 'text-white hover:bg-white/15',
                  )}
                >
                  {item.label}
                </button>
              ))}
            </div>

            <Link
              to={paths.search}
              aria-label="Rechercher"
              className={cn(overlayButton, 'pointer-events-auto shrink-0')}
            >
              <Search className="size-5" aria-hidden="true" />
            </Link>
          </div>
          <div
            role="group"
            aria-label="Filtres du fil"
            className="pointer-events-auto mx-auto flex max-w-[calc(100%-1.5rem)] gap-1 pb-2"
          >
            {TABS.map((item) => (
              <button
                key={item.id}
                type="button"
                aria-pressed={tab === item.id}
                onClick={() => setTab(item.id)}
                className={cn(
                  'inline-flex h-9 min-w-0 flex-1 items-center justify-center rounded-full px-3 text-[12px] font-bold whitespace-nowrap transition-colors sm:text-[13px]',
                  tab === item.id
                    ? 'bg-white/20 text-white'
                    : 'text-white/70 hover:bg-white/10 hover:text-white',
                )}
              >
                {item.label}
              </button>
            ))}
          </div>
        </header>
      )}

      <PositionSheet
        market={sheet?.market ?? null}
        onClose={() => setSheet(null)}
      />
      <BuyCoinsSheet
        event={buying}
        onClose={() => setBuying(null)}
      />
      <CoinWithdrawSheet
        position={withdrawing}
        event={
          withdrawing
            ? (coinEvents.find((event) => event.id === withdrawing.eventId) ??
              TEMP_COIN_EVENTS.find((event) => event.id === withdrawing.eventId) ??
              null)
            : null
        }
        onClose={() => setWithdrawing(null)}
      />
    </div>
  )
}
