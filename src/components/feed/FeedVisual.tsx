import { Play, type LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'

import { cn } from '@/lib/utils'

interface FeedVisualProps {
  /** Destination (la même que la barre de lien) : le visuel est cliquable. */
  to: string
  /** Libellé accessible du lien. */
  label: string
  /** Teinte (0-360) du fond provisoire tant qu'il n'y a pas d'image ni de vidéo. */
  hue: number
  icon: LucideIcon
  /** Contenu vidéo : affiche un bouton de lecture et un cadre plus haut. */
  video?: boolean
  imageSrc?: string | undefined
  /** Informations superposées en bas du visuel. */
  children?: ReactNode
}

/**
 * Visuel d'une carte du fil : image ou fond provisoire, avec une pastille « lecture » pour
 * les vidéos et des informations en bas. Toucher le visuel ouvre l'espace de diffusion.
 */
export function FeedVisual({
  to,
  label,
  hue,
  icon: Icon,
  video,
  imageSrc,
  children,
}: FeedVisualProps) {
  return (
    <Link
      to={to}
      aria-label={label}
      className={cn(
        'home-feed-visual group relative block w-full overflow-hidden text-white',
        video ? 'aspect-4/5 max-h-[78svh]' : 'aspect-[5/4] sm:aspect-4/3',
      )}
      style={{
        background: `linear-gradient(165deg, hsl(${hue} 52% 28%) 0%, hsl(${hue} 62% 8%) 100%)`,
      }}
    >
      {imageSrc ? (
        <img
          src={imageSrc}
          alt=""
          loading="lazy"
          className="absolute inset-0 size-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
        />
      ) : (
        <span aria-hidden="true" className="absolute inset-0 grid place-items-center">
          <Icon
            className="size-28 text-white/12 transition-transform duration-700 group-hover:scale-110"
            strokeWidth={1.25}
          />
        </span>
      )}

      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-25"
        style={{
          backgroundImage:
            'radial-gradient(circle at 20% 15%, white 0 1px, transparent 1.5px), radial-gradient(circle at 80% 70%, white 0 0.8px, transparent 1.2px)',
          backgroundSize: '18px 18px, 14px 14px',
        }}
      />

      {video ? (
        <span aria-hidden="true" className="absolute inset-0 grid place-items-center">
          <span className="grid size-[4.25rem] place-items-center rounded-full bg-black/55 shadow-lg ring-1 ring-white/25 backdrop-blur-sm transition-transform duration-300 group-hover:scale-105">
            <Play className="size-8 fill-current" />
          </span>
        </span>
      ) : null}

      {children ? (
        <span className="absolute inset-x-0 bottom-0 block space-y-1.5 bg-linear-to-t from-black/90 via-black/45 to-transparent p-4 pt-14">
          {children}
        </span>
      ) : null}
    </Link>
  )
}
