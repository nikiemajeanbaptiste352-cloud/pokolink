import type { ReactNode } from 'react'

import { cn } from '@/lib/utils'

interface PageHeaderProps {
  /** Titre ou logo affiché à gauche : sert de titre principal (h1) de la page. */
  title: ReactNode
  /** Titre agrandi (24px) pour les écrans de liste, comme Messages. */
  large?: boolean
  /** Élément avant le titre, typiquement un bouton retour. */
  leading?: ReactNode
  /** Actions (icônes) alignées à droite. */
  actions?: ReactNode
  /** Fond transparent superposé au contenu (ex. Shorts en plein écran). */
  overlay?: boolean
  className?: string
}

/** En-tête de page : fixe en haut du défilement, hauteur normalisée. */
export function PageHeader({
  title,
  large = false,
  leading,
  actions,
  overlay = false,
  className,
}: PageHeaderProps) {
  return (
    <header
      className={cn(
        'pt-safe z-20 flex min-h-(--header-height) items-center justify-between gap-2 px-3 sm:gap-3 sm:px-4',
        overlay
          ? 'absolute inset-x-0 top-0 text-white'
          : 'sticky top-0 border-b border-border/50 bg-background',
        className,
      )}
    >
      <div className="flex min-w-0 items-center gap-1.5 sm:gap-2">
        {leading ? <div className="-ml-1.5 shrink-0 sm:-ml-2">{leading}</div> : null}
        <h1
          className={cn(
            'min-w-0 truncate font-extrabold tracking-tight',
            large ? 'text-[1.25rem] leading-7 sm:text-headline' : 'text-title',
          )}
        >
          {title}
        </h1>
      </div>
      {actions ? (
        <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">{actions}</div>
      ) : null}
    </header>
  )
}
