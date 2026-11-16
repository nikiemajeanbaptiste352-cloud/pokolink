import { ChevronRight } from 'lucide-react'
import { Children, type ReactNode } from 'react'
import { Link } from 'react-router-dom'

import { ScrollRow } from '@/components/common/ScrollRow'
import { cn } from '@/lib/utils'

interface ExploreSectionProps {
  id: string
  title: string
  description?: string
  /** Lien « Voir tout » vers un autre écran (facultatif). */
  to?: string
  /** Action « Voir tout » personnalisée (ex. ouvrir la rubrique dans Explorer). */
  action?: ReactNode
  /** Libellé accessible de la liste de cartes. */
  rowLabel: string
  /**
   * `rail` : rangée horizontale. `grid` : grille verticale marketplace.
   */
  layout?: 'rail' | 'grid'
  /** Colonnes de la grille (classes Tailwind). */
  gridClassName?: string
  /** Bandeau promo (ex. flash deals). */
  accent?: 'default' | 'deal'
  children: ReactNode
}

/**
 * Rubrique Explorer style marketplace : titre fort, « Voir tout », grille ou rail.
 */
export function ExploreSection({
  id,
  title,
  description,
  to,
  action,
  rowLabel,
  layout = 'rail',
  gridClassName = 'grid-cols-2 gap-2.5 sm:grid-cols-3 sm:gap-3',
  accent = 'default',
  children,
}: ExploreSectionProps) {
  const deal = accent === 'deal'

  return (
    <section
      aria-labelledby={id}
      className={cn(
        'space-y-2.5',
        deal && 'bg-linear-to-b from-gold/15 to-transparent py-3',
      )}
    >
      <div className="flex items-end justify-between gap-3 px-4">
        <div className="min-w-0">
          <h2
            id={id}
            className={cn(
              'truncate text-[17px] font-extrabold tracking-tight',
              deal && 'text-brand',
            )}
          >
            {title}
          </h2>
          {description ? (
            <p className="truncate text-[11px] text-muted-foreground">{description}</p>
          ) : null}
        </div>
        {action ? <div className="shrink-0">{action}</div> : null}
        {!action && to ? (
          <Link
            to={to}
            className="-my-2 -mr-1 inline-flex min-h-11 shrink-0 items-center gap-0.5 px-1 text-[12px] font-bold text-brand hover:text-brand/80"
          >
            Voir tout
            <ChevronRight className="size-4" aria-hidden="true" />
          </Link>
        ) : null}
      </div>
      {layout === 'grid' ? (
        <ul
          aria-label={rowLabel}
          className={cn('explore-card-stagger grid px-3 sm:px-4', gridClassName)}
        >
          {Children.map(children, (child) => (
            <li className="relative min-w-0">{child}</li>
          ))}
        </ul>
      ) : (
        <ScrollRow
          label={rowLabel}
          className="explore-card-stagger snap-x scroll-px-3 gap-2.5 pe-4 sm:scroll-px-4"
        >
          {children}
        </ScrollRow>
      )}
    </section>
  )
}
