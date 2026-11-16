import { useLocalStore } from '@/hooks/use-local-store'
import { readNotificationsStore, TEMP_NOTIFICATIONS } from '@/lib/notifications'

/** Notifications et nombre de non-lues (pastille de la cloche). */
export function useNotifications() {
  const read = useLocalStore(readNotificationsStore)
  const unread = TEMP_NOTIFICATIONS.filter((n) => !read.includes(n.id)).length
  return { notifications: TEMP_NOTIFICATIONS, read, unread }
}
