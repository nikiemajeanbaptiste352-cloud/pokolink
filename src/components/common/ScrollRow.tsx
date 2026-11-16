import { Children, type ReactNode } from 'react'

import { cn } from '@/lib/utils'

interface ScrollRowProps {
  /** Libellé accessible de la liste. */
  label: string
  children: ReactNode
  className?: string
}

/** Rangée horizontale défilante : chaque enfant devient un élément de liste. */
export function ScrollRow({ label, children, className }: ScrollRowProps) {
  return (
    <ul
      aria-label={label}
      className={cn('flex scrollbar-none gap-3 overflow-x-auto px-4 pb-1', className)}
    >
      {Children.map(children, (child) => (
        // `relative` : contient les éléments absolus (ex. texte `sr-only`) dans la rangée,
        // pour qu'ils soient rognés par son défilement et n'élargissent pas la page.
        <li className="relative shrink-0">{child}</li>
      ))}
    </ul>
  )
}
