import { ChevronRight } from 'lucide-react'
import { Link } from 'react-router-dom'

import { toneSoft } from '@/lib/tones'
import { cn } from '@/lib/utils'
import type { PersonalTool } from '@/types/profile'

interface PersonalToolCardProps {
  tool: PersonalTool
  className?: string
  /**
   * `hub` : accès rapide compact (icône + titre).
   * `tile` : tuile grille.
   * `row` : ligne liste professionnelle.
   */
  variant?: 'hub' | 'tile' | 'row'
}

/** Carte d'un outil personnel du compte : un lien vers son interface. */
export function PersonalToolCard({
  tool,
  className,
  variant = 'tile',
}: PersonalToolCardProps) {
  const { title, description, icon: Icon, tone, to } = tool

  if (variant === 'hub') {
    return (
      <Link
        to={to}
        className={cn(
          'group flex flex-col items-center gap-1.5 rounded-xl px-1.5 py-2.5 text-center transition-colors active:bg-muted/70 hover:bg-muted/50',
          className,
        )}
      >
        <span
          className={cn(
            'grid size-11 place-items-center rounded-xl transition-transform duration-200 group-active:scale-95',
            toneSoft[tone],
          )}
        >
          <Icon className="size-[1.15rem]" strokeWidth={2} aria-hidden="true" />
        </span>
        <span className="line-clamp-2 w-full text-[11px] leading-tight font-semibold tracking-tight text-foreground">
          {title}
        </span>
      </Link>
    )
  }

  if (variant === 'row') {
    return (
      <Link
        to={to}
        className={cn(
          'flex min-h-[3.25rem] items-center gap-2.5 px-3 py-2 transition-colors hover:bg-muted/50',
          className,
        )}
      >
        <span
          className={cn(
            'grid size-10 shrink-0 place-items-center rounded-xl',
            toneSoft[tone],
          )}
        >
          <Icon className="size-5" strokeWidth={1.75} aria-hidden="true" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-[14px] font-bold tracking-tight">
            {title}
          </span>
          <span className="block truncate text-[12px] text-muted-foreground">
            {description}
          </span>
        </span>
        <ChevronRight
          className="size-4 shrink-0 text-muted-foreground/70"
          aria-hidden="true"
        />
      </Link>
    )
  }

  return (
    <Link
      to={to}
      className={cn(
        'flex min-h-24 flex-col items-start gap-3 rounded-[1.2rem] bg-card p-3.5 text-left ring-1 ring-black/[0.05] transition-colors hover:bg-muted/30',
        className,
      )}
    >
      <span className={cn('grid size-10 place-items-center rounded-xl', toneSoft[tone])}>
        <Icon className="size-5" strokeWidth={1.75} aria-hidden="true" />
      </span>
      <span className="space-y-0.5">
        <span className="block text-[14px] font-bold tracking-tight">{title}</span>
        <span className="block text-[12px] text-muted-foreground">{description}</span>
      </span>
    </Link>
  )
}
