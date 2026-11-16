import { Timer } from 'lucide-react'

import { formatCountdown, getEventState } from '@/lib/events'
import { cn } from '@/lib/utils'
import type { MarketEvent } from '@/types/event'

interface EventCountdownProps {
  event: MarketEvent
  /** Heure courante (voir `useNow`). */
  now: number
  className?: string
}

/** « Début dans … », « Fin dans … » ou « Terminé », mis à jour par le parent. */
export function EventCountdown({ event, now, className }: EventCountdownProps) {
  const state = getEventState(event, now)
  const text =
    state === 'upcoming'
      ? `Début dans ${formatCountdown(event.startsAt - now)}`
      : state === 'live'
        ? `Fin dans ${formatCountdown(event.endsAt - now)}`
        : 'Terminé'

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 text-caption font-bold tabular-nums',
        className,
      )}
    >
      <Timer className="size-4" aria-hidden="true" />
      {text}
    </span>
  )
}
