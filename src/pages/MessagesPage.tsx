import { SquarePen, Video } from 'lucide-react'
import { useState } from 'react'

import { FilterChips } from '@/components/common/FilterChips'
import { IconAction } from '@/components/common/IconAction'
import { PageHeader } from '@/components/common/PageHeader'
import { SearchField } from '@/components/common/SearchField'
import { SectionDivider } from '@/components/common/SectionDivider'
import { ConversationItem } from '@/components/messages/ConversationItem'
import { NewMessageSheet } from '@/components/messages/NewMessageSheet'
import { OnlineRow } from '@/components/messages/OnlineRow'
import { VideoCallSheet } from '@/components/messages/VideoCallSheet'
import { useConversations } from '@/hooks/use-conversations'
import type { Conversation } from '@/types/messages'

const tabs = [
  { id: 'discussions', label: 'Discussions' },
  { id: 'canaux', label: 'Canaux' },
] as const

type TabId = (typeof tabs)[number]['id']

/**
 * Messagerie centrale façon WhatsApp : discussions privées / business, et canaux des
 * établissements auxquels l'utilisateur s'est abonné. Pas d'onglets Groupes ni Statuts.
 */
export function MessagesPage() {
  const [tab, setTab] = useState<TabId>('discussions')
  const [query, setQuery] = useState('')
  const [sheet, setSheet] = useState<'new' | 'call' | null>(null)
  const conversations = useConversations()

  const online = conversations.filter((c) => c.kind === 'direct' && c.online)
  const needle = query.trim().toLowerCase()
  const matches = (c: Conversation) =>
    !needle ||
    [c.name, c.preview, c.context?.label ?? ''].some((text) =>
      text.toLowerCase().includes(needle),
    )
  const listed =
    tab === 'canaux'
      ? conversations.filter((c) => c.kind === 'channel')
      : conversations.filter((c) => c.kind === 'direct' || c.kind === 'business')
  const visible = listed.filter(matches)

  return (
    <>
      <PageHeader
        title="Messages"
        large
        actions={
          <>
            <IconAction
              icon={SquarePen}
              label="Nouveau message"
              onClick={() => setSheet('new')}
            />
            <IconAction
              icon={Video}
              label="Nouvel appel vidéo"
              onClick={() => setSheet('call')}
            />
          </>
        }
      />

      <div className="px-4 pt-3 pb-2">
        <SearchField
          label="Rechercher dans les messages"
          placeholder="Rechercher dans les messages"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
      </div>
      <FilterChips
        label="Type de conversation"
        items={tabs}
        value={tab}
        onChange={setTab}
        className="py-2"
      />

      <SectionDivider className="mt-2" />
      {tab === 'discussions' ? (
        <>
          <OnlineRow people={online} />
          <SectionDivider />
        </>
      ) : null}

      {visible.length > 0 ? (
        <ul className="divide-y">
          {visible.map((conversation) => (
            <li key={conversation.id}>
              <ConversationItem conversation={conversation} />
            </li>
          ))}
        </ul>
      ) : (
        <p className="px-6 py-16 text-center text-body text-muted-foreground">
          {tab === 'canaux'
            ? 'Abonnez-vous à un établissement : son canal apparaîtra ici.'
            : 'Rien à afficher pour le moment.'}
        </p>
      )}

      <NewMessageSheet
        open={sheet === 'new'}
        onClose={() => setSheet((current) => (current === 'new' ? null : current))}
      />
      <VideoCallSheet
        open={sheet === 'call'}
        onClose={() => setSheet((current) => (current === 'call' ? null : current))}
        onWriteMessage={() => setSheet('new')}
      />
    </>
  )
}
