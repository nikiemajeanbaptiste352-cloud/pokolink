import { Eye, Film, Heart, Pencil, Send, Trash2 } from 'lucide-react'
import { useState } from 'react'

import { StatusPill } from '@/components/pro/shared'
import { Button } from '@/components/ui/button'
import { formatCount, formatPrice } from '@/lib/format'
import { formatDate, POST_STATUS_LABEL, POST_TYPE_LABEL } from '@/lib/pro-labels'
import type { ChannelPost } from '@/types/pro'

interface PostCardProps {
  post: ChannelPost
  /** Nom de l'élément du catalogue associé, s'il existe encore. */
  itemName: string | undefined
  onEdit: (post: ChannelPost) => void
  onDelete: (post: ChannelPost) => void
  onPublish: (post: ChannelPost) => void
}

/** Une publication du canal : contenu, statut, chiffres et actions. */
export function PostCard({ post, itemName, onEdit, onDelete, onPublish }: PostCardProps) {
  const [confirming, setConfirming] = useState(false)
  const isDraft = post.status === 'draft'
  const firstImage = post.media.find((media) => media.kind === 'image')
  const videos = post.media.filter((media) => media.kind === 'video').length

  return (
    <article className="space-y-3 rounded-2xl border bg-card p-4 shadow-card">
      <div className="flex flex-wrap items-center gap-2">
        <StatusPill>{POST_TYPE_LABEL[post.type]}</StatusPill>
        <StatusPill>{POST_STATUS_LABEL[post.status]}</StatusPill>
        <span className="ml-auto text-caption text-muted-foreground">
          {isDraft ? 'Non publié' : formatDate(post.publishedAt)}
        </span>
      </div>

      <div className="space-y-1">
        <h3 className="text-body font-bold">{post.title}</h3>
        <p className="line-clamp-3 text-body text-muted-foreground">{post.description}</p>
      </div>

      {post.media.length > 0 ? (
        <div className="flex items-center gap-2">
          {firstImage ? (
            <img
              src={firstImage.src}
              alt=""
              className="size-16 shrink-0 rounded-xl border object-cover"
            />
          ) : null}
          <p className="flex items-center gap-1.5 text-caption text-muted-foreground">
            {videos > 0 ? <Film className="size-4" aria-hidden="true" /> : null}
            {post.media.length} fichier{post.media.length > 1 ? 's' : ''}
            {videos > 0 ? ` dont ${videos} vidéo${videos > 1 ? 's' : ''}` : ''}
          </p>
        </div>
      ) : null}

      {itemName || post.promoPrice !== null ? (
        <p className="rounded-lg bg-muted px-3 py-2 text-caption font-semibold">
          {itemName ? `Associé : ${itemName}` : 'Promotion'}
          {post.promoPrice !== null
            ? ` · prix promo ${formatPrice(post.promoPrice)}`
            : ''}
        </p>
      ) : null}

      <p className="flex items-center gap-4 text-caption text-muted-foreground">
        <span className="inline-flex items-center gap-1.5">
          <Eye className="size-4" aria-hidden="true" />
          {formatCount(post.views)} vues
        </span>
        <span className="inline-flex items-center gap-1.5">
          <Heart className="size-4" aria-hidden="true" />
          {formatCount(post.reactions)} réactions
        </span>
      </p>

      {confirming ? (
        <div className="space-y-3 rounded-xl border border-destructive/40 p-3.5">
          <p className="text-body">Supprimer « {post.title} » ?</p>
          <div className="flex flex-wrap gap-3">
            <Button variant="destructive" onClick={() => onDelete(post)}>
              <Trash2 aria-hidden="true" />
              Oui, supprimer
            </Button>
            <Button variant="outline" onClick={() => setConfirming(false)}>
              Annuler
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex flex-wrap gap-2">
          {isDraft ? (
            <Button onClick={() => onPublish(post)}>
              <Send aria-hidden="true" />
              Publier
            </Button>
          ) : null}
          <Button variant="outline" onClick={() => onEdit(post)}>
            <Pencil aria-hidden="true" />
            Modifier
            <span className="sr-only"> : {post.title}</span>
          </Button>
          <Button variant="ghost" onClick={() => setConfirming(true)}>
            <Trash2 aria-hidden="true" />
            Supprimer
            <span className="sr-only"> : {post.title}</span>
          </Button>
        </div>
      )}
    </article>
  )
}
