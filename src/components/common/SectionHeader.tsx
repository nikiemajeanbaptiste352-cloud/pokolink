import { ChevronRight } from 'lucide-react'
import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'

import { cn } from '@/lib/utils'

interface SectionHeaderProps {
  title: ReactNode
  /** Texte secondaire sous le titre. */
  description?: string
  /** Lien « Voir tout » (affiché seulement si `to` est fourni). */
  to?: string
  actionLabel?: string
  /** Action personnalisée à droite (ex. bouton) ; prioritaire sur `to`. */
  action?: ReactNode
  className?: string
}

/** Titre de section avec lien d'action à droite. */
export function SectionHeader({
  title,
  description,
  to,
  actionLabel = 'Voir tout',
  action,
  className,
}: SectionHeaderProps) {
  return (
    <div className={cn('flex items-end justify-between gap-3 px-4', className)}>
      <div className="min-w-0">
        <h2 className="truncate text-title font-bold">{title}</h2>
        {description ? (
          <p className="truncate text-caption text-muted-foreground">{description}</p>
        ) : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
      {!action && to ? (
        <Link
          to={to}
          className="-my-2 -mr-1 inline-flex min-h-11 shrink-0 items-center gap-0.5 rounded-full px-1 text-caption font-semibold text-muted-foreground hover:text-foreground"
        >
          {actionLabel}
          <ChevronRight className="size-4" aria-hidden="true" />
        </Link>
      ) : null}
    </div>
  )
}
