import {
  ChevronRight,
  Megaphone,
  MessageCircleOff,
  Send,
  Store,
  User,
} from 'lucide-react'
import { useEffect, useRef, useState, type FormEvent } from 'react'
import { Link, useParams } from 'react-router-dom'

import { Avatar } from '@/components/common/Avatar'
import { BackLink } from '@/components/common/BackLink'
import { EmptyState } from '@/components/common/EmptyState'
import { PageHeader } from '@/components/common/PageHeader'
import { buttonVariants } from '@/components/ui/button'
import { sendMessage, useConversation } from '@/hooks/use-conversations'
import { CONTEXT_LABEL } from '@/lib/messaging-contexts'
import { cn } from '@/lib/utils'
import { paths } from '@/routes/paths'

/**
 * Conversation de la messagerie centrale. Elle rappelle le contenu à l'origine de
 * l'échange (produit, profil, événement…) avec un lien pour y retourner, et donne accès au
 * profil du correspondant. Les messages restent sur cet appareil : il n'y a pas encore de
 * serveur de messagerie, et aucune réponse n'est simulée.
 */
export function ConversationPage() {
  const { conversationId } = useParams()
  const thread = useConversation(conversationId)
  const [draft, setDraft] = useState('')
  const endRef = useRef<HTMLDivElement>(null)
  const count = thread?.messages.length ?? 0

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: 'end' })
  }, [count])

  if (!thread) {
    return (
      <>
        <PageHeader
          title="Conversation"
          leading={<BackLink to={paths.messages} label="Messages" history />}
        />
        <EmptyState
          icon={MessageCircleOff}
          title="Conversation introuvable"
          description="Cette conversation n’existe pas ou n’est plus disponible."
          action={
            <Link to={paths.messages} className={buttonVariants()}>
              Retour aux messages
            </Link>
          }
          className="py-20"
        />
      </>
    )
  }

  const { conversation, messages } = thread
  const { context, profileTo } = conversation
  const isChannel = conversation.kind === 'channel'

  function submit(event: FormEvent) {
    event.preventDefault()
    if (isChannel) return
    if (!draft.trim()) return
    sendMessage(conversation.id, draft)
    setDraft('')
  }

  return (
    <>
      <PageHeader
        title={
          <span className="flex min-w-0 items-center gap-2">
            <Avatar name={conversation.name} src={conversation.avatarSrc} size="sm" />
            <span className="truncate">{conversation.name}</span>
          </span>
        }
        leading={<BackLink to={paths.messages} label="Messages" history />}
        actions={
          profileTo ? (
            <Link
              to={profileTo}
              aria-label={
                isChannel
                  ? `Voir l’établissement ${conversation.name}`
                  : `Voir le profil de ${conversation.name}`
              }
              className={buttonVariants({ variant: 'ghost', size: 'icon' })}
            >
              {isChannel ? (
                <Megaphone className="size-5" aria-hidden="true" />
              ) : conversation.kind === 'business' ? (
                <Store className="size-5" aria-hidden="true" />
              ) : (
                <User className="size-5" aria-hidden="true" />
              )}
            </Link>
          ) : null
        }
      />

      <div className="space-y-3 py-3">

        {context ? (
          <Link
            to={context.to}
            className="mx-4 flex min-h-14 items-center gap-3 rounded-xl border bg-card p-3 shadow-card hover:bg-muted"
          >
            <span className="min-w-0 flex-1">
              <span className="block text-caption text-muted-foreground">
                Conversation à propos de · {CONTEXT_LABEL[context.type]}
              </span>
              <span className="block truncate text-body font-bold">{context.label}</span>
            </span>
            <span className="inline-flex shrink-0 items-center gap-0.5 text-body font-semibold text-brand">
              Voir
              <ChevronRight className="size-4" aria-hidden="true" />
            </span>
          </Link>
        ) : null}

        {messages.length === 0 ? (
          <p className="px-6 py-10 text-center text-body text-muted-foreground">
            Écrivez votre premier message à {conversation.name}.
          </p>
        ) : (
          <ol aria-label="Messages" className="space-y-2 px-4">
            {messages.map((message) => (
              <li
                key={message.id}
                className={cn(
                  'flex',
                  message.from === 'me' ? 'justify-end' : 'justify-start',
                )}
              >
                <p
                  className={cn(
                    'max-w-[85%] rounded-2xl px-3.5 py-2 text-body',
                    message.from === 'me'
                      ? 'rounded-br-md bg-primary text-primary-foreground'
                      : 'rounded-bl-md bg-muted text-foreground',
                  )}
                >
                  <span className="sr-only">
                    {message.from === 'me' ? 'Vous' : conversation.name} :{' '}
                  </span>
                  <span className="break-words whitespace-pre-line">{message.text}</span>
                  <span
                    className={cn(
                      'mt-0.5 block text-right text-caption',
                      message.from === 'me'
                        ? 'text-primary-foreground/85'
                        : 'text-muted-foreground',
                    )}
                  >
                    {message.timeLabel}
                  </span>
                </p>
              </li>
            ))}
          </ol>
        )}
        <div ref={endRef} />
      </div>

      {isChannel ? (
        <p
          role="status"
          className="sticky bottom-0 z-10 border-t bg-background/95 px-4 py-3 text-center text-caption text-muted-foreground backdrop-blur md:bottom-0"
        >
          Seuls les administrateurs du canal peuvent publier.
        </p>
      ) : (
        <form
          onSubmit={submit}
          className="sticky bottom-0 z-10 flex items-center gap-2 border-t bg-background/95 p-3 backdrop-blur md:bottom-0"
        >
          <input
            type="text"
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            aria-label="Votre message"
            placeholder="Écrire un message"
            autoComplete="off"
            className="h-11 min-w-0 flex-1 rounded-full bg-input px-4 text-body outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
          />
          <button
            type="submit"
            disabled={!draft.trim()}
            aria-label="Envoyer"
            className="grid size-11 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground disabled:opacity-40"
          >
            <Send className="size-5" aria-hidden="true" />
          </button>
        </form>
      )}
    </>
  )
}
