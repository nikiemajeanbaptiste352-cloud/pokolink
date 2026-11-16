import { ChevronRight } from 'lucide-react'
import { Link } from 'react-router-dom'

import { Media } from '@/components/common/Media'
import { getServiceTypeMeta } from '@/lib/service-types'
import { cn } from '@/lib/utils'
import { paths } from '@/routes/paths'
import type { Service } from '@/types/service'

interface ServiceCardProps {
  service: Service
  className?: string
}

/** Carte d'un établissement dans « Mes services » : ouvre son espace professionnel. */
export function ServiceCard({ service, className }: ServiceCardProps) {
  const meta = getServiceTypeMeta(service.type)
  const isDraft = service.status === 'draft'
  // Un service non configuré ouvre directement la configuration.
  const to = isDraft ? paths.serviceSettings(service.id) : paths.proSpaceFor(service.id)

  return (
    <Link
      to={to}
      className={cn(
        'flex min-h-20 items-center gap-3 rounded-xl border bg-card p-3 shadow-card transition-colors hover:bg-muted',
        className,
      )}
    >
      <Media
        src={service.logo || undefined}
        alt=""
        icon={meta.icon}
        tone={meta.tone}
        className="size-14 shrink-0 rounded-xl"
      />
      <span className="min-w-0 flex-1 space-y-0.5">
        <span className="block truncate text-body font-bold">{service.name}</span>
        <span className="block truncate text-caption text-muted-foreground">
          {meta.label}
          {service.city ? ` · ${service.city}` : ''}
        </span>
        <span
          className={cn(
            'inline-flex items-center rounded-full px-2 py-0.5 text-caption font-semibold',
            isDraft ? 'bg-warning/20 text-foreground' : 'bg-brand/12 text-brand',
          )}
        >
          {isDraft ? 'À configurer' : 'Actif'}
        </span>
      </span>
      <ChevronRight
        className="size-5 shrink-0 text-muted-foreground"
        aria-hidden="true"
      />
    </Link>
  )
}
