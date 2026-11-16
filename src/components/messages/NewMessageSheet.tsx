import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { Avatar } from '@/components/common/Avatar'
import { BottomSheet } from '@/components/common/BottomSheet'
import { SearchField } from '@/components/common/SearchField'
import { useConversations, useStartConversation } from '@/hooks/use-conversations'
import { listCreators } from '@/lib/creators'
import { DEMO_PROS } from '@/lib/directory'
import {
  creatorContext,
  creatorRecipient,
  profileContext,
  proRecipient,
} from '@/lib/messaging-contexts'
import { paths } from '@/routes/paths'

interface Contact {
  id: string
  name: string
  subtitle: string
  avatarSrc?: string | undefined
  open: () => void
}

/** Nouveau message : choisir un correspondant (discussion existante, créateur ou établissement). */
export function NewMessageSheet({
  open,
  onClose,
}: {
  open: boolean
  onClose: () => void
}) {
  const [query, setQuery] = useState('')
  const navigate = useNavigate()
  const startConversation = useStartConversation()
  const conversations = useConversations()

  const contacts = useMemo<Contact[]>(() => {
    const direct: Contact[] = conversations
      .filter((c) => c.kind === 'direct')
      .map((c) => ({
        id: `c-${c.id}`,
        name: c.name,
        subtitle: 'Discussion existante',
        avatarSrc: c.avatarSrc,
        open: () => void navigate(paths.conversation(c.id)),
      }))
    const creators: Contact[] = listCreators()
      .filter((creator) => !creator.isMe)
      .map((creator) => ({
        id: `u-${creator.handle}`,
        name: creator.name,
        subtitle: `Créateur · @${creator.handle}`,
        avatarSrc: creator.avatar,
        open: () =>
          startConversation({
            recipient: creatorRecipient(creator),
            context: creatorContext(creator),
          }),
      }))
    const pros: Contact[] = DEMO_PROS.map((pro) => ({
      id: `s-${pro.service.id}`,
      name: pro.service.name,
      subtitle: `Établissement · ${pro.tagline}`,
      avatarSrc: pro.service.logo || undefined,
      open: () =>
        startConversation({
          recipient: proRecipient(pro.service),
          professionalSpaceId: pro.service.id,
          context: profileContext(pro.service),
        }),
    }))
    return [...direct, ...creators, ...pros]
  }, [conversations, navigate, startConversation])

  const needle = query.trim().toLowerCase()
  const visible = contacts
    .filter((c) => !needle || `${c.name} ${c.subtitle}`.toLowerCase().includes(needle))
    .slice(0, 30)

  return (
    <BottomSheet open={open} onClose={onClose} title="Nouveau message">
      <SearchField
        label="Rechercher un correspondant"
        placeholder="Nom, @identifiant, établissement"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
      />
      {visible.length === 0 ? (
        <p className="py-6 text-center text-body text-muted-foreground">
          Aucun correspondant ne correspond à votre recherche.
        </p>
      ) : (
        <ul className="-mx-4 divide-y">
          {visible.map((contact) => (
            <li key={contact.id}>
              <button
                type="button"
                onClick={contact.open}
                className="flex min-h-14 w-full items-center gap-3 px-4 py-2 text-left hover:bg-muted"
              >
                <Avatar name={contact.name} src={contact.avatarSrc} />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-body font-bold">
                    {contact.name}
                  </span>
                  <span className="block truncate text-caption text-muted-foreground">
                    {contact.subtitle}
                  </span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </BottomSheet>
  )
}
