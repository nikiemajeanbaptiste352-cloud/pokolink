import { cn } from '@/lib/utils'

interface LogoProps {
  /** Version réduite (pastille) pour les espaces étroits. */
  compact?: boolean
  className?: string
}

/** Identité AfriConnect : mot-symbole vert, ou pastille réduite. */
export function Logo({ compact = false, className }: LogoProps) {
  if (compact) {
    return (
      <span
        aria-label="AfriConnect"
        role="img"
        className={cn(
          'grid size-10 place-items-center rounded-xl bg-brand text-lg font-extrabold text-brand-foreground',
          className,
        )}
      >
        A
      </span>
    )
  }

  return (
    <span className={cn('text-2xl font-extrabold tracking-tight text-brand', className)}>
      AfriConnect
    </span>
  )
}
