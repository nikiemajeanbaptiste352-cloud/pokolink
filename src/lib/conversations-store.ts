/**
 * STOCKAGE TEMPORAIRE de la messagerie centrale.
 *
 * Il n'existe qu'UNE messagerie pour toute l'application : produits, profils, événements et
 * créateurs ouvrent tous leurs conversations ici. Les conversations ouvertes dans
 * l'application et les messages envoyés sont gardés dans le localStorage de CET appareil,
 * sans aucun envoi : il n'y a pas de destinataire réel. Aucune réponse n'est simulée.
 * À remplacer par l'API de messagerie : seuls ce fichier et `hooks/use-conversations.ts`
 * le connaissent.
 */
import type { ChatMessage, Conversation, ConversationContext } from '@/types/messages'

const STORAGE_KEY = 'africonnect.conversations.v1'

/** Identifiant de l'utilisateur connecté (`sender_user_id`), en attendant l'authentification. */
export const CURRENT_USER_ID = 'user-me'

interface State {
  conversations: Conversation[]
  messages: ChatMessage[]
}

type Listener = () => void

let state: State | null = null
const listeners = new Set<Listener>()

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function load(): State {
  if (state) return state
  state = { conversations: [], messages: [] }
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    const parsed: unknown = raw ? JSON.parse(raw) : null
    if (isRecord(parsed)) {
      if (Array.isArray(parsed['conversations'])) {
        state.conversations = parsed['conversations'] as Conversation[]
      }
      if (Array.isArray(parsed['messages'])) {
        state.messages = parsed['messages'] as ChatMessage[]
      }
    }
  } catch {
    // Données illisibles : on repart de zéro.
  }
  return state
}

function commit(next: State) {
  state = next
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  } catch {
    // Quota dépassé : l'état reste en mémoire.
  }
  listeners.forEach((listener) => listener())
}

/** Remplace l'état messagerie (canaux Pro, synchronisation locale). */
export function replaceConversationsState(next: State): void {
  commit({
    conversations: [...next.conversations],
    messages: [...next.messages],
  })
}

export function getConversationsState(): State {
  return load()
}

export function subscribeConversations(listener: Listener): () => void {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

export interface StartConversationInput {
  recipient: {
    id: string
    name: string
    avatarSrc?: string
    kind: 'direct' | 'business'
    /** Route du profil du correspondant. */
    profileTo?: string
  }
  /** Espace professionnel concerné (`Service.id`). */
  professionalSpaceId?: string
  context: ConversationContext
}

/** Heure affichée dans la liste : « 14:32 » le jour même, sinon la date courte. */
export function formatMessageTime(at: number, now = Date.now()): string {
  const date = new Date(at)
  const today = new Date(now)
  if (date.toDateString() === today.toDateString()) {
    return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
  }
  const yesterday = new Date(now - 86_400_000)
  if (date.toDateString() === yesterday.toDateString()) return 'Hier'
  return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
}

/**
 * Ouvre la conversation avec ce destinataire pour ce contexte : celle qui existe déjà si
 * elle existe (pas de doublon), sinon une nouvelle. Retourne son identifiant.
 */
export function startConversation(input: StartConversationInput): string {
  const current = load()
  const existing = current.conversations.find(
    (c) =>
      c.recipientId === input.recipient.id &&
      c.context?.type === input.context.type &&
      c.context.id === input.context.id,
  )
  if (existing) return existing.id

  const now = Date.now()
  const conversation: Conversation = {
    id: `conv-${now.toString(36)}-${current.conversations.length}`,
    name: input.recipient.name,
    avatarSrc: input.recipient.avatarSrc,
    kind: input.recipient.kind,
    preview: 'Nouvelle conversation',
    time: formatMessageTime(now, now),
    unread: 0,
    recipientId: input.recipient.id,
    professionalSpaceId: input.professionalSpaceId,
    context: input.context,
    profileTo: input.recipient.profileTo,
    createdAt: now,
    updatedAt: now,
  }
  commit({ ...current, conversations: [conversation, ...current.conversations] })
  return conversation.id
}

/** Envoie un message (enregistré sur cet appareil uniquement). */
export function sendMessage(conversationId: string, text: string): void {
  const clean = text.trim()
  if (!clean) return
  const current = load()
  const now = Date.now()
  const message: ChatMessage = {
    id: `msg-${now.toString(36)}-${current.messages.length}`,
    conversationId,
    from: 'me',
    text: clean,
    at: now,
  }
  const stored = current.conversations.some((c) => c.id === conversationId)
  commit({
    conversations: stored
      ? current.conversations.map((c) =>
          c.id === conversationId
            ? { ...c, preview: clean, time: formatMessageTime(now, now), updatedAt: now }
            : c,
        )
      : current.conversations,
    messages: [...current.messages, message],
  })
}
