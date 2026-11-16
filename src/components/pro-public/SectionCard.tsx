import { ChevronRight } from 'lucide-react'
import type { ReactNode } from 'react'

import { cn } from '@/lib/utils'

interface SectionCardProps {
  title: string
  /** Libellé du lien à droite du titre (ex. « Voir tout »). */
  seeAll?: string
  onSeeAll?: () => void
  className?: string
  children: ReactNode
}

/** Bloc de la vitrine publique : titre fort + « Voir tout » (marketplace). */
export function SectionCard({
  title,
  seeAll,
  onSeeAll,
  className,
  children,
}: SectionCardProps) {
  return (
    <section
      className={cn(
        'space-y-3 rounded-xl bg-card p-3.5 ring-1 ring-black/[0.06] sm:p-4',
        className,
      )}
    >
      <div className="flex items-center justify-between gap-3">
        <h2 className="min-w-0 text-[16px] font-extrabold tracking-tight break-words">
          {title}
        </h2>
        {seeAll && onSeeAll ? (
          <button
            type="button"
            onClick={onSeeAll}
            className="-my-1 inline-flex min-h-10 shrink-0 items-center gap-0.5 text-[12px] font-bold text-brand hover:text-brand/80"
          >
            {seeAll}
            <ChevronRight className="size-4" aria-hidden="true" />
          </button>
        ) : null}
      </div>
      {children}
    </section>
  )
}
