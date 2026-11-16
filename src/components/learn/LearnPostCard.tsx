import { FileText, Flag, Heart, MessageCircle, Share2 } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'

import { useLocalStore } from '@/hooks/use-local-store'
import { formatCount } from '@/lib/format'
import {
  isLearnPostLiked,
  learnStore,
  toggleLearnPostLike,
} from '@/lib/learn-store'
import { shareOrCopy } from '@/lib/share'
import { cn } from '@/lib/utils'
import { paths } from '@/routes/paths'
import type { LearnDocument, LearnPost } from '@/types/learn'

import { AuthorLine } from './AuthorLine'
import { FlaggedBadge, PostTypeBadge } from './LearnBadges'
import { DOCUMENT_KIND_LABEL, formatFileSize } from './learn-utils'

interface LearnPostCardProps {
  post: LearnPost
  /** Document attaché, résolu par le serveur. */
  document?: LearnDocument | undefined
  /** Absent : pas de bouton « Signaler » (ses propres publications). */
  onReport?: ((post: LearnPost) => void) | undefined
  /** Page de la publication : texte complet, sans liens vers elle-même. */
  full?: boolean
}

const actionClass =
  'flex h-11 min-w-11 items-center justify-center gap-1.5 rounded-lg px-3 text-sm font-semibold text-muted-foreground transition-colors hover:bg-muted'

/**
 * Publication du fil. Likes et compteurs locaux synchronisés (pont Moi ↔ public).
 */
export function LearnPostCard({
  post,
  document,
  onReport,
  full = false,
}: LearnPostCardProps) {
  const local = useLocalStore(learnStore)
  const [notice, setNotice] = useState('')
  const liked = isLearnPostLiked(post.id)
  const localPost = local.posts.find((item) => item.id === post.id)
  const likes = localPost
    ? localPost.likesCount
    : post.likesCount + (liked ? 1 : 0)
  const localExtraComments = local.comments.filter((c) => c.postId === post.id).length
  const commentsCount = localPost?.commentsCount ?? post.commentsCount + localExtraComments
  const isAnswered =
    Boolean(localPost?.isAnswered) ||
    Boolean(post.isAnswered) ||
    (post.type === 'question' && localExtraComments > 0)
  const threadPath = paths.learnPost(post.levelId, post.id)
  const isQuestion = post.type === 'question'
  const answersLabel = isQuestion
    ? `${commentsCount} réponse${commentsCount > 1 ? 's' : ''}`
    : `${commentsCount} commentaire${commentsCount > 1 ? 's' : ''}`

  async function share() {
    const result = await shareOrCopy(
      `${window.location.origin}${threadPath}`,
      post.title ?? 'Publication AfriLearn',
    )
    if (result === 'copied') setNotice('Lien copié dans le presse-papiers.')
    else if (result === 'failed') setNotice('Impossible de partager ce lien.')
    else setNotice('')
  }

  return (
    <article
      aria-label={post.title ?? `Publication de ${post.author.name}`}
      className={cn('space-y-3 px-4 py-4', post.isPinned && 'bg-accent/50')}
    >
      <AuthorLine author={post.author} timeLabel={post.timeLabel} />

      <div className="flex flex-wrap items-center gap-2">
        <PostTypeBadge type={post.type} />
        {post.isPinned ? (
          <span className="text-caption font-semibold text-muted-foreground">
            Épinglée
          </span>
        ) : null}
        {isQuestion ? (
          <span className="text-caption font-semibold text-foreground">
            {isAnswered ? 'Répondue' : 'Sans réponse'}
          </span>
        ) : null}
        {post.status === 'flagged' ? <FlaggedBadge /> : null}
      </div>

      {full ? (
        <div className="space-y-1.5">
          {post.title ? (
            <h2 className="text-title leading-snug font-bold">{post.title}</h2>
          ) : null}
          <p className="text-body whitespace-pre-line">{post.content}</p>
        </div>
      ) : (
        <Link to={threadPath} className="block space-y-1.5">
          {post.title ? (
            <h3 className="text-title leading-snug font-bold">{post.title}</h3>
          ) : null}
          <p className="line-clamp-4 text-body whitespace-pre-line">{post.content}</p>
        </Link>
      )}

      {document ? (
        <Link
          to={`${paths.learnFeed(post.levelId)}?onglet=bibliotheque`}
          className="flex min-h-14 items-center gap-3 rounded-xl border bg-card p-3 hover:bg-muted"
        >
          <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-accent text-accent-foreground">
            <FileText className="size-5" aria-hidden="true" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-body font-semibold">
              {document.title}
            </span>
            <span className="block text-caption text-muted-foreground">
              {DOCUMENT_KIND_LABEL[document.kind]} · {formatFileSize(document.fileSize)} ·{' '}
              {formatCount(document.downloadsCount)} téléchargements
            </span>
          </span>
        </Link>
      ) : null}

      <div className="-mx-2 flex items-center gap-1">
        <button
          type="button"
          aria-pressed={liked}
          aria-label={`J’aime (${formatCount(likes)})`}
          onClick={() => toggleLearnPostLike(post.id)}
          className={cn(actionClass, liked && 'text-destructive')}
        >
          <Heart className={cn('size-5', liked && 'fill-current')} aria-hidden="true" />
          {formatCount(likes)}
        </button>
        {full ? (
          <span className={cn(actionClass, 'hover:bg-transparent')}>
            <MessageCircle className="size-5" aria-hidden="true" />
            {answersLabel}
          </span>
        ) : (
          <Link to={threadPath} className={actionClass}>
            <MessageCircle className="size-5" aria-hidden="true" />
            {answersLabel}
          </Link>
        )}
        <button
          type="button"
          aria-label="Partager"
          onClick={() => void share()}
          className={cn(actionClass, 'ml-auto')}
        >
          <Share2 className="size-5" aria-hidden="true" />
        </button>
        {onReport ? (
          <button
            type="button"
            aria-label="Signaler cette publication"
            onClick={() => onReport(post)}
            className={actionClass}
          >
            <Flag className="size-5" aria-hidden="true" />
          </button>
        ) : null}
      </div>
      <p role="status" className="text-caption text-muted-foreground empty:hidden">
        {notice}
      </p>
    </article>
  )
}
