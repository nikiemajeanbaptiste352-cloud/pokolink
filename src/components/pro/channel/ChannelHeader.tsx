import { Megaphone, MessageSquare, Settings, Share2 } from 'lucide-react'
import { Link } from 'react-router-dom'

import { Media } from '@/components/common/Media'
import { StatusPill } from '@/components/pro/shared'
import { Button, buttonVariants } from '@/components/ui/button'
import { formatCount } from '@/lib/format'
import { channelConversationId } from '@/lib/pro-channel-messaging'
import { cn } from '@/lib/utils'
import { paths } from '@/routes/paths'
import type { ChannelSettings } from '@/types/pro'

interface ChannelHeaderProps {
  channel: ChannelSettings
  serviceName: string
  serviceId: string
  memberCount: number
  /** Lien messagerie côté pro (aperçu du fil tel que vu par les abonnés). */
  openInMessages?: boolean
  onShare: () => void
  onOpenSettings: () => void
}

/**
 * En-tête façon Telegram : photo, nom du canal, compteur d'abonnés, actions.
 * Le canal existe dès la création de l'Espace Pro — rien à « créer » ici.
 */
export function ChannelHeader({
  channel,
  serviceName,
  serviceId,
  memberCount,
  openInMessages = true,
  onShare,
  onOpenSettings,
}: ChannelHeaderProps) {
  return (
    <section aria-label="Canal" className="overflow-hidden border-b bg-card">
      <div className="relative h-28 bg-linear-to-br from-violet/30 via-muted to-brand/20">
        {channel.avatar ? (
          <img
            src={channel.avatar}
            alt=""
            className="absolute inset-0 size-full object-cover opacity-40"
          />
        ) : null}
      </div>
      <div className="relative -mt-10 space-y-3 px-4 pb-4">
        <Media
          src={channel.avatar || undefined}
          alt=""
          icon={Megaphone}
          tone="violet"
          className="size-20 rounded-full border-4 border-card shadow-card"
        />
        <div className="space-y-1">
          <h3 className="text-title font-extrabold">{channel.name}</h3>
          <p className="text-caption text-muted-foreground">
            Canal · {serviceName} · {formatCount(memberCount)} abonné
            {memberCount > 1 ? 's' : ''}
          </p>
          <div className="flex flex-wrap gap-2 pt-1">
            <StatusPill>{channel.state === 'active' ? 'Actif' : 'Archivé'}</StatusPill>
            <StatusPill>
              {channel.mode === 'broadcast' ? 'Diffusion' : 'Participatif'}
            </StatusPill>
          </div>
        </div>
        {channel.description ? (
          <p className="text-body text-muted-foreground">{channel.description}</p>
        ) : null}
        <p className="text-caption text-muted-foreground">
          Créé automatiquement avec votre Espace Pro. Les abonnés le retrouvent dans
          Messages → Canaux.
        </p>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={onShare}>
            <Share2 aria-hidden="true" />
            Partager
          </Button>
          <Button variant="outline" onClick={onOpenSettings}>
            <Settings aria-hidden="true" />
            Paramètres
          </Button>
          {openInMessages ? (
            <Link
              to={paths.conversation(channelConversationId(serviceId))}
              className={cn(buttonVariants({ variant: 'outline' }))}
            >
              <MessageSquare aria-hidden="true" />
              Voir dans Messages
            </Link>
          ) : null}
        </div>
      </div>
    </section>
  )
}
