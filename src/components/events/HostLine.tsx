import { Avatar } from '@/components/common/Avatar'
import { VerifiedBadge } from '@/components/common/VerifiedBadge'
import { HOST_TYPE_LABEL } from '@/lib/events'
import { cn } from '@/lib/utils'
import type { EventHost } from '@/types/event'

/** Organisateur d'un événement : avatar, nom, vérification et type. */
export function HostLine({ host, className }: { host: EventHost; className?: string }) {
  return (
    <span className={cn('flex min-w-0 items-center gap-2', className)}>
      <Avatar name={host.name} src={host.avatarSrc} size="sm" />
      <span className="flex min-w-0 flex-col leading-tight">
        <span className="flex min-w-0 items-center gap-1 text-sm font-semibold">
          <span className="truncate">{host.name}</span>
          {host.verified ? (
            <VerifiedBadge tone={host.type === 'creator' ? 'gold' : 'brand'} />
          ) : null}
        </span>
        <span className="text-caption text-muted-foreground">
          {HOST_TYPE_LABEL[host.type]}
        </span>
      </span>
    </span>
  )
}
