import { CalendarDays, Radio } from 'lucide-react'
import { Link } from 'react-router-dom'

import { Avatar } from '@/components/common/Avatar'
import { PartnershipLinkBanner } from '@/components/common/PartnershipLinkBanner'
import { VerifiedBadge } from '@/components/common/VerifiedBadge'
import { EVENT_HUES, EVENT_KINDS, EVENT_STATE_LABEL, getEventState } from '@/lib/events'
import { getEventConditions, getExploreEventPath } from '@/lib/explore'
import { formatClock } from '@/lib/format'
import { getEventHostProfilePath } from '@/lib/messaging-contexts'
import { cn } from '@/lib/utils'
import type { MarketEvent } from '@/types/event'

interface EventCardProps {
  event: MarketEvent
  /** Heure courante (voir `useNow`). */
  now: number
  /** Prend la largeur de sa cellule (grille) au lieu de la largeur fixe d'une rangée. */
  fluid?: boolean
  /** Destination forcée pour le détail (sinon chemin Market Event standard). */
  to?: string
}

const dayFormatter = new Intl.DateTimeFormat('fr-FR', {
  weekday: 'short',
  day: 'numeric',
  month: 'short',
})

/**
 * Carte événement marketplace :
 * - photo de profil → page publique de l’hôte ;
 * - milieu / visuel → détail de l’événement.
 */
export function EventCard({ event, now, fluid = false, to }: EventCardProps) {
  const { icon: KindIcon, label } = EVENT_KINDS[event.kind]
  const hue = EVENT_HUES[event.kind]
  const state = getEventState(event, now)
  const live = state === 'live'
  const detailTo = to ?? getExploreEventPath(event)
  const profileTo = getEventHostProfilePath(event)

  return (
    <article
      className={cn(
        'group flex shrink-0 snap-start flex-col overflow-hidden rounded-xl bg-card ring-1 ring-black/[0.06] transition-[box-shadow,transform] duration-200 hover:-translate-y-0.5 hover:shadow-md',
        fluid ? 'w-full' : 'w-[14.5rem] sm:w-64',
      )}
    >
      <Link
        to={detailTo}
        aria-label={`Détail de l’événement : ${event.title}`}
        className="relative block aspect-[16/10] overflow-hidden"
        style={{
          background: `linear-gradient(145deg, hsl(${hue} 45% 42%) 0%, hsl(${hue} 50% 22%) 100%)`,
        }}
      >
        {event.imageSrc ? (
          <img
            src={event.imageSrc}
            alt=""
            loading="lazy"
            className="absolute inset-0 size-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <span aria-hidden="true" className="absolute inset-0 grid place-items-center">
            <KindIcon className="size-14 text-white/25" strokeWidth={1.25} />
          </span>
        )}
        <span className="absolute top-2 left-2 flex flex-wrap gap-1">
          <span
            className={cn(
              'inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] font-extrabold text-white',
              live ? 'bg-[#e11d48]' : 'bg-neutral-900/75',
            )}
          >
            {live ? <Radio className="size-2.5" aria-hidden="true" /> : null}
            {EVENT_STATE_LABEL[state]}
          </span>
          <span className="rounded-md bg-white/95 px-1.5 py-0.5 text-[10px] font-bold text-foreground">
            {label}
          </span>
        </span>
      </Link>

      <span className="flex flex-1 flex-col gap-1 px-2.5 py-2.5">
        <Link
          to={profileTo}
          aria-label={`Voir la page publique de ${event.host.name}`}
          className="flex min-w-0 items-center gap-2 rounded-lg py-0.5 transition-colors hover:bg-muted/60"
          onClick={(e) => e.stopPropagation()}
        >
          <Avatar
            name={event.host.name}
            src={event.host.avatarSrc}
            size="sm"
          />
          <span className="flex min-w-0 items-center gap-1 text-[11px] text-muted-foreground">
            <span className="truncate font-semibold text-foreground">
              {event.host.name}
            </span>
            {event.host.verified ? <VerifiedBadge className="size-3" /> : null}
          </span>
        </Link>

        <Link to={detailTo} className="min-w-0 space-y-1">
          <span className="line-clamp-2 block text-[13px] leading-snug font-extrabold">
            {event.title}
          </span>
          <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
            <CalendarDays className="size-3 shrink-0" aria-hidden="true" />
            <span className="truncate">
              {live
                ? `Jusqu’au ${dayFormatter.format(event.endsAt)} · ${formatClock(event.endsAt)}`
                : `${dayFormatter.format(event.startsAt)} · ${formatClock(event.startsAt)}`}
            </span>
          </span>
          <span className="mt-auto block truncate text-[12px] font-extrabold text-gold">
            {getEventConditions(event)}
          </span>
        </Link>
        {event.partnershipLink ? (
          <PartnershipLinkBanner
            href={event.partnershipLink}
            className="mt-1"
          />
        ) : null}
      </span>
    </article>
  )
}
