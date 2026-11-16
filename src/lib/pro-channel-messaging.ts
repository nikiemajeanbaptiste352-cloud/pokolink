/**
 * Pont Canal Pro ↔ messagerie centrale.
 *
 * Le canal naît avec l'Espace Pro (pas de bouton « Créer un canal »). Quand un client
 * s'abonne à l'établissement, le canal apparaît dans Messages → Canaux. Discuter ouvre
 * toujours un chat privé (business), comme WhatsApp.
 */
import {
  formatMessageTime,
  getConversationsState,
  replaceConversationsState,
} from '@/lib/conversations-store'
import { proProfilePath } from '@/lib/messaging-contexts'
import { getProExtras } from '@/lib/pro-extras-store'
import { paths } from '@/routes/paths'
import type { ChatMessage, Conversation } from '@/types/messages'
import type { ChannelPost, ChannelSettings } from '@/types/pro'
import type { CatalogItem, Service } from '@/types/service'

export function channelConversationId(serviceId: string): string {
  return `channel:${serviceId}`
}

function lastPublished(posts: readonly ChannelPost[]): ChannelPost | undefined {
  return [...posts]
    .filter((post) => post.status === 'published')
    .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt))[0]
}

function previewFromPost(post: ChannelPost | undefined, channelName: string): string {
  if (!post) return `Bienvenue sur ${channelName}`
  return post.title || post.description.slice(0, 80)
}

/**
 * Assure la présence du canal dans la messagerie du client (après abonnement).
 * Idempotent : une seule conversation `channel:{serviceId}`.
 */
export function ensureProChannel(
  service: Service,
  extras?: { channel: ChannelSettings; posts: readonly ChannelPost[] },
): string {
  const id = channelConversationId(service.id)
  const data = extras ?? getProExtras(service, [] as CatalogItem[])
  const channel = data.channel
  const post = lastPublished(data.posts)
  const now = Date.now()
  const current = getConversationsState()
  const existing = current.conversations.find(
    (c) => c.id === id || (c.kind === 'channel' && c.professionalSpaceId === service.id),
  )

  if (existing) {
    const preview = previewFromPost(post, channel.name)
    const avatarSrc = channel.avatar || service.logo || undefined
    const profileTo = proProfilePath(service)
    const contextTo = paths.establishmentPosts(service.username || service.id)
    const time = post
      ? formatMessageTime(new Date(post.publishedAt).getTime(), now)
      : existing.time
    // Ne pas réécrire le store à chaque effet (évite boucles de rendu).
    const unchanged =
      existing.id === id &&
      existing.name === channel.name &&
      existing.avatarSrc === avatarSrc &&
      existing.preview === preview &&
      existing.time === time &&
      existing.profileTo === profileTo &&
      existing.context?.to === contextTo
    if (unchanged) return id

    const updated: Conversation = {
      ...existing,
      id,
      name: channel.name,
      avatarSrc,
      kind: 'channel',
      preview,
      time,
      professionalSpaceId: service.id,
      profileTo,
      context: {
        type: 'pro_channel',
        id: service.id,
        label: channel.name,
        to: contextTo,
      },
      updatedAt: now,
    }
    replaceConversationsState({
      conversations: current.conversations.map((c) =>
        c.id === existing.id ? updated : c,
      ),
      messages: current.messages,
    })
    return id
  }

  const conversation: Conversation = {
    id,
    name: channel.name,
    avatarSrc: channel.avatar || service.logo || undefined,
    kind: 'channel',
    preview: previewFromPost(post, channel.name),
    time: formatMessageTime(now, now),
    unread: post ? 1 : 0,
    recipientId: `channel:${service.id}`,
    professionalSpaceId: service.id,
    profileTo: proProfilePath(service),
    context: {
      type: 'pro_channel',
      id: service.id,
      label: channel.name,
      to: paths.establishmentPosts(service.username || service.id),
    },
    createdAt: now,
    updatedAt: now,
  }

  const seeded: ChatMessage[] = post
    ? [
        {
          id: `chmsg-${post.id}`,
          conversationId: id,
          from: 'them',
          text: [post.title, post.description].filter(Boolean).join('\n\n'),
          at: new Date(post.publishedAt).getTime() || now,
        },
      ]
    : [
        {
          id: `chmsg-welcome-${service.id}`,
          conversationId: id,
          from: 'them',
          text: `Bienvenue sur ${channel.name}. Les actualités de ${service.name} apparaîtront ici.`,
          at: now,
        },
      ]

  replaceConversationsState({
    conversations: [conversation, ...current.conversations],
    messages: [...current.messages, ...seeded],
  })
  return id
}

/** Retire le canal de la messagerie (désabonnement). */
export function leaveProChannel(serviceId: string): void {
  const id = channelConversationId(serviceId)
  const current = getConversationsState()
  replaceConversationsState({
    conversations: current.conversations.filter(
      (c) =>
        !(c.id === id || (c.kind === 'channel' && c.professionalSpaceId === serviceId)),
    ),
    messages: current.messages.filter((m) => m.conversationId !== id),
  })
}

/** Diffuse une publication vers les fils canal déjà présents en messagerie. */
export function pushChannelPublication(
  service: Service,
  post: ChannelPost,
  channel: ChannelSettings,
): void {
  const id = channelConversationId(service.id)
  const current = getConversationsState()
  if (!current.conversations.some((c) => c.id === id)) return

  const now = Date.now()
  const at = new Date(post.publishedAt).getTime() || now
  const message: ChatMessage = {
    id: `chmsg-${post.id}-${now}`,
    conversationId: id,
    from: 'them',
    text: [post.title, post.description].filter(Boolean).join('\n\n'),
    at,
  }
  replaceConversationsState({
    conversations: current.conversations.map((c) =>
      c.id === id
        ? {
            ...c,
            name: channel.name,
            preview: previewFromPost(post, channel.name),
            time: formatMessageTime(at, now),
            unread: c.unread + 1,
            updatedAt: now,
          }
        : c,
    ),
    messages: [...current.messages, message],
  })
}
