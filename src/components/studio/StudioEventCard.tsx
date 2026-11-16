import { Link } from 'react-router-dom'

import { EventPoster } from '@/components/studio/EventPoster'
import { StudioStatusPill } from '@/components/studio/StudioStatusPill'
import { formatCount, formatNumber } from '@/lib/format'
import { formatEventStart, getEventTitle, STUDIO_KINDS } from '@/lib/studio'
import { paths } from '@/routes/paths'
import type { StudioEvent } from '@/types/studio'

/** Ligne de résumé des chiffres déjà connus de l'événement. */
function summaryLine(event: StudioEvent): string | null {
  const { stats } = event
  if (!stats) return null
  if (event.kind === 'coins' && stats.soldCoins !== undefined && event.maxCoins) {
    const sold = `${formatNumber(stats.soldCoins)} / ${formatNumber(event.maxCoins)} coins vendus`
    return stats.views > 0 ? `${sold} · ${formatCount(stats.views)} vues` : sold
  }
  return `${formatCount(stats.views)} vues · ${formatCount(stats.participants)} participants`
}

/** Carte d'un événement du créateur : visuel, titre, état, type, début et chiffres clés. */
export function StudioEventCard({ event }: { event: StudioEvent }) {
  const summary = summaryLine(event)

  return (
    <Link
      to={paths.studioEvent(event.id)}
      className="flex gap-3 rounded-xl border bg-card p-3 shadow-card transition-colors hover:bg-muted"
    >
      <EventPoster
        kind={event.kind}
        cover={event.cover}
        seed={event.caption}
        className="size-20 shrink-0 rounded-lg"
      />
      <span className="min-w-0 flex-1 space-y-1">
        <span className="flex items-start justify-between gap-2">
          <span className="line-clamp-2 text-body font-bold">{getEventTitle(event)}</span>
        </span>
        <span className="block">
          <StudioStatusPill status={event.status} />
        </span>
        <span className="block truncate text-caption text-muted-foreground">
          {STUDIO_KINDS[event.kind].short} · Début {formatEventStart(event)}
        </span>
        {summary ? (
          <span className="block truncate text-caption font-semibold">{summary}</span>
        ) : null}
      </span>
    </Link>
  )
}
