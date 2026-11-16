import { useState } from 'react'

import { getOpenStatus } from '@/lib/hours'
import { getServiceTypeMeta } from '@/lib/service-types'
import { cn } from '@/lib/utils'
import type { Service } from '@/types/service'

interface ServiceCoverProps {
  service: Service
  /** Affiche le badge « Ouvert » ou « Fermé » d'après les horaires. */
  showOpenStatus?: boolean
  className?: string
  children?: React.ReactNode
}

/** Photo de couverture d'un établissement, ou aplat d'accent si aucune photo. */
export function ServiceCover({
  service,
  showOpenStatus = true,
  className,
  children,
}: ServiceCoverProps) {
  const [now] = useState(() => new Date())
  const meta = getServiceTypeMeta(service.type)
  const Icon = meta.icon
  const status = getOpenStatus(service.hours, now)

  return (
    <div className={cn('relative h-36 overflow-hidden bg-primary', className)}>
      {service.cover ? (
        <img src={service.cover} alt="" className="size-full object-cover" />
      ) : (
        <div
          aria-hidden="true"
          className="grid size-full place-items-center bg-linear-to-br from-primary to-primary/60 text-primary-foreground"
        >
          <Icon className="size-14 opacity-40" strokeWidth={1.25} />
        </div>
      )}
      {showOpenStatus ? (
        <span className="absolute right-3 bottom-3 inline-flex items-center gap-1.5 rounded-full bg-black/70 px-2.5 py-1 text-caption font-bold text-white">
          <span
            aria-hidden="true"
            className={cn(
              'size-2 rounded-full',
              status.open ? 'bg-[#4ade80]' : 'bg-[#f87171]',
            )}
          />
          {status.open ? 'Ouvert' : 'Fermé'}
          <span className="sr-only"> : {status.label}</span>
        </span>
      ) : null}
      {children}
    </div>
  )
}
