/**
 * Notifications de l'utilisateur.
 *
 * DONNÉES TEMPORAIRES : la liste est un exemple. À remplacer par l'API : le serveur crée les
 * notifications (paiements, messages, événements…). Seul l'état « lu » est gardé ici, sur
 * l'appareil.
 */
import { createLocalStore } from '@/lib/local-store'
import { paths } from '@/routes/paths'

export type NotificationKind =
  'wallet' | 'message' | 'creator' | 'rewards' | 'learn' | 'order'

export interface AppNotification {
  id: string
  kind: NotificationKind
  title: string
  body: string
  timeLabel: string
  /** Écran à ouvrir en touchant la notification. */
  to: string
}

export const TEMP_NOTIFICATIONS: readonly AppNotification[] = [
  {
    id: 'n1',
    kind: 'wallet',
    title: 'Dépôt en attente de confirmation',
    body: 'Votre demande de dépôt est en cours de vérification par AfriConnect.',
    timeLabel: '10 min',
    to: paths.wallet,
  },
  {
    id: 'n2',
    kind: 'message',
    title: 'Fatou Sow vous a écrit',
    body: 'Super ! Je t’envoie les documents ce soir.',
    timeLabel: '1 h',
    to: paths.conversation('c1'),
  },
  {
    id: 'n3',
    kind: 'creator',
    title: 'Nouvel événement de @awa.cuisine',
    body: 'Un nouvel événement Creator Market vient d’ouvrir.',
    timeLabel: '3 h',
    to: paths.creator('awa.cuisine'),
  },
  {
    id: 'n4',
    kind: 'order',
    title: 'Suivi de vos achats',
    body: 'Consultez l’état de vos commandes et leurs confirmations.',
    timeLabel: 'Hier',
    to: paths.purchases,
  },
  {
    id: 'n5',
    kind: 'learn',
    title: 'AfriLearn : nouvelle réponse',
    body: 'Un membre a répondu à une question de votre niveau.',
    timeLabel: 'Hier',
    to: paths.learnFeed('terminale-d'),
  },
  {
    id: 'n6',
    kind: 'rewards',
    title: 'Rewards : des points vous attendent',
    body: 'Découvrez comment gagner et utiliser vos points.',
    timeLabel: '2 j',
    to: paths.rewards,
  },
]

/** Identifiants des notifications déjà lues sur cet appareil. */
export const readNotificationsStore = createLocalStore<readonly string[]>(
  'africonnect.notifications-read.v1',
  (raw) =>
    Array.isArray(raw) ? raw.filter((id): id is string => typeof id === 'string') : [],
)

export function markNotificationRead(id: string) {
  const read = readNotificationsStore.get()
  if (!read.includes(id)) readNotificationsStore.set([...read, id])
}

export function markAllNotificationsRead() {
  readNotificationsStore.set(TEMP_NOTIFICATIONS.map((n) => n.id))
}
