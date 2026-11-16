import type { LucideIcon } from 'lucide-react'

import { toneGradient, type Tone } from '@/lib/tones'
import { cn } from '@/lib/utils'

interface MediaProps {
  src?: string
  alt?: string
  /** Icône du visuel provisoire (affichée tant qu'il n'y a pas de `src`). */
  icon: LucideIcon
  tone?: Tone
  /** Dimensions et arrondis : fournis par le parent. */
  className?: string
}

/** Image de contenu, ou visuel provisoire teinté avec icône si aucune image. */
export function Media({
  src,
  alt = '',
  icon: Icon,
  tone = 'neutral',
  className,
}: MediaProps) {
  if (src) {
    return (
      <img src={src} alt={alt} loading="lazy" className={cn('object-cover', className)} />
    )
  }

  return (
    <div
      aria-hidden="true"
      className={cn(
        'grid place-items-center bg-linear-to-br',
        toneGradient[tone],
        className,
      )}
    >
      <Icon className="size-8 opacity-70" strokeWidth={1.5} />
    </div>
  )
}
