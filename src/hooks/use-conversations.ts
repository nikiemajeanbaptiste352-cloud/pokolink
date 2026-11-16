import { useCallback, useMemo, useSyncExternalStore } from 'react'
import { useNavigate } from 'react-router-dom'

import {
  formatMessageTime,
  getConversationsState,
  sendMessage,
  startConversation,
  subscribeConversations,
  type StartConversationInput,
} from '@/lib/conversations-store'
import { TEMP_CONVERSATIONS } from '@/lib/placeholder-data'
import { paths } from '@/routes/paths'
import type { ChatMessage, Conversation } from '@/types/messages'

/** Toutes les conversations : celles ouvertes dans l'application d'abord, les plus récentes en tête. */
export function useConversations(): readonly Conversation[] {
  const state = useSyncExternalStore(subscribeConversations, getConversationsState)
  return useMemo(
    () => [
      ...[...state.conversations].sort((a, b) => (b.updatedAt ?? 0) - (a.updatedAt ?? 0)),
      ...TEMP_CONVERSATIONS,
    ],
    [state],
  )
}

export interface ThreadMessage extends ChatMessage {
  timeLabel: string
}

/** Une conversation et ses messages, ou `undefined` si elle n'existe pas. */
export function useConversation(
  conversationId: string | undefined,
): { conversation: Conversation; messages: ThreadMessage[] } | undefined {
  const state = useSyncExternalStore(subscribeConversations, getConversationsState)
  return useMemo(() => {
    const stored = state.conversations.find((c) => c.id === conversationId)
    const conversation = stored ?? TEMP_CONVERSATIONS.find((c) => c.id === conversationId)
    if (!conversation) return undefined

    const sent: ThreadMessage[] = state.messages
      .filter((m) => m.conversationId === conversation.id)
      .map((m) => ({ ...m, timeLabel: formatMessageTime(m.at) }))
    // Les conversations d'exemple n'ont qu'un dernier message : il ouvre le fil.
    const opening: ThreadMessage[] = stored
      ? []
      : [
          {
            id: `${conversation.id}-last`,
            conversationId: conversation.id,
            from: 'them',
            text: conversation.preview,
            at: 0,
            timeLabel: conversation.time,
          },
        ]
    return { conversation, messages: [...opening, ...sent] }
  }, [state, conversationId])
}

/**
 * Point d'entrée unique des boutons « Message » (produit, profil, événement, créateur) :
 * ouvre la conversation avec le bon destinataire et son contexte, puis y navigue.
 * Si l'échange existe déjà pour ce contexte, il est repris.
 */
export function useStartConversation() {
  const navigate = useNavigate()
  return useCallback(
    (input: StartConversationInput) => {
      navigate(paths.conversation(startConversation(input)))
    },
    [navigate],
  )
}

export { sendMessage }
