import { cn } from '@/lib/utils'

interface CountBadgeProps {
  count: number
  /** alert : notifications (rouge). brand : messages non lus (vert). */
  tone?: 'alert' | 'brand'
  className?: string
}

/** Pastille de compteur. Masquée à 0, plafonnée à 99+. */
export function CountBadge({ count, tone = 'alert', className }: CountBadgeProps) {
  if (count <= 0) return null
  const label = count > 99 ? '99+' : String(count)

  return (
    <span
      aria-hidden="true"
      className={cn(
        'inline-flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] leading-none font-bold ring-2 ring-background',
        tone === 'alert'
          ? 'bg-destructive text-destructive-foreground'
          : 'bg-brand text-brand-foreground',
        className,
      )}
    >
      {label}
    </span>
  )
}
