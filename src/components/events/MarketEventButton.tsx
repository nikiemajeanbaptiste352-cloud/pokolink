import { ChevronRight, Zap } from 'lucide-react'
import { Link } from 'react-router-dom'

import { paths } from '@/routes/paths'

/** Accès à Market Event depuis Explorer : mène au fil plein écran des événements. */
export function MarketEventButton() {
  return (
    <Link
      to={paths.events}
      className="relative flex min-h-16 items-center gap-3 overflow-hidden rounded-xl bg-brand p-4 text-brand-foreground"
    >
      {/* Voile sombre : garantit le contraste du texte sur le fond vert. */}
      <span
        aria-hidden="true"
        className="absolute inset-0 bg-linear-to-br from-transparent to-black/30"
      />
      <span className="relative grid size-11 shrink-0 place-items-center rounded-full bg-white/20">
        <Zap className="size-6" aria-hidden="true" />
      </span>
      <span className="relative min-w-0 flex-1">
        <span className="block text-title leading-tight font-extrabold">
          Market Event
        </span>
        <span className="block text-caption opacity-90">
          Ventes flash, lives, lancements et jeux
        </span>
      </span>
      <ChevronRight className="relative size-5 shrink-0" aria-hidden="true" />
    </Link>
  )
}
