/**
 * DONNÉES TEMPORAIRES : uniquement pour vérifier le rendu.
 * À remplacer par les données réelles de l'API (TanStack Query).
 */
import { paths } from '@/routes/paths'
import type { Post, Story } from '@/types/feed'
import type { Conversation } from '@/types/messages'

export const TEMP_COUNTS = {
  notifications: 3,
  messages: 8,
} as const

export const TEMP_CURRENT_USER = {
  name: 'Amadou Ba',
  firstName: 'Amadou',
} as const

export const TEMP_CONVERSATIONS: readonly Conversation[] = [
  {
    id: 'c1',
    name: 'Fatou Sow',
    kind: 'direct',
    preview: "Super ! Je t'envoie les documents ce soir",
    time: '14:32',
    unread: 2,
    online: true,
  },
  {
    id: 'c3',
    name: 'AfriConnect Business',
    kind: 'business',
    preview: 'Votre commande a été confirmée',
    time: '11:00',
    unread: 0,
  },
  {
    id: 'c4',
    name: 'Moussa Diakité',
    kind: 'direct',
    preview: 'Merci pour le transfert 👍',
    time: 'Hier',
    unread: 0,
    online: true,
  },
  {
    id: 'c5',
    name: 'Awa Traoré',
    kind: 'direct',
    preview: 'Tu as vu les nouvelles fonctions AfriConnect ?',
    time: 'Hier',
    unread: 1,
    online: true,
  },
]

export const TEMP_STORIES: readonly Story[] = [
  { id: 's0', name: 'Moi', isOwn: true, seen: true },
  { id: 's1', name: 'Fatou' },
  { id: 's2', name: 'Kofi' },
  { id: 's3', name: 'Awa' },
  { id: 's4', name: 'Moussa' },
  { id: 's5', name: 'Aïssatou', seen: true },
]

export const TEMP_POSTS: readonly Post[] = [
  {
    id: 'p1',
    author: {
      name: 'Fatou Sow',
      verified: true,
      to: paths.creator('fatou.mode'),
    },
    time: '2h',
    text: "Fière de lancer mon nouveau projet entrepreneurial ! AfriConnect m'a permis de toucher mes clients directement. Merci à toute la communauté 🙏🌍",
    media: { alt: 'Une cliente règle un achat avec son téléphone' },
    partnershipLink: '/createur/amadou.ba/publicite/sap-1',
    likes: 342,
    comments: 56,
    shares: 28,
  },
  {
    id: 'p2',
    author: {
      name: 'Groupe Entrepreneurs DKR',
      to: paths.explore,
    },
    time: '5h',
    text: 'Rappel : réunion mensuelle demain à 10h. Venez avec vos questions et vos idées !',
    likes: 87,
    comments: 12,
    shares: 3,
  },
]
