import { Bell, QrCode } from 'lucide-react'
import { Link } from 'react-router-dom'

import { BackLink } from '@/components/common/BackLink'
import { getServiceTypeMeta } from '@/lib/service-types'
import { paths } from '@/routes/paths'
import type { Service } from '@/types/service'

const actionClass =
  'inline-flex size-10 items-center justify-center rounded-xl border border-primary-foreground/15 bg-primary-foreground/10 transition-colors hover:bg-primary-foreground/20'

/** En-tête coloré de l'espace professionnel : logo, nom, type, QR code, notifications. */
export function ServiceHeader({ service }: { service: Service }) {
  const meta = getServiceTypeMeta(service.type)
  const Icon = meta.icon
  const place = [meta.label, service.city].filter(Boolean).join(' · ')

  return (
    <header className="pt-safe sticky top-0 z-20 border-b border-primary-foreground/10 bg-primary/95 text-primary-foreground shadow-[0_8px_24px_-16px_rgba(0,0,0,0.45)] backdrop-blur-xl">
      <div className="flex h-16 items-center gap-2.5 px-3 sm:px-4">
        <BackLink
          to={paths.proSpaceFor(service.id)}
          label="Espace Pro"
          className="-ml-1 rounded-xl hover:bg-primary-foreground/15 hover:text-primary-foreground"
        />
        <span className="grid size-10 shrink-0 place-items-center overflow-hidden rounded-xl border border-primary-foreground/20 bg-primary-foreground/15 shadow-sm">
          {service.logo ? (
            <img src={service.logo} alt="" className="size-full object-cover" />
          ) : (
            <Icon className="size-5" aria-hidden="true" />
          )}
        </span>
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-body leading-tight font-extrabold tracking-tight">
            {service.name}
          </h1>
          <p className="truncate text-[11px] font-medium tracking-wide text-primary-foreground/80 uppercase sm:text-caption sm:normal-case sm:tracking-normal">
            {place}
          </p>
        </div>
        <Link
          to={`${paths.serviceSettings(service.id)}?etape=8`}
          aria-label="QR code de l’établissement"
          className={actionClass}
        >
          <QrCode className="size-5" aria-hidden="true" />
        </Link>
        <Link
          to={`${paths.service(service.id)}/notifications`}
          aria-label="Notifications"
          className={actionClass}
        >
          <Bell className="size-5" aria-hidden="true" />
        </Link>
      </div>
    </header>
  )
}
