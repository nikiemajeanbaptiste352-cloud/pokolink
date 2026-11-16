import { cn } from '@/lib/utils'

interface ChipItem<T extends string> {
  id: T
  label: string
}

interface FilterChipsProps<T extends string> {
  items: readonly ChipItem<T>[]
  value: T
  onChange: (id: T) => void
  /** Libellé accessible du groupe de filtres. */
  label: string
  className?: string
}

/** Puces de filtre : rangée horizontale défilante, une seule sélection. */
export function FilterChips<T extends string>({
  items,
  value,
  onChange,
  label,
  className,
}: FilterChipsProps<T>) {
  return (
    <div
      role="group"
      aria-label={label}
      className={cn(
        'flex w-full min-w-0 max-w-full gap-2 overflow-x-auto overscroll-x-contain touch-pan-x px-4 [scrollbar-width:thin]',
        className,
      )}
    >
      {items.map((item) => {
        const selected = item.id === value
        return (
          <button
            key={item.id}
            type="button"
            aria-pressed={selected}
            onClick={() => onChange(item.id)}
            className={cn(
              'inline-flex h-10 shrink-0 items-center rounded-xl border px-3.5 text-sm font-semibold whitespace-nowrap transition-all duration-200',
              selected
                ? 'border-primary/30 bg-primary text-primary-foreground shadow-[0_10px_22px_-14px_var(--primary)]'
                : 'border-border/60 bg-card/90 text-secondary-foreground hover:bg-muted',
            )}
          >
            {item.label}
          </button>
        )
      })}
    </div>
  )
}

export type { ChipItem }
