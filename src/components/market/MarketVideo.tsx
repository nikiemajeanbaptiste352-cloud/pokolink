import { Play, Volume2, VolumeX } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

/** Ce dont le fond a besoin : commun aux événements « cotes » et « coins ». */
interface VideoSource {
  creatorName: string
  caption: string
  videoSrc?: string | undefined
  posterSrc?: string | undefined
}

/** Teintes des fonds provisoires (tant qu'aucune vidéo n'est fournie). */
const HUES = [150, 28, 285, 210] as const

interface MarketVideoProps {
  market: VideoSource
  index: number
  /** Lecture auto seulement quand la carte est active dans le fil. */
  active?: boolean
}

/**
 * Fond plein écran d'un événement : la vidéo du créateur, ou un fond provisoire animé.
 * La vidéo démarre seulement sur la carte active, en muet, et respecte « réduire les animations ».
 */
export function MarketVideo({ market, index, active = true }: MarketVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [playing, setPlaying] = useState(false)
  const [muted, setMuted] = useState(true)
  const { videoSrc, posterSrc } = market

  useEffect(() => {
    const video = videoRef.current
    if (!video || !videoSrc) return
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (active && !reduceMotion) {
      video.play().catch(() => setPlaying(false))
    } else {
      video.pause()
    }
  }, [active, videoSrc])

  function togglePlay() {
    const video = videoRef.current
    if (!video) return
    if (video.paused) void video.play()
    else video.pause()
  }

  if (!videoSrc) {
    const hue = HUES[index % HUES.length]
    return (
      <div
        aria-hidden="true"
        className="cote-tiktok-poster absolute inset-0 grid place-items-center overflow-hidden"
        style={{
          background: `linear-gradient(165deg, hsl(${hue} 48% 28%) 0%, hsl(${hue} 58% 8%) 100%)`,
        }}
      >
        <span
          className="cote-tiktok-poster-glow absolute inset-[-20%] opacity-50"
          style={{
            background: `radial-gradient(circle at 30% 25%, hsl(${hue} 70% 45% / 0.45), transparent 45%), radial-gradient(circle at 70% 75%, hsl(${hue} 80% 55% / 0.25), transparent 40%)`,
          }}
        />
        <span className="cote-tiktok-poster-mark -mt-24 text-[9rem] leading-none font-extrabold text-white/12">
          {market.creatorName
            .split(/\s+/)
            .slice(0, 2)
            .map((part) => part.charAt(0))
            .join('')}
        </span>
      </div>
    )
  }

  return (
    <>
      <video
        ref={videoRef}
        src={videoSrc}
        poster={posterSrc}
        muted={muted}
        loop
        playsInline
        preload="metadata"
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        aria-label={`Vidéo de ${market.creatorName} : ${market.caption}`}
        className="absolute inset-0 size-full object-cover"
      />
      <button
        type="button"
        onClick={togglePlay}
        aria-label={playing ? 'Mettre la vidéo en pause' : 'Lire la vidéo'}
        className="absolute inset-0 grid place-items-center focus-visible:outline-2 focus-visible:-outline-offset-4 focus-visible:outline-white"
      >
        {playing ? null : (
          <span className="grid size-20 place-items-center rounded-full bg-black/50 text-white shadow-lg ring-1 ring-white/20 backdrop-blur-sm">
            <Play className="size-9 fill-current" aria-hidden="true" />
          </span>
        )}
      </button>
      <button
        type="button"
        onClick={() => setMuted((value) => !value)}
        aria-label={muted ? 'Activer le son' : 'Couper le son'}
        aria-pressed={!muted}
        className="absolute top-[calc(env(safe-area-inset-top,0px)+8.75rem)] right-3 z-10 grid size-11 place-items-center rounded-full bg-black/50 text-white shadow-md ring-1 ring-white/15 backdrop-blur-sm md:top-44"
      >
        {muted ? (
          <VolumeX className="size-5" aria-hidden="true" />
        ) : (
          <Volume2 className="size-5" aria-hidden="true" />
        )}
      </button>
    </>
  )
}
