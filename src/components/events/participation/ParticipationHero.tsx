import { Share2, Timer } from 'lucide-react'
import { useState } from 'react'

import { BackLink } from '@/components/common/BackLink'
import { buttonVariants } from '@/components/ui/button'
import {
  EVENT_HUES,
  EVENT_KIND_FALLBACK_IMAGE,
  EVENT_KINDS,
  EVENT_STATE_LABEL,
  formatRemaining,
} from '@/lib/events'
import { shareOrCopy } from '@/lib/share'
import { cn } from '@/lib/utils'
import { paths } from '@/routes/paths'
import type { EventState, MarketEvent } from '@/types/event'

const PAY = 'var(--brand)'

const overlayButton = cn(
  buttonVariants({ variant: 'ghost', size: 'icon' }),
  'bg-black/45 text-white hover:bg-black/60 hover:text-white',
)

interface ParticipationHeroProps {
  event: MarketEvent
  state: EventState
  /** Heure courante (voir `useNow`). */
  now: number
}

/**
 * Hero maquette : image, badge format (ex. VENTE FLASH), compte à rebours,
 * retour et partage.
 */
export function ParticipationHero({ event, state, now }: ParticipationHeroProps) {
  const [notice, setNotice] = useState('')
  const { icon: KindIcon, label } = EVENT_KINDS[event.kind]
  const hue = EVENT_HUES[event.kind]
  const imageSrc =
    event.imageSrc ?? EVENT_KIND_FALLBACK_IMAGE[event.kind] ?? undefined

  const timeLabel =
    state === 'live'
      ? formatRemaining(event.endsAt - now)
      : state === 'upcoming'
        ? formatRemaining(event.startsAt - now)
        : EVENT_STATE_LABEL.ended

  async function share() {
    const url = `${window.location.origin}${paths.eventDetail(event.id)}`
    const result = await shareOrCopy(url, event.title)
    if (result === 'copied') setNotice('Lien copié dans le presse-papiers.')
    else if (result === 'failed') setNotice('Impossible de partager ce lien.')
    else setNotice('')
  }

  return (
    <header className="pt-safe relative aspect-[16/10] max-h-[42svh] min-h-44 overflow-hidden bg-neutral-900 text-white sm:max-h-none sm:min-h-52">
      {imageSrc ? (
        <img
          src={imageSrc}
          alt=""
          className="absolute inset-0 size-full object-cover"
        />
      ) : (
        <div
          aria-hidden="true"
          className="absolute inset-0"
          style={{
            background: `linear-gradient(165deg, hsl(${hue} 50% 26%) 0%, hsl(${hue} 60% 9%) 100%)`,
          }}
        />
      )}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-linear-to-t from-black/80 via-black/25 to-black/35"
      />

      <div className="relative flex items-center justify-between gap-2 px-3 pt-2">
        <BackLink
          to={paths.events}
          label="Événements"
          history
          className={overlayButton}
        />
        <button
          type="button"
          onClick={() => void share()}
          aria-label="Partager l’événement"
          className={overlayButton}
        >
          <Share2 className="size-5" aria-hidden="true" />
        </button>
      </div>

      <div className="absolute top-14 left-3">
        <span
          className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-[11px] font-extrabold tracking-wide text-white uppercase shadow-md"
          style={{ background: PAY }}
        >
          <KindIcon className="size-3.5" aria-hidden="true" />
          {label}
        </span>
      </div>

      {state !== 'ended' ? (
        <div className="absolute right-3 bottom-3">
          <span className="inline-flex items-center gap-1.5 rounded-lg bg-[#b91c1c] px-2.5 py-1.5 text-[12px] font-extrabold text-white shadow-md tabular-nums">
            <Timer className="size-3.5" aria-hidden="true" />
            {timeLabel}
          </span>
        </div>
      ) : null}

      <p role="status" className="sr-only">
        {notice}
      </p>
    </header>
  )
}
