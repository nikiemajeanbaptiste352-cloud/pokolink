import { ArrowLeft, CalendarX } from 'lucide-react'
import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react'
import { Link, useSearchParams } from 'react-router-dom'

import { EventFeedCard } from '@/components/events/EventFeedCard'
import { EventSheet } from '@/components/events/EventSheet'
import { buttonVariants } from '@/components/ui/button'
import { useNow } from '@/hooks/use-now'
import {
  EVENT_FILTERS,
  getEventState,
  matchesFilter,
  type EventFilter,
} from '@/lib/events'
import {
  getEventParticipations,
  subscribeEventParticipations,
} from '@/lib/event-participation-store'
import { TEMP_EVENTS } from '@/lib/placeholder-events'
import {
  listPublishedProMarketEvents,
  resolveMarketEvent,
} from '@/lib/pro-event-bridge'
import { cn } from '@/lib/utils'
import { paths } from '@/routes/paths'
import type { MarketEvent } from '@/types/event'

type FeedTab = EventFilter | 'mine'

/** « Tous » devient « Pour vous » ; « Participés » = événements rejoins localement. */
const TABS: readonly { id: FeedTab; label: string }[] = [
  { id: 'mine', label: 'Participés' },
  ...EVENT_FILTERS.map((item) =>
    item.id === 'all' ? { ...item, label: 'Pour vous' } : item,
  ),
]

const overlayButton = cn(
  buttonVariants({ variant: 'ghost', size: 'icon' }),
  'bg-black/40 text-white hover:bg-black/55 hover:text-white',
)

/**
 * Market Event en fil vertical plein écran (façon TikTok) : chaque événement occupe
 * l'écran, on fait défiler pour passer au suivant, et les catégories filtrent le fil.
 * « Participer » / « Contribuer » ouvre le panneau adapté à l’événement.
 */
export function EventsFeedPage() {
  const now = useNow()
  const [tab, setTab] = useState<FeedTab>('all')
  /** Panneau détail ouvert au clic Participer. */
  const [openEvent, setOpenEvent] = useState<MarketEvent | null>(null)
  // Les événements terminés ne sont retirés qu'au changement de catégorie : une carte
  // ne disparaît donc pas sous le doigt quand un compte à rebours arrive à zéro.
  const [listedAt, setListedAt] = useState(() => Date.now())
  const [searchParams] = useSearchParams()
  const sharedId = searchParams.get('evenement')
  const allParticipations = useSyncExternalStore(
    subscribeEventParticipations,
    getEventParticipations,
  )
  const participations = allParticipations.filter(
    (item) => item.source === 'market-event',
  )

  const catalog = useMemo(() => {
    const seen = new Set(TEMP_EVENTS.map((event) => event.id))
    const fromPro = listPublishedProMarketEvents().filter((event) => !seen.has(event.id))
    return [...TEMP_EVENTS, ...fromPro]
  }, [listedAt])

  const events = useMemo(() => {
    if (tab === 'mine') {
      const seen = new Set<string>()
      const mine: MarketEvent[] = []
      for (const record of participations) {
        if (seen.has(record.eventId)) continue
        const event =
          resolveMarketEvent(record.eventId) ??
          catalog.find((item) => item.id === record.eventId)
        if (!event) continue
        seen.add(event.id)
        mine.push(event)
      }
      return mine
    }
    return catalog.filter(
      (event) =>
        getEventState(event, listedAt) !== 'ended' && matchesFilter(event, tab),
    )
  }, [tab, listedAt, participations, catalog])

  function selectTab(next: FeedTab) {
    setOpenEvent(null)
    setTab(next)
    setListedAt(Date.now())
  }

  // Lien partagé (`?evenement=…`) : scroll + ouverture du panneau (une fois).
  const feedRef = useRef<HTMLDivElement>(null)
  // Deep-link : on aligne le slide, sans ouvrir le panneau Participer / paiement
  // (le lien partenaire reste visible sur la carte).
  useEffect(() => {
    if (!sharedId) return
    const target = [...(feedRef.current?.querySelectorAll('article') ?? [])].find(
      (article) => article.dataset.eventId === sharedId,
    )
    target?.scrollIntoView({ block: 'start' })
  }, [sharedId, events])

  return (
    <div className="cote-tiktok relative isolate bg-black">
      <div
        // `key` : changer de catégorie remet le fil tout en haut.
        key={tab}
        ref={feedRef}
        role="region"
        aria-label="Fil des événements"
        tabIndex={0}
        className="cote-tiktok-feed h-full scrollbar-none overflow-y-auto overscroll-y-contain focus-visible:outline-2 focus-visible:-outline-offset-4 focus-visible:outline-white"
      >
        {events.length > 0 ? (
          events.map((event) => (
            <EventFeedCard
              key={event.id}
              event={event}
              now={now}
              onOpen={setOpenEvent}
            />
          ))
        ) : (
          <div className="cote-tiktok-slide flex h-full flex-col items-center justify-center gap-3 px-8 text-center text-white">
            <CalendarX className="size-12 text-white/70" aria-hidden="true" />
            <p className="text-title font-bold">
              {tab === 'mine' ? 'Aucune participation' : 'Aucun événement'}
            </p>
            <p className="max-w-72 text-body text-white/85">
              {tab === 'mine'
                ? 'Les événements auxquels vous participez apparaîtront ici.'
                : 'Aucun événement dans cette catégorie pour le moment.'}
            </p>
            <button
              type="button"
              onClick={() => selectTab('all')}
              className="inline-flex h-11 items-center rounded-full bg-white px-5 text-sm font-semibold text-neutral-900"
            >
              Voir tous les événements
            </button>
          </div>
        )}
      </div>

      <EventSheet
        event={openEvent}
        now={now}
        onClose={() => setOpenEvent(null)}
      />

      <header className="pt-safe pointer-events-none absolute inset-x-0 top-0 z-20 bg-linear-to-b from-black/70 to-transparent text-white">
        <h1 className="sr-only">Market Event</h1>
        <div className="flex h-(--header-height) items-center gap-1 pr-2 pl-3">
          <Link
            to={paths.explore}
            aria-label="Retour à Explorer"
            className={cn(overlayButton, 'pointer-events-auto shrink-0')}
          >
            <ArrowLeft className="size-5" aria-hidden="true" />
          </Link>

          <div
            role="group"
            aria-label="Catégories d’événements"
            className="pointer-events-auto flex min-w-0 flex-1 scrollbar-none items-center overflow-x-auto"
          >
            {TABS.map((item) => (
              <button
                key={item.id}
                type="button"
                aria-pressed={tab === item.id}
                onClick={() => selectTab(item.id)}
                className={cn(
                  'inline-flex h-11 shrink-0 items-center border-b-2 px-3 text-body font-bold whitespace-nowrap transition-colors',
                  tab === item.id
                    ? 'border-white text-white'
                    : 'border-transparent text-white/75 hover:text-white',
                )}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </header>
    </div>
  )
}
