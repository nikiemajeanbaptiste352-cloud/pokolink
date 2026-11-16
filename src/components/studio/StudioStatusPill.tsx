import { STUDIO_STATUS } from '@/lib/studio'
import { cn } from '@/lib/utils'
import type { StudioEventStatus } from '@/types/studio'

/** Pastille de couleur placée avant le libellé : le texte porte le sens, la couleur aide. */
const DOT: Record<StudioEventStatus, string> = {
  draft: 'bg-muted-foreground',
  in_review: 'bg-warning',
  rejected: 'bg-destructive',
  scheduled: 'bg-info',
  live: 'bg-success',
  ended: 'bg-muted-foreground/60',
  suspended: 'bg-destructive',
}

export function StudioStatusPill({
  status,
  className,
}: {
  status: StudioEventStatus
  className?: string
}) {
  return (
    <span
      className={cn(
        'inline-flex shrink-0 items-center gap-1.5 rounded-full bg-muted px-2.5 py-1 text-caption font-bold',
        className,
      )}
    >
      <span aria-hidden="true" className={cn('size-2 rounded-full', DOT[status])} />
      {STUDIO_STATUS[status].label}
    </span>
  )
}
