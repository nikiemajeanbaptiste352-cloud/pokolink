import { useState, type ReactNode } from 'react'

import { cn } from '@/lib/utils'

const sizes = {
  sm: 'size-8 text-xs',
  md: 'size-10 text-sm',
  lg: 'size-12 text-base',
  xl: 'size-16 text-lg',
  '2xl': 'size-24 text-3xl',
} as const

type AvatarSize = keyof typeof sizes

/**
 * none  : aucun anneau
 * story : story non vue (anneau vert)
 * seen  : story déjà vue (anneau discret)
 */
type AvatarRing = 'none' | 'story' | 'seen'

interface AvatarProps {
  name: string
  src?: string
  size?: AvatarSize
  ring?: AvatarRing
  /** Pastille verte « en ligne » en bas à droite. */
  online?: boolean
  /** Élément personnalisé en bas à droite (ex. bouton « + » de story). */
  corner?: ReactNode
  className?: string
}

function getInitials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('')
}

/** Avatar rond : photo, ou initiales si l'image est absente ou en erreur. */
export function Avatar({
  name,
  src,
  size = 'md',
  ring = 'none',
  online = false,
  corner,
  className,
}: AvatarProps) {
  const [failed, setFailed] = useState(false)
  const showImage = Boolean(src) && !failed

  return (
    <span className={cn('relative inline-flex shrink-0', className)}>
      <span
        className={cn(
          'inline-flex rounded-full',
          ring !== 'none' && 'border-2 p-0.5',
          ring === 'story' && 'border-brand',
          ring === 'seen' && 'border-muted-foreground/40',
        )}
      >
        {showImage ? (
          <img
            src={src}
            alt={name}
            loading="lazy"
            onError={() => setFailed(true)}
            className={cn('rounded-full object-cover', sizes[size])}
          />
        ) : (
          <span
            role="img"
            aria-label={name}
            className={cn(
              'inline-grid place-items-center rounded-full bg-accent font-bold text-accent-foreground',
              sizes[size],
            )}
          >
            {getInitials(name)}
          </span>
        )}
      </span>

      {online ? (
        <span className="absolute right-0 bottom-0 size-3 rounded-full bg-success ring-2 ring-background">
          <span className="sr-only">En ligne</span>
        </span>
      ) : null}
      {corner ? <span className="absolute -right-0.5 -bottom-0.5">{corner}</span> : null}
    </span>
  )
}

export type { AvatarProps, AvatarRing, AvatarSize }
