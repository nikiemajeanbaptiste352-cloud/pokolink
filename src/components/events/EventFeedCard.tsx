import { Heart, Share2, Timer } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'

import { Avatar } from '@/components/common/Avatar'
import { PartnershipLinkBanner } from '@/components/common/PartnershipLinkBanner'
import { VerifiedBadge } from '@/components/common/VerifiedBadge'
import {
  EVENT_HUES,
  EVENT_KINDS,
  EVENT_STATE_LABEL,
  formatCountdown,
  getEventState,
} from '@/lib/events'
import { formatCount } from '@/lib/format'
import { getEventHostProfilePath } from '@/lib/messaging-contexts'
import { DEMO_PARTNERSHIP_LINK } from '@/lib/partnership-link'
import { shareOrCopy } from '@/lib/share'
import { cn } from '@/lib/utils'
import { paths } from '@/routes/paths'
import type { MarketEvent } from '@/types/event'

const railButton =
  'grid size-12 place-items-center rounded-full bg-black/50 text-white transition-colors hover:bg-black/65'

const shadow = { textShadow: '0 1px 3px rgb(0 0 0 / 0.6)' }

interface EventFeedCardProps {
  event: MarketEvent
  now: number
  /** Ouvre le panneau de participation / achat événement (distinct du lien partenaire). */
  onOpen: (event: MarketEvent) => void
}

/**
 * Slide TikTok Market Event.
 * - Photo / nom → page publique de l’hôte
 * - Bandeau partenariat → page du lien collé (affiliation / forfait…)
 * - Bouton Participer / Acheter → panneau événement (pas le lien partenaire)
 */
export function EventFeedCard({ event, now, onOpen }: EventFeedCardProps) {
  const [liked, setLiked] = useState(false)
  const [notice, setNotice] = useState('')
  const state = getEventState(event, now)
  const { icon: KindIcon, label } = EVENT_KINDS[event.kind]
  const hue = EVENT_HUES[event.kind]
  const likes = liked ? 1 : 0
  const profileTo = getEventHostProfilePath(event)
  const partnershipHref = event.partnershipLink || DEMO_PARTNERSHIP_LINK

  const countdown =
    state === 'upcoming'
      ? `Début dans ${formatCountdown(event.startsAt - now)}`
      : state === 'live'
        ? `Fin dans ${formatCountdown(event.endsAt - now)}`
        : 'Terminé'

  const ctaLabel =
    state === 'ended' && event.lottery
      ? 'Voir le tirage'
      : state !== 'live'
        ? 'Voir l’événement'
        : event.offer
          ? 'Acheter (événement)'
          : event.collective
            ? 'Contribuer'
            : 'Participer'

  async function share() {
    const url = `${window.location.origin}${paths.events}?evenement=${event.id}`
    const result = await shareOrCopy(url, event.title)
    if (result === 'copied') setNotice('Lien copié dans le presse-papiers.')
    else if (result === 'failed') setNotice('Impossible de partager ce lien.')
    else setNotice('')
  }

  return (
    <article
      data-event-id={event.id}
      aria-label={`${event.host.name} : ${event.title}`}
      className="cote-tiktok-slide relative h-full overflow-hidden bg-black text-white"
    >
      <div
        aria-hidden="true"
        className="absolute inset-0 grid place-items-center"
        style={{
          background: `linear-gradient(165deg, hsl(${hue} 50% 26%) 0%, hsl(${hue} 60% 9%) 100%)`,
        }}
      >
        <KindIcon className="-mt-24 size-40 text-white/10" strokeWidth={1.25} />
      </div>
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 h-3/5 bg-linear-to-t from-black/90 via-black/55 to-transparent"
      />

      <div className="absolute right-3 bottom-4 z-10 flex flex-col items-center gap-3">
        <Link
          to={profileTo}
          aria-label={`Voir la page publique de ${event.host.name}`}
          className="rounded-full"
        >
          <Avatar
            name={event.host.name}
            src={event.host.avatarSrc}
            size="lg"
            ring="story"
          />
        </Link>
        <button
          type="button"
          onClick={() => setLiked((value) => !value)}
          aria-pressed={liked}
          aria-label={liked ? 'Je n’aime plus' : 'J’aime'}
          className={railButton}
        >
          <Heart
            className={cn('size-6', liked && 'fill-[#f43f5e] text-[#f43f5e]')}
            aria-hidden="true"
          />
        </button>
        <span
          className="-mt-2 text-caption font-semibold"
          style={shadow}
          aria-hidden="true"
        >
          {formatCount(likes)}
        </span>
        <button
          type="button"
          onClick={() => void share()}
          aria-label="Partager l’événement"
          className={railButton}
        >
          <Share2 className="size-6" aria-hidden="true" />
        </button>
      </div>

      <div className="absolute inset-x-0 bottom-0 z-10 space-y-2.5 p-4 pr-20">
        <div className="space-y-1.5" style={shadow}>
          <p className="flex flex-wrap items-center gap-2 text-body font-bold">
            <Link
              to={profileTo}
              className="inline-flex min-w-0 items-center gap-1 underline-offset-2 hover:underline"
            >
              <span className="truncate">{event.host.name}</span>
              {event.host.verified ? <VerifiedBadge tone="gold" /> : null}
            </Link>
            <span className="inline-flex items-center gap-1 rounded-full bg-black/55 px-2 py-0.5 text-caption font-bold">
              <KindIcon className="size-3.5" aria-hidden="true" />
              {label}
            </span>
            <span
              className={cn(
                'rounded-full px-2 py-0.5 text-caption font-bold',
                state === 'live' ? 'bg-[#b91c1c]' : 'bg-black/55',
              )}
            >
              {EVENT_STATE_LABEL[state]}
            </span>
          </p>
          <p className="line-clamp-2 text-title leading-snug font-extrabold">
            {event.title}
          </p>
          {event.description ? (
            <p className="line-clamp-2 text-[13px] leading-snug text-white/85">
              {event.description}
            </p>
          ) : null}
          <p className="inline-flex items-center gap-1.5 text-caption font-semibold text-white/90 tabular-nums">
            <Timer className="size-4 shrink-0" aria-hidden="true" />
            {countdown}
          </p>
        </div>

        {/* Lien partenaire : page publique / affiliation — jamais le panneau Participer */}
        <PartnershipLinkBanner href={partnershipHref} tone="onDark" />

        <button
          type="button"
          onClick={() => onOpen(event)}
          className="inline-flex h-12 w-full items-center justify-center rounded-full bg-white/15 text-base font-extrabold text-white ring-1 ring-white/40 hover:bg-white/25"
        >
          {ctaLabel}
        </button>
        <p role="status" className="text-caption empty:hidden" style={shadow}>
          {notice}
        </p>
      </div>
    </article>
  )
}
