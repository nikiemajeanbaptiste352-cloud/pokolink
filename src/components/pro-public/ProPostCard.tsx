import { ArrowRight, Eye, Share2, ThumbsUp, Video } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'

import { Avatar } from '@/components/common/Avatar'
import { Media } from '@/components/common/Media'
import { PartnershipLinkBanner } from '@/components/common/PartnershipLinkBanner'
import { VerifiedBadge } from '@/components/common/VerifiedBadge'
import type { PublicPro } from '@/hooks/use-public-pro'
import { formatCount, formatPrice } from '@/lib/format'
import { proProfilePath } from '@/lib/messaging-contexts'
import { formatAgo } from '@/lib/pro-public'
import { getServiceTypeMeta } from '@/lib/service-types'
import { shareOrCopy } from '@/lib/share'
import { cn } from '@/lib/utils'
import { paths } from '@/routes/paths'
import type { ChannelPost } from '@/types/pro'

const action =
  'inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-lg px-2 text-body font-semibold text-muted-foreground hover:bg-muted'

/**
 * Publication d'un Service Pro, façon page Facebook : auteur, texte, visuel, compteurs puis
 * « J’aime » et « Partager ». « J’aime » est local à cet écran (non enregistré) : le compteur
 * réel viendra du serveur.
 */
export function PostCard({
  post,
  pro,
  now,
}: {
  post: ChannelPost
  pro: PublicPro
  now: number
}) {
  const { service } = pro
  const meta = getServiceTypeMeta(service.type)
  const [liked, setLiked] = useState(false)
  const [notice, setNotice] = useState('')
  const item = post.itemId
    ? pro.items.find((entry) => entry.id === post.itemId)
    : undefined
  const video = post.media.find((media) => media.kind === 'video')
  const image = post.media.find((media) => media.kind === 'image' && media.src)
  const picture = image?.src ?? item?.image ?? ''
  const hasVisual = Boolean(picture) || Boolean(video)
  const reactions = post.reactions + (liked ? 1 : 0)

  async function share() {
    const url = `${window.location.origin}${proProfilePath(service)}`
    const result = await shareOrCopy(url, post.title)
    if (result === 'copied') setNotice('Lien copié dans le presse-papiers.')
    else if (result === 'failed') setNotice('Impossible de partager ce lien.')
    else setNotice('')
  }

  return (
    <article
      aria-label={post.title}
      className="space-y-3 rounded-xl border bg-card pt-3 shadow-card"
    >
      <header className="flex items-center gap-2.5 px-3">
        <Avatar name={service.name} src={service.logo || undefined} size="md" />
        <div className="min-w-0 flex-1">
          <p className="flex items-center gap-1 text-body font-bold">
            <span className="truncate">{service.name}</span>
            {pro.verified ? <VerifiedBadge className="size-4 shrink-0" /> : null}
          </p>
          <p className="text-caption text-muted-foreground">
            {post.sponsored ? (
              <span className="font-semibold text-gold">Sponsorisé</span>
            ) : (
              formatAgo(post.publishedAt, now)
            )}
            {post.sponsored ? (
              <span> · {formatAgo(post.publishedAt, now)}</span>
            ) : null}
          </p>
        </div>
      </header>

      <div className="space-y-1 px-3">
        <h3 className="text-body leading-snug font-bold">{post.title}</h3>
        {post.description ? <p className="text-body">{post.description}</p> : null}
        {post.partnershipLink ? (
          <PartnershipLinkBanner href={post.partnershipLink} className="mt-2" />
        ) : null}
        {post.promoPrice !== null ? (
          <p className="text-body font-extrabold text-brand">
            {formatPrice(post.promoPrice)}
            {item ? (
              <s className="ml-2 text-caption font-normal text-muted-foreground">
                {formatPrice(item.price)}
              </s>
            ) : null}
          </p>
        ) : null}
      </div>

      {hasVisual ? (
        <div className="relative">
          <Media
            src={picture || undefined}
            alt=""
            icon={video && !picture ? Video : meta.icon}
            tone={meta.tone}
            className={cn('w-full', video ? 'aspect-video' : 'aspect-4/3')}
          />
          {video ? (
            <span className="absolute top-2 left-2 inline-flex items-center gap-1 rounded-full bg-black/60 px-2.5 py-1 text-caption font-bold text-white">
              <Video className="size-3.5" aria-hidden="true" />
              Vidéo
            </span>
          ) : null}
        </div>
      ) : null}

      {item ? (
        <Link
          to={paths.product(item.id)}
          className="mx-3 flex min-h-11 items-center justify-between gap-2 rounded-lg bg-muted px-3 text-body font-semibold hover:bg-muted/70"
        >
          <span className="min-w-0 truncate">{item.name}</span>
          <span className="inline-flex shrink-0 items-center gap-1 text-brand">
            Voir
            <ArrowRight className="size-4" aria-hidden="true" />
          </span>
        </Link>
      ) : null}

      <div className="mx-3 flex items-center gap-3 text-caption text-muted-foreground">
        <span className="inline-flex items-center gap-1">
          <ThumbsUp className="size-3.5 text-brand" aria-hidden="true" />
          {formatCount(reactions)}
          <span className="sr-only"> j’aime</span>
        </span>
        {post.views > 0 ? (
          <span className="inline-flex items-center gap-1">
            <Eye className="size-3.5" aria-hidden="true" />
            {formatCount(post.views)}
            <span className="sr-only"> vues</span>
          </span>
        ) : null}
      </div>

      <div className="mx-1 flex gap-1 border-t px-1 py-1">
        <button
          type="button"
          aria-pressed={liked}
          onClick={() => setLiked((value) => !value)}
          className={cn(action, liked && 'text-brand')}
        >
          <ThumbsUp
            className={cn('size-5', liked && 'fill-current')}
            aria-hidden="true"
          />
          J’aime
        </button>
        <button type="button" onClick={() => void share()} className={action}>
          <Share2 className="size-5" aria-hidden="true" />
          Partager
        </button>
      </div>
      <p
        role="status"
        className="px-3 pb-2 text-caption text-muted-foreground empty:hidden"
      >
        {notice}
      </p>
    </article>
  )
}
