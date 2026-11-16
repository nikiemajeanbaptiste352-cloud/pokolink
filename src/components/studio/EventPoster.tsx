import { hueOf } from '@/lib/hue'
import { STUDIO_KINDS } from '@/lib/studio'
import { cn } from '@/lib/utils'
import type { StudioEventKind } from '@/types/studio'

interface EventPosterProps {
  kind: StudioEventKind
  /** Image de couverture ; à défaut, un dégradé provisoire tiré de la légende. */
  cover: string
  seed: string
  className?: string
}

/** Visuel d'un événement : couverture du créateur, ou fond provisoire avec l'icône du type. */
export function EventPoster({ kind, cover, seed, className }: EventPosterProps) {
  const Icon = STUDIO_KINDS[kind].icon
  const hue = hueOf(seed || kind)

  return (
    <span
      aria-hidden="true"
      className={cn(
        'relative grid place-items-center overflow-hidden text-white',
        className,
      )}
      style={{
        backgroundImage: `linear-gradient(145deg, hsl(${hue} 45% 32%), hsl(${(hue + 50) % 360} 50% 16%))`,
      }}
    >
      {cover ? (
        <img
          src={cover}
          alt=""
          loading="lazy"
          className="absolute inset-0 size-full object-cover"
        />
      ) : (
        <Icon className="size-1/3 opacity-60" strokeWidth={1.5} />
      )}
    </span>
  )
}
