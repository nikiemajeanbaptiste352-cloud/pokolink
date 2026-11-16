import { Flag, Heart } from 'lucide-react'

import { useLocalStore } from '@/hooks/use-local-store'
import { formatCount } from '@/lib/format'
import {
  isLearnCommentLiked,
  learnStore,
  toggleLearnCommentLike,
} from '@/lib/learn-store'
import { cn } from '@/lib/utils'
import type { LearnComment } from '@/types/learn'

import { AuthorLine } from './AuthorLine'

interface CommentNode {
  comment: LearnComment
  children: CommentNode[]
}

/** Reconstitue la hiérarchie à partir de `parentId` (le serveur la conserve en entier). */
function buildTree(comments: readonly LearnComment[]): CommentNode[] {
  const nodes = new Map<string, CommentNode>(
    comments.map((comment) => [comment.id, { comment, children: [] }]),
  )
  const roots: CommentNode[] = []
  for (const node of nodes.values()) {
    const parent = node.comment.parentId ? nodes.get(node.comment.parentId) : undefined
    if (parent) parent.children.push(node)
    else roots.push(node)
  }
  return roots
}

const smallAction =
  'inline-flex h-11 items-center gap-1.5 rounded-lg px-2.5 text-caption font-semibold text-muted-foreground hover:bg-muted'

interface CommentThreadProps {
  comments: readonly LearnComment[]
  /** Commentaire auquel l'utilisateur répond actuellement. */
  replyingToId: string | null
  onReply: (comment: LearnComment) => void
  onReport: (comment: LearnComment) => void
}

/** Commentaires et réponses imbriquées. L'indentation s'arrête au 2e niveau pour rester lisible. */
export function CommentThread({
  comments,
  replyingToId,
  onReply,
  onReport,
}: CommentThreadProps) {
  const roots = buildTree(comments)
  return (
    <ul className="space-y-1 px-4">
      {roots.map((node) => (
        <CommentBranch
          key={node.comment.id}
          node={node}
          depth={0}
          replyingToId={replyingToId}
          onReply={onReply}
          onReport={onReport}
        />
      ))}
    </ul>
  )
}

function CommentBranch({
  node,
  depth,
  replyingToId,
  onReply,
  onReport,
}: {
  node: CommentNode
  depth: number
  replyingToId: string | null
  onReply: (comment: LearnComment) => void
  onReport: (comment: LearnComment) => void
}) {
  const { comment, children } = node
  const local = useLocalStore(learnStore)
  const liked = isLearnCommentLiked(comment.id)
  const localComment = local.comments.find((item) => item.id === comment.id)
  const likes = localComment
    ? localComment.likesCount
    : comment.likesCount + (liked ? 1 : 0)

  return (
    <li>
      <div
        className={cn(
          'rounded-xl py-2',
          replyingToId === comment.id && 'bg-accent/60 px-3',
        )}
      >
        <AuthorLine author={comment.author} timeLabel={comment.timeLabel} size="sm" />
        <p className="mt-1.5 text-body whitespace-pre-line">{comment.content}</p>
        <div className="-ml-2.5 flex items-center">
          <button
            type="button"
            aria-pressed={liked}
            aria-label={`J’aime ce commentaire (${formatCount(likes)})`}
            onClick={() => toggleLearnCommentLike(comment.id)}
            className={
              liked
                ? smallAction.replace('text-muted-foreground', 'text-destructive')
                : smallAction
            }
          >
            <Heart className={cn('size-4', liked && 'fill-current')} aria-hidden="true" />
            {formatCount(likes)}
          </button>
          <button type="button" onClick={() => onReply(comment)} className={smallAction}>
            Répondre
            <span className="sr-only"> à {comment.author.name}</span>
          </button>
          <button
            type="button"
            aria-label={`Signaler le commentaire de ${comment.author.name}`}
            onClick={() => onReport(comment)}
            className={`${smallAction} ml-auto`}
          >
            <Flag className="size-4" aria-hidden="true" />
          </button>
        </div>
      </div>
      {children.length > 0 ? (
        <ul className={cn('space-y-1', depth < 2 && 'ml-3 border-l-2 pl-3')}>
          {children.map((child) => (
            <CommentBranch
              key={child.comment.id}
              node={child}
              depth={depth + 1}
              replyingToId={replyingToId}
              onReply={onReply}
              onReport={onReport}
            />
          ))}
        </ul>
      ) : null}
    </li>
  )
}
