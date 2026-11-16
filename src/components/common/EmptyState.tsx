import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'

import { toneSoft, type Tone } from '@/lib/tones'
import { cn } from '@/lib/utils'

interface EmptyStateProps {
  icon: LucideIcon
  title: string
  description?: string
  tone?: Tone
  /** Action principale (bouton ou lien). */
  action?: ReactNode
  className?: string
}

/** Écran ou bloc vide : explique pourquoi et propose la prochaine action. */
export function EmptyState({
  icon: Icon,
  title,
  description,
  tone = 'neutral',
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn('flex flex-col items-center gap-3 px-6 py-10 text-center', className)}
    >
      <span className={cn('grid size-14 place-items-center rounded-2xl', toneSoft[tone])}>
        <Icon className="size-7" strokeWidth={1.75} aria-hidden="true" />
      </span>
      <div className="space-y-1">
        <p className="text-title font-bold">{title}</p>
        {description ? (
          <p className="mx-auto max-w-80 text-body text-muted-foreground">
            {description}
          </p>
        ) : null}
      </div>
      {action}
    </div>
  )
}
