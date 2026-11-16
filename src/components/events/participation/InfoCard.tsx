import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'

import { cn } from '@/lib/utils'

const PAY = 'var(--brand)'

interface InfoCardProps {
  icon: LucideIcon
  title: string
  /** Repère à droite du titre (ex. « LIVE »). */
  aside?: ReactNode
  children: ReactNode
  className?: string
}

/** Carte sombre maquette participation : Informations / Progression. */
export function InfoCard({
  icon: Icon,
  title,
  aside,
  children,
  className,
}: InfoCardProps) {
  return (
    <section
      className={cn(
        'relative rounded-2xl border border-white/10 bg-[#1a1a1a] p-4 text-white shadow-lg',
        className,
      )}
    >
      <div className="mb-1 flex items-center justify-between gap-3">
        <h2 className="flex items-center gap-2 text-body font-extrabold">
          <span
            className="grid size-9 place-items-center rounded-full"
            style={{ background: 'color-mix(in srgb, #7c3aed 85%, white)' }}
          >
            <Icon className="size-4 text-white" aria-hidden="true" />
          </span>
          {title}
        </h2>
        {aside}
      </div>
      {children}
    </section>
  )
}

interface InfoRowProps {
  label: string
  value: ReactNode
  /** `money` : vert. `strong` : orange. */
  emphasis?: 'money' | 'strong'
}

export function InfoRow({ label, value, emphasis }: InfoRowProps) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-b border-white/10 py-3 last:border-b-0">
      <dt className="shrink-0 text-body text-white/65">{label}</dt>
      <dd
        className={cn(
          'min-w-0 text-right text-body break-words tabular-nums',
          emphasis === 'money' && 'font-extrabold text-[#22c55e]',
          emphasis === 'strong' && 'font-extrabold',
          !emphasis && 'font-semibold text-white',
        )}
        style={emphasis === 'strong' ? { color: PAY } : undefined}
      >
        {value}
      </dd>
    </div>
  )
}
