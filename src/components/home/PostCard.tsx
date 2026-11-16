import { Bookmark, Heart, MessageCircle, MoreHorizontal, Share2 } from 'lucide-react'
import { useId, useState } from 'react'
import { Link } from 'react-router-dom'

import { Avatar } from '@/components/common/Avatar'
import { IconAction } from '@/components/common/IconAction'
import { PartnershipLinkBanner } from '@/components/common/PartnershipLinkBanner'
import { PostCommentsSheet, PostOptionsSheet } from '@/components/home/PostSheets'
import { useLocalStore } from '@/hooks/use-local-store'
import { commentsStore, hiddenPostsStore } from '@/lib/social-store'
import { shareOrCopy } from '@/lib/share'
import { VerifiedBadge } from '@/components/common/VerifiedBadge'
import { formatCount } from '@/lib/format'
import { cn } from '@/lib/utils'
import { paths } from '@/routes/paths'
import type { Post } from '@/types/feed'

interface PostCardProps {
  post: Post
  /** Publication créée sur cet appareil : le menu propose de la supprimer. */
  own?: boolean
}

const actionClass =
  'text-muted-foreground hover:bg-muted/80 flex h-11 min-w-0 flex-1 items-center justify-center gap-1.5 rounded-xl px-1 text-sm font-semibold transition-colors active:scale-[0.98]'

/**
 * Carte de publication.
 * Les états « j'aime » et « enregistré » sont locaux et purement visuels :
 * aucune donnée n'est envoyée (la communication API viendra plus tard).
 */
export function PostCard({ post, own = false }: PostCardProps) {
  const titleId = useId()
  const [liked, setLiked] = useState(false)
  const [saved, setSaved] = useState(false)
  const [sheet, setSheet] = useState<'comments' | 'options' | null>(null)
  const [notice, setNotice] = useState('')
  const hidden = useLocalStore(hiddenPostsStore).includes(post.id)
  const localComments = useLocalStore(commentsStore)[post.id]?.length ?? 0
  const likes = post.likes + (liked ? 1 : 0)
  const comments = post.comments + localComments

  async function share() {
    const result = await shareOrCopy(`/`, post.text.slice(0, 80))
    if (result === 'copied') setNotice('Lien copié dans le presse-papiers.')
    else if (result === 'failed') setNotice('Impossible de partager ce lien.')
    else setNotice('')
  }

  if (hidden) return null

  const profileTo = post.author.to ?? (own ? paths.profile : undefined)
  const authorBlock = (
    <>
      <Avatar name={post.author.name} src={post.author.avatarSrc} size="lg" />
      <div className="min-w-0 flex-1">
        <p id={titleId} className="flex items-center gap-1 text-body font-bold">
          <span className="truncate">{post.author.name}</span>
          {post.author.verified ? <VerifiedBadge /> : null}
        </p>
        <p className="text-caption text-muted-foreground">{post.time}</p>
      </div>
    </>
  )

  return (
    <article aria-labelledby={titleId} className="bg-card">
      <header className="flex items-center gap-3 px-4 pt-3.5">
        {profileTo ? (
          <Link
            to={profileTo}
            className="flex min-w-0 flex-1 items-center gap-3"
            aria-label={`Voir le profil de ${post.author.name}`}
          >
            {authorBlock}
          </Link>
        ) : (
          <div className="flex min-w-0 flex-1 items-center gap-3">{authorBlock}</div>
        )}
        <IconAction
          icon={MoreHorizontal}
          label="Plus d'options"
          variant="ghost"
          onClick={() => setSheet('options')}
        />
      </header>

      <p className="px-4 py-3 text-body leading-relaxed whitespace-pre-line text-foreground/90">
        {post.text}
      </p>

      {post.media?.src ? (
        <img
          src={post.media.src}
          alt={post.media.alt}
          loading="lazy"
          className="aspect-[5/4] w-full object-cover sm:aspect-4/3"
        />
      ) : post.media ? (
        // Visuel provisoire : dégradé de marque en attendant les vraies images.
        <div
          aria-hidden="true"
          className="aspect-[5/4] w-full bg-linear-to-br from-brand/30 via-brand/15 to-gold/35 sm:aspect-4/3"
        />
      ) : null}

      {post.partnershipLink ? (
        <div className="px-4 pt-2">
          <PartnershipLinkBanner href={post.partnershipLink} />
        </div>
      ) : null}

      <div className="flex items-center justify-between gap-3 px-4 py-2.5 text-caption text-muted-foreground">
        <span className="flex items-center gap-2">
          <span className="grid size-6 place-items-center rounded-full bg-destructive text-white shadow-sm">
            <Heart className="size-3.5 fill-current" aria-hidden="true" />
          </span>
          <span className="text-sm font-medium text-foreground">
            {formatCount(likes)}
          </span>
        </span>
        <span>
          {formatCount(comments)} commentaires · {formatCount(post.shares)} partages
        </span>
      </div>

      <div className="flex items-center gap-1 border-t border-black/5 px-2 py-1.5">
        <button
          type="button"
          aria-pressed={liked}
          onClick={() => setLiked((v) => !v)}
          className={cn(actionClass, liked && 'text-destructive')}
        >
          <Heart className={cn('size-5', liked && 'fill-current')} aria-hidden="true" />
          J'aime
        </button>
        <button
          type="button"
          onClick={() => setSheet('comments')}
          className={actionClass}
        >
          <MessageCircle className="size-5" aria-hidden="true" />
          Commenter
        </button>
        <button type="button" onClick={() => void share()} className={actionClass}>
          <Share2 className="size-5" aria-hidden="true" />
          Partager
        </button>
        <button
          type="button"
          aria-pressed={saved}
          aria-label="Enregistrer"
          onClick={() => setSaved((v) => !v)}
          className={cn(actionClass, 'flex-none px-3', saved && 'text-brand')}
        >
          <Bookmark
            className={cn('size-5', saved && 'fill-current')}
            aria-hidden="true"
          />
        </button>
      </div>
      <p
        role="status"
        className="px-4 pb-2 text-caption text-muted-foreground empty:hidden"
      >
        {notice}
      </p>
      <PostCommentsSheet
        open={sheet === 'comments'}
        onClose={() => setSheet((c) => (c === 'comments' ? null : c))}
        postId={post.id}
        authorName={post.author.name}
      />
      <PostOptionsSheet
        open={sheet === 'options'}
        onClose={() => setSheet((c) => (c === 'options' ? null : c))}
        postId={post.id}
        text={post.text}
        own={own}
      />
    </article>
  )
}
