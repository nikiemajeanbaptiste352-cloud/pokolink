import { FEED_FILTERS, type FeedFilter } from '@/lib/feed'
import { cn } from '@/lib/utils'

interface FeedFiltersProps {
  value: FeedFilter
  onChange: (value: FeedFilter) => void
}

/** Filtres du fil — rangée secondaire sticky, style Facebook léger. */
export function FeedFilters({ value, onChange }: FeedFiltersProps) {
  return (
    <div
      role="group"
      aria-label="Type de contenu"
      className="home-feed-filters sticky top-(--header-height) z-10 flex scrollbar-none gap-1.5 overflow-x-auto border-b border-black/5 bg-card/95 px-3 py-2 backdrop-blur-md sm:px-4"
    >
      {FEED_FILTERS.map((filter) => (
        <button
          key={filter.id}
          type="button"
          aria-pressed={value === filter.id}
          onClick={() => onChange(filter.id)}
          className={cn(
            'inline-flex h-8 shrink-0 items-center rounded-full px-3.5 text-[13px] font-semibold whitespace-nowrap transition-[background-color,color,transform] active:scale-[0.97]',
            value === filter.id
              ? 'bg-brand/12 text-brand'
              : 'bg-transparent text-muted-foreground hover:bg-muted/70 hover:text-foreground',
          )}
        >
          {filter.label}
        </button>
      ))}
    </div>
  )
}
