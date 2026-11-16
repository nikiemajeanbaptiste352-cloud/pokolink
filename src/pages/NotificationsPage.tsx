import {
  Bell,
  BookOpen,
  Clapperboard,
  Gift,
  MessageCircle,
  ShoppingBag,
  Wallet,
  type LucideIcon,
} from 'lucide-react'
import { Link } from 'react-router-dom'

import { BackLink } from '@/components/common/BackLink'
import { EmptyState } from '@/components/common/EmptyState'
import { PageHeader } from '@/components/common/PageHeader'
import { Button } from '@/components/ui/button'
import { useNotifications } from '@/hooks/use-notifications'
import {
  markAllNotificationsRead,
  markNotificationRead,
  type NotificationKind,
} from '@/lib/notifications'
import { toneSoft, type Tone } from '@/lib/tones'
import { cn } from '@/lib/utils'
import { paths } from '@/routes/paths'

const KINDS: Record<NotificationKind, { icon: LucideIcon; tone: Tone }> = {
  wallet: { icon: Wallet, tone: 'gold' },
  message: { icon: MessageCircle, tone: 'info' },
  creator: { icon: Clapperboard, tone: 'violet' },
  rewards: { icon: Gift, tone: 'brand' },
  learn: { icon: BookOpen, tone: 'info' },
  order: { icon: ShoppingBag, tone: 'brand' },
}

/** Notifications : un toucher ouvre l'écran concerné et marque la notification comme lue. */
export function NotificationsPage() {
  const { notifications, read, unread } = useNotifications()

  return (
    <>
      <PageHeader
        title="Notifications"
        leading={<BackLink to={paths.home} label="Accueil" history />}
        actions={
          <Button
            variant="outline"
            size="sm"
            disabled={unread === 0}
            onClick={markAllNotificationsRead}
          >
            Tout marquer comme lu
          </Button>
        }
      />

      {notifications.length === 0 ? (
        <EmptyState
          icon={Bell}
          title="Aucune notification"
          description="Vos alertes apparaîtront ici."
        />
      ) : (
        <ul className="divide-y">
          {notifications.map((notification) => {
            const { icon: Icon, tone } = KINDS[notification.kind]
            const isRead = read.includes(notification.id)
            return (
              <li key={notification.id}>
                <Link
                  to={notification.to}
                  onClick={() => markNotificationRead(notification.id)}
                  className={cn(
                    'flex min-h-16 items-start gap-3 px-4 py-3 transition-colors hover:bg-muted',
                    !isRead && 'bg-accent/40',
                  )}
                >
                  <span
                    className={cn(
                      'grid size-11 shrink-0 place-items-center rounded-full',
                      toneSoft[tone],
                    )}
                  >
                    <Icon className="size-5" aria-hidden="true" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span
                      className={cn(
                        'block text-body',
                        isRead ? 'font-semibold' : 'font-extrabold',
                      )}
                    >
                      {notification.title}
                      {isRead ? null : <span className="sr-only"> (non lue)</span>}
                    </span>
                    <span className="block text-caption text-muted-foreground">
                      {notification.body}
                    </span>
                  </span>
                  <span className="shrink-0 text-caption text-muted-foreground">
                    {notification.timeLabel}
                  </span>
                </Link>
              </li>
            )
          })}
        </ul>
      )}
    </>
  )
}
