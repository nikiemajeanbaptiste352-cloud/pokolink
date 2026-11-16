import { Search } from 'lucide-react'
import { forwardRef, type ComponentProps, type ReactNode } from 'react'

import { cn } from '@/lib/utils'

interface SearchFieldProps extends Omit<ComponentProps<'input'>, 'type' | 'children'> {
  /** Libellé accessible (le champ n'a pas d'étiquette visible). */
  label: string
  /** Élément à droite (ex. micro, filtre). */
  trailing?: ReactNode
}

/** Champ de recherche en pilule avec icône. */
export const SearchField = forwardRef<HTMLInputElement, SearchFieldProps>(
  function SearchField({ label, trailing, className, ...props }, ref) {
    return (
      <div
        className={cn(
          'flex h-11 items-center gap-2 rounded-full bg-input px-4 text-muted-foreground focus-within:ring-2 focus-within:ring-ring',
          className,
        )}
      >
        <Search className="size-5 shrink-0" aria-hidden="true" />
        <input
          ref={ref}
          type="search"
          aria-label={label}
          className="h-full min-w-0 flex-1 bg-transparent text-body text-foreground outline-none placeholder:text-muted-foreground [&::-webkit-search-cancel-button]:hidden"
          {...props}
        />
        {trailing}
      </div>
    )
  },
)
