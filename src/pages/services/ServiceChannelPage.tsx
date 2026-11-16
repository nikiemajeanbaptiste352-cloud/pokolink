import { Paperclip, Plus } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'

import {
  TelegramChannelFeed,
  type TelegramFeedPost,
} from '@/components/channel/TelegramChannelFeed'
import { FilterChips } from '@/components/common/FilterChips'
import { ChannelSettingsTab } from '@/components/pro/channel/ChannelSettingsTab'
import { ChannelStatsTab } from '@/components/pro/channel/ChannelStatsTab'
import { CommunityTab } from '@/components/pro/channel/CommunityTab'
import { PostFormSheet } from '@/components/pro/channel/PostFormSheet'
import { FlashMessage } from '@/components/pro/shared'
import { RubriquePage } from '@/components/services/RubriquePage'
import { useCurrentService } from '@/hooks/use-current-service'
import { useFlash } from '@/hooks/use-flash'
import { useNow } from '@/hooks/use-now'
import { useProExtras } from '@/hooks/use-pro-extras'
import { createId } from '@/lib/ids'
import { formatCount } from '@/lib/format'
import {
  ensureProChannel,
  pushChannelPublication,
} from '@/lib/pro-channel-messaging'
import { shareOrCopy } from '@/lib/share'
import { paths } from '@/routes/paths'
import type { ChannelPost, PostStatus } from '@/types/pro'

type Tab = 'posts' | 'community' | 'stats' | 'settings'

const TABS: readonly { id: Tab; label: string }[] = [
  { id: 'posts', label: 'Fil' },
  { id: 'community', label: 'Abonnés' },
  { id: 'stats', label: 'Stats' },
  { id: 'settings', label: 'Réglages' },
]

function toFeedPost(post: ChannelPost, channelName: string): TelegramFeedPost {
  const image = post.media.find((m) => m.kind === 'image' && m.src)?.src
  const body = [post.title.trim(), post.description.trim()]
    .filter(Boolean)
    .join('\n\n')
  const createdAt = Date.parse(post.publishedAt || post.createdAt) || Date.now()
  return {
    id: post.id,
    text: body || 'Publication',
    createdAt,
    views: post.views,
    author: channelName,
    ...(image ? { imageSrc: image } : {}),
    ...(post.status === 'draft' ? { badge: 'Brouillon' } : {}),
    ...(post.sponsored ? { badge: 'Sponsorisé' } : {}),
  }
}

/**
 * Canal Espace Pro — même écran Telegram que AfriLearn (fil + compose).
 */
export function ServiceChannelPage() {
  const service = useCurrentService()
  const { data, update, items } = useProExtras(service)
  const now = useNow(60_000)
  const { message, flash } = useFlash()
  const [tab, setTab] = useState<Tab>('posts')
  const [editor, setEditor] = useState<{ open: boolean; post: ChannelPost | null }>({
    open: false,
    post: null,
  })

  const { channel, posts, members } = data
  const archived = channel.state === 'archived'

  const feedPosts = useMemo(() => {
    const list = [...posts].sort((a, b) => {
      const ta = Date.parse(a.publishedAt || a.createdAt)
      const tb = Date.parse(b.publishedAt || b.createdAt)
      return ta - tb
    })
    // Fil Telegram : publiées chronologiques ; brouillons visibles seulement en bas d’édition via badge
    return list
      .filter((p) => p.status === 'published' || p.status === 'draft')
      .map((p) => toFeedPost(p, channel.name))
  }, [posts, channel.name])

  useEffect(() => {
    ensureProChannel(service, { channel: data.channel, posts: data.posts })
    // Identifiants stables : pas `data.posts` (nouvelle ref à chaque rendu).
    // eslint-disable-next-line react-hooks/exhaustive-deps -- sync canal messagerie
  }, [service.id, channel.name, channel.avatar, posts.length])

  async function share() {
    const url = `${window.location.origin}${paths.establishment(service.username)}`
    const result = await shareOrCopy(url, channel.name)
    if (result === 'copied') flash('Lien copié dans le presse-papiers.')
    else if (result === 'shared') flash('Lien partagé.')
    else if (result === 'failed') flash('Impossible de partager ce lien.')
  }

  function savePost(post: ChannelPost, status: PostStatus) {
    update((current) => {
      const exists = current.posts.some((candidate) => candidate.id === post.id)
      return {
        ...current,
        posts: exists
          ? current.posts.map((candidate) =>
              candidate.id === post.id ? post : candidate,
            )
          : [post, ...current.posts],
      }
    })
    setEditor({ open: false, post: null })
    if (status === 'published') {
      pushChannelPublication(service, post, channel)
      flash('Publication envoyée aux abonnés.')
    } else {
      flash('Brouillon enregistré.')
    }
  }

  function quickPublish(text: string) {
    if (archived) return
    const created: ChannelPost = {
      id: createId(),
      type: 'announcement',
      title: '',
      description: text,
      media: [],
      itemId: '',
      promoPrice: null,
      status: 'published',
      publishedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      views: 1,
      reactions: 0,
    }
    update((current) => ({
      ...current,
      posts: [created, ...current.posts],
    }))
    pushChannelPublication(service, created, channel)
    flash('Message publié sur le canal.')
  }

  const tabChips = (
    <div className="border-t border-black/5 px-2 py-1.5">
      <FilterChips
        label="Rubriques du canal"
        items={TABS}
        value={tab}
        onChange={setTab}
      />
    </div>
  )

  if (tab === 'posts') {
    return (
      <>
        <div className="px-3 pt-2">
          <FlashMessage message={message} />
        </div>
        {archived ? (
          <p
            role="status"
            className="mx-3 mb-2 rounded-xl bg-warning/20 px-3 py-2 text-[13px]"
          >
            Canal archivé — publication désactivée. Réactivez-le dans Réglages.
          </p>
        ) : null}
        <TelegramChannelFeed
          title={channel.name || service.name}
          subtitle={`Canal · ${formatCount(members.length)} abonné${members.length > 1 ? 's' : ''}`}
          avatarSrc={channel.avatar || undefined}
          description={
            channel.description ||
            `Canal de ${service.name}. Les abonnés le retrouvent aussi dans Messages.`
          }
          tagline={service.name}
          posts={feedPosts}
          belowHeader={tabChips}
          onInfo={() => void share()}
          canCompose={!archived}
          composePlaceholder="Publier comme sur Telegram…"
          onSend={quickPublish}
          composeExtra={
            <button
              type="button"
              aria-label="Publication détaillée"
              disabled={archived}
              onClick={() => setEditor({ open: true, post: null })}
              className="grid size-11 shrink-0 place-items-center rounded-full bg-white text-[#6d7a88] shadow-sm ring-1 ring-black/[0.06] disabled:opacity-40"
            >
              <Paperclip className="size-5" aria-hidden="true" />
            </button>
          }
          className="md:h-[calc(100dvh-10rem)]"
        />
        <PostFormSheet
          open={editor.open}
          post={editor.post}
          items={items}
          onClose={() => setEditor({ open: false, post: null })}
          onSave={savePost}
        />
      </>
    )
  }

  return (
    <RubriquePage
      toolId="channel"
      subtitle="Même écran Telegram · abonnés, stats, réglages"
      className="pb-10"
      action={
        <button
          type="button"
          onClick={() => setTab('posts')}
          className="inline-flex items-center gap-1 text-[12px] font-bold text-brand"
        >
          <Plus className="size-4" aria-hidden="true" />
          Retour au fil
        </button>
      }
    >
      <FlashMessage message={message} />
      {tabChips}

      {tab === 'community' ? (
        <CommunityTab
          members={members}
          onChange={(member, id) => {
            update((current) => ({
              ...current,
              members: member
                ? current.members.map((candidate) =>
                    candidate.id === id ? member : candidate,
                  )
                : current.members.filter((candidate) => candidate.id !== id),
            }))
            flash(member ? 'Membre mis à jour.' : 'Membre exclu du canal.')
          }}
        />
      ) : null}

      {tab === 'stats' ? <ChannelStatsTab data={data} now={now} /> : null}

      {tab === 'settings' ? (
        <ChannelSettingsTab
          key={channel.state}
          channel={channel}
          onSave={(values) => {
            update((current) => ({
              ...current,
              channel: { ...current.channel, ...values },
            }))
            flash('Paramètres enregistrés.')
          }}
          onToggleArchive={() => {
            update((current) => ({
              ...current,
              channel: {
                ...current.channel,
                state: current.channel.state === 'active' ? 'archived' : 'active',
              },
            }))
            flash(archived ? 'Canal réactivé.' : 'Canal archivé.')
          }}
        />
      ) : null}

      <p className="px-4 pt-4 text-center text-caption text-muted-foreground">
        <Link to={paths.establishment(service.username)} className="font-bold text-brand">
          Voir la page publique
        </Link>
        {' · '}
        <button
          type="button"
          className="font-bold text-brand"
          onClick={() => setTab('posts')}
        >
          Fil Telegram
        </button>
      </p>

      <PostFormSheet
        open={editor.open}
        post={editor.post}
        items={items}
        onClose={() => setEditor({ open: false, post: null })}
        onSave={savePost}
      />
    </RubriquePage>
  )
}
