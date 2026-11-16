import { toneSoft } from '@/lib/tones'
import { formatCount } from '@/lib/format'
import { cn } from '@/lib/utils'
import type { Category } from '@/types/explore'

interface CategoryTileProps {
  category: Category
  /** Catégorie actuellement choisie. */
  selected?: boolean
  onSelect?: (category: Category) => void
}

/** Tuile de catégorie : icône teintée, libellé et effectif facultatif. */
export function CategoryTile({
  category,
  selected = false,
  onSelect,
}: CategoryTileProps) {
  const { label, icon: Icon, tone, count } = category

  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={() => onSelect?.(category)}
      className="flex w-20 flex-col items-center gap-1.5 rounded-xl py-1"
    >
      <span
        className={cn(
          'grid size-14 place-items-center rounded-2xl ring-2 transition-shadow',
          toneSoft[tone],
          selected ? 'ring-primary' : 'ring-transparent',
        )}
      >
        <Icon className="size-6" strokeWidth={1.75} aria-hidden="true" />
      </span>
      {/* Légèrement plus large que la tuile pour éviter de tronquer « Supermarchés ». */}
      <span
        className={cn(
          '-mx-1 w-[calc(100%+0.5rem)] truncate text-center text-caption font-semibold',
          selected && 'text-brand',
        )}
      >
        {label}
      </span>
      {count !== undefined ? (
        <span className="-mt-1 text-[11px] leading-none text-muted-foreground">
          {formatCount(count)}
        </span>
      ) : null}
    </button>
  )
}
