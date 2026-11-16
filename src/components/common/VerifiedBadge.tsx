import { BadgeCheck } from 'lucide-react'

import { cn } from '@/lib/utils'

interface VerifiedBadgeProps {
  /** brand : comptes et entreprises vérifiés. gold : créateurs. */
  tone?: 'brand' | 'gold'
  className?: string
}

/** Pictogramme de compte ou d'entreprise vérifié. */
export function VerifiedBadge({ tone = 'brand', className }: VerifiedBadgeProps) {
  return (
    <BadgeCheck
      role="img"
      aria-label="Compte vérifié"
      className={cn(
        'inline-block size-4 shrink-0 stroke-white',
        tone === 'brand' ? 'fill-brand' : 'fill-gold',
        className,
      )}
    />
  )
}
