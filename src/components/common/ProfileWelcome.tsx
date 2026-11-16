import type { LucideIcon } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

import { accentStyle } from '@/lib/service-accents'
import { cn } from '@/lib/utils'
import type { AccentId } from '@/types/service'

function initials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('')
}

/**
 * Animation d’accueil à chaque ouverture d’un profil / espace :
 * « Bienvenue chez {nom} ».
 */
export function ProfileWelcome({
  name,
  eyebrow,
  subtitle,
  avatarSrc,
  icon: Icon,
  accentId,
  onDone,
}: {
  name: string
  eyebrow: string
  subtitle?: string
  avatarSrc?: string
  icon?: LucideIcon
  accentId?: AccentId
  onDone?: () => void
}) {
  const [phase, setPhase] = useState<'enter' | 'hold' | 'exit' | 'done'>('enter')
  const onDoneRef = useRef(onDone)
  const timersRef = useRef<number[]>([])
  const phaseRef = useRef(phase)
  const key = `${eyebrow}:${name}`

  useEffect(() => {
    onDoneRef.current = onDone
  }, [onDone])

  useEffect(() => {
    phaseRef.current = phase
  }, [phase])

  function clearTimers() {
    timersRef.current.forEach((id) => window.clearTimeout(id))
    timersRef.current = []
  }

  function finish() {
    setPhase('done')
    onDoneRef.current?.()
  }

  function dismiss() {
    if (phaseRef.current === 'exit' || phaseRef.current === 'done') return
    clearTimers()
    setPhase('exit')
    timersRef.current.push(window.setTimeout(finish, 420))
  }

  useEffect(() => {
    // Nouvelle identité → rejouer l’animation (équivalent remount).
    // eslint-disable-next-line react-hooks/set-state-in-effect -- reset chorégraphie volontaire
    setPhase('enter')
    clearTimers()
    timersRef.current = [
      window.setTimeout(() => setPhase('hold'), 40),
      window.setTimeout(() => setPhase('exit'), 2_050),
      window.setTimeout(finish, 2_650),
    ]
    return clearTimers
    // eslint-disable-next-line react-hooks/exhaustive-deps -- remount choreography on identity only
  }, [key])

  if (phase === 'done' || typeof document === 'undefined') return null

  const themed = Boolean(accentId)

  return createPortal(
    <div
      role="dialog"
      aria-live="polite"
      aria-label={`Bienvenue chez ${name}`}
      className={cn(
        'pro-welcome fixed inset-0 z-[80] flex cursor-pointer items-center justify-center px-6',
        themed && 'service-scope',
        phase === 'exit' && 'pro-welcome-exit',
      )}
      style={accentId ? accentStyle(accentId) : undefined}
      onClick={dismiss}
      onKeyDown={(e) => {
        if (e.key === 'Escape' || e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          dismiss()
        }
      }}
      tabIndex={0}
    >
      <div
        aria-hidden="true"
        className={cn(
          'pro-welcome-backdrop absolute inset-0',
          themed ? 'bg-primary' : 'bg-brand',
        )}
      />
      <div aria-hidden="true" className="pro-welcome-mesh pointer-events-none absolute inset-0" />
      <div aria-hidden="true" className="pro-welcome-orb pro-welcome-orb-a" />
      <div aria-hidden="true" className="pro-welcome-orb pro-welcome-orb-b" />
      <div aria-hidden="true" className="pro-welcome-vignette pointer-events-none absolute inset-0" />

      <div
        className={cn(
          'pro-welcome-stage relative z-10 flex w-full max-w-[20rem] flex-col items-center text-center',
          themed ? 'text-primary-foreground' : 'text-brand-foreground',
          phase === 'hold' && 'pro-welcome-stage-in',
          phase === 'exit' && 'pro-welcome-stage-out',
        )}
      >
        <div className="pro-welcome-mark relative mb-7 grid size-[5.25rem] place-items-center">
          <span aria-hidden="true" className="pro-welcome-ring pro-welcome-ring-outer" />
          <span aria-hidden="true" className="pro-welcome-ring pro-welcome-ring-inner" />
          <span className="pro-welcome-avatar relative z-10 grid size-[4.5rem] place-items-center overflow-hidden rounded-[1.35rem] bg-white/18 text-[1.35rem] font-black shadow-[0_18px_40px_-18px_rgba(0,0,0,0.45)] ring-2 ring-white/35 backdrop-blur-[2px]">
            {avatarSrc ? (
              <img src={avatarSrc} alt="" className="size-full object-cover" />
            ) : Icon ? (
              <Icon className="size-9" strokeWidth={1.75} aria-hidden="true" />
            ) : (
              <span aria-hidden="true">{initials(name) || '?'}</span>
            )}
          </span>
        </div>

        <p className="pro-welcome-eyebrow text-[11px] font-bold tracking-[0.22em] text-white/70 uppercase">
          {eyebrow}
        </p>

        <p className="pro-welcome-hello mt-3 text-[0.95rem] font-semibold tracking-wide text-white/88">
          Bienvenue chez
        </p>
        <h2 className="pro-welcome-name mt-1 text-[1.85rem] leading-[1.1] font-black tracking-tight text-balance text-white">
          {name}
        </h2>

        <span
          aria-hidden="true"
          className="pro-welcome-rule mt-4 h-px w-12 bg-linear-to-r from-transparent via-white/55 to-transparent"
        />

        {subtitle ? (
          <p className="pro-welcome-sub mt-3 line-clamp-2 text-[13px] font-medium text-white/78">
            {subtitle}
          </p>
        ) : null}

        <p className="pro-welcome-hint mt-8 text-[11px] font-medium tracking-wide text-white/45">
          Toucher pour continuer
        </p>
      </div>
    </div>,
    document.body,
  )
}
