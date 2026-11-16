import { Megaphone, Store, Users } from 'lucide-react'
import { Link } from 'react-router-dom'

import { Avatar } from '@/components/common/Avatar'
import { CountBadge } from '@/components/common/CountBadge'
import { CONTEXT_LABEL } from '@/lib/messaging-contexts'
import { cn } from '@/lib/utils'
import { paths } from '@/routes/paths'
import type { Conversation, ConversationKind } from '@/types/messages'

interface ConversationItemProps {
  conversation: Conversation
}

/** Pastille de type sur l'avatar : canal, groupe ou entreprise. */
function KindBadge({ kind }: { kind: Exclude<ConversationKind, 'direct'> }) {
  const meta =
    kind === 'channel'
      ? { Icon: Megaphone, label: 'Canal', className: 'bg-violet text-violet-foreground' }
      : kind === 'group'
        ? { Icon: Users, label: 'Groupe', className: 'bg-gold text-gold-foreground' }
        : { Icon: Store, label: 'Entreprise', className: 'bg-brand text-brand-foreground' }

  return (
    <span
      className={cn(
        'grid size-5 place-items-center rounded-full ring-2 ring-background',
        meta.className,
      )}
    >
      <meta.Icon className="size-3" aria-hidden="true" />
      <span className="sr-only">{meta.label}</span>
    </span>
  )
}

/** Ligne de conversation : avatar, nom, aperçu, heure et non-lus. */
export function ConversationItem({ conversation }: ConversationItemProps) {
  const { name, avatarSrc, kind, preview, time, unread, online, context } = conversation
  const hasUnread = unread > 0

  return (
    <Link
      to={paths.conversation(conversation.id)}
      className="flex min-h-[4.5rem] w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-muted"
    >
      <Avatar
        name={name}
        src={avatarSrc}
        size="lg"
        online={kind === 'direct' && online}
        corner={kind === 'direct' ? undefined : <KindBadge kind={kind} />}
      />

      <span className="min-w-0 flex-1">
        <span className="flex items-baseline justify-between gap-2">
          <span className="truncate text-body font-bold">{name}</span>
          <span
            className={cn(
              'shrink-0 text-caption',
              hasUnread ? 'font-semibold text-brand' : 'text-muted-foreground',
            )}
          >
            {time}
          </span>
        </span>
        {context ? (
          <span className="block truncate text-caption font-semibold text-brand">
            {CONTEXT_LABEL[context.type]} · {context.label}
          </span>
        ) : null}
        <span className="flex items-center justify-between gap-2">
          <span
            className={cn(
              'truncate text-body',
              hasUnread ? 'font-medium text-foreground' : 'text-muted-foreground',
            )}
          >
            {preview}
          </span>
          <CountBadge
            count={unread}
            tone="brand"
            className="h-5 min-w-5 text-xs ring-0"
          />
        </span>
      </span>
    </Link>
  )
}
