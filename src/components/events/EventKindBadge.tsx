import { EVENT_KINDS, EVENT_STATE_LABEL } from '@/lib/events'
import type { Tone } from '@/lib/tones'
import { cn } from '@/lib/utils'
import type { EventKind, EventState } from '@/types/event'

/** Texte toujours en couleur de premier plan (contraste AA) ; seule l'icône est teintée. */
const kindIcon: Record<Tone, string> = {
  brand: 'text-brand',
  gold: 'text-warning',
  violet: 'text-violet',
  red: 'text-destructive',
  amber: 'text-warning',
  info: 'text-info',
  neutral: 'text-muted-foreground',
}

export function EventKindBadge({ kind }: { kind: EventKind }) {
  const { label, icon: Icon, tone } = EVENT_KINDS[kind]
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-1 text-caption font-bold text-foreground">
      <Icon className={cn('size-3.5', kindIcon[tone])} aria-hidden="true" />
      {label}
    </span>
  )
}

const stateClasses: Record<EventState, string> = {
  live: 'bg-destructive text-destructive-foreground',
  upcoming: 'bg-muted text-foreground',
  ended: 'bg-muted text-muted-foreground',
}

export function EventStateBadge({ state }: { state: EventState }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-caption font-bold',
        stateClasses[state],
      )}
    >
      {state === 'live' ? (
        <span aria-hidden="true" className="size-2 rounded-full bg-current" />
      ) : null}
      {EVENT_STATE_LABEL[state]}
    </span>
  )
}
