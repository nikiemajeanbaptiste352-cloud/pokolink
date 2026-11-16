import { Bookmark, ChevronRight, Heart, Share2, type LucideIcon } from 'lucide-react'
import { useId, useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'

import { Avatar } from '@/components/common/Avatar'
import { PartnershipLinkBanner } from '@/components/common/PartnershipLinkBanner'
import { VerifiedBadge } from '@/components/common/VerifiedBadge'
import { shareOrCopy } from '@/lib/share'
import { cn } from '@/lib/utils'

export interface FeedAuthor {
  name: string
  avatarSrc?: string | undefined
  verified?: boolean | undefined
  /** Profil de l'auteur, quand il en a un. Sans profil, le nom n'est pas un lien. */
  to?: string | undefined
}

interface FeedCardProps {
  author: FeedAuthor
  /** Type de contenu : le même vocabulaire que les espaces de diffusion. */
  badge: { label: string; icon: LucideIcon }
  /** Ancienneté ou état, affiché sous le nom. */
  time?: string | undefined
  title?: string | undefined
  text?: ReactNode
  /** Visuel (image, vidéo provisoire) : fourni par chaque type de carte. */
  visual?: ReactNode
  /** Destination : l'espace de diffusion de ce contenu. */
  link: { to: string; title: string; subtitle?: string | undefined; action: string }
  /** Lien de partenariat collé sous le contenu. */
  partnershipLink?: string | undefined
}

const actionClass =
  'text-muted-foreground hover:bg-muted/80 flex h-11 flex-1 items-center justify-center gap-2 rounded-xl text-sm font-semibold transition-colors active:scale-[0.98]'

/**
 * Carte du fil immersif, façon Facebook : auteur, texte, visuel, puis une barre de lien
 * qui ouvre l'espace de diffusion du contenu. « J'aime » et « Enregistrer » restent locaux
 * (aucune donnée envoyée) ; « Partager » partage le lien de la destination.
 */
export function FeedCard({
  author,
  badge,
  time,
  title,
  text,
  visual,
  link,
  partnershipLink,
}: FeedCardProps) {
  const titleId = useId()
  const [liked, setLiked] = useState(false)
  const [saved, setSaved] = useState(false)
  const [notice, setNotice] = useState('')
  const BadgeIcon = badge.icon

  const authorBlock = (
    <>
      <Avatar name={author.name} src={author.avatarSrc} size="lg" />
      <span className="min-w-0 flex-1 text-left">
        <span id={titleId} className="flex items-center gap-1 text-body font-bold">
          <span className="truncate">{author.name}</span>
          {author.verified ? <VerifiedBadge /> : null}
        </span>
        <span className="flex flex-wrap items-center gap-x-2 gap-y-1 text-caption text-muted-foreground">
          {time ? <span>{time}</span> : null}
          <span className="inline-flex items-center gap-1 rounded-full bg-secondary px-2 py-0.5 font-bold text-secondary-foreground">
            <BadgeIcon className="size-3.5" aria-hidden="true" />
            {badge.label}
          </span>
        </span>
      </span>
    </>
  )

  async function share() {
    const result = await shareOrCopy(`${window.location.origin}${link.to}`, link.title)
    if (result === 'copied') setNotice('Lien copié dans le presse-papiers.')
    else if (result === 'failed') setNotice('Impossible de partager ce lien.')
    else setNotice('')
  }

  return (
    <article aria-labelledby={titleId} className="bg-card">
      {author.to ? (
        <Link
          to={author.to}
          className="flex min-h-14 items-center gap-3 px-4 pt-3.5 pb-1.5"
          aria-label={`Voir le profil de ${author.name}`}
        >
          {authorBlock}
        </Link>
      ) : (
        <div className="flex min-h-14 items-center gap-3 px-4 pt-3.5 pb-1.5">
          {authorBlock}
        </div>
      )}

      {title || text ? (
        <div className="space-y-1.5 px-4 py-2">
          {title ? <h3 className="text-title font-extrabold tracking-tight">{title}</h3> : null}
          {text ? (
            <p className="text-body leading-relaxed whitespace-pre-line text-foreground/90">
              {text}
            </p>
          ) : null}
        </div>
      ) : null}

      {visual}

      {partnershipLink ? (
        <div className="px-4 py-2">
          <PartnershipLinkBanner href={partnershipLink} />
        </div>
      ) : null}

      <Link
        to={link.to}
        className="flex min-h-16 items-center gap-3 border-y border-black/5 bg-muted/55 px-4 py-2.5 transition-colors hover:bg-muted/80"
      >
        <span className="min-w-0 flex-1">
          <span className="block truncate text-body font-bold">{link.title}</span>
          {link.subtitle ? (
            <span className="block truncate text-caption text-muted-foreground">
              {link.subtitle}
            </span>
          ) : null}
        </span>
        <span className="inline-flex shrink-0 items-center gap-0.5 rounded-full bg-brand/10 px-2.5 py-1 text-[13px] font-extrabold text-brand">
          {link.action}
          <ChevronRight className="size-4" aria-hidden="true" />
        </span>
      </Link>

      <div className="flex items-center gap-1 px-2 py-1.5">
        <button
          type="button"
          aria-pressed={liked}
          onClick={() => setLiked((value) => !value)}
          className={cn(actionClass, liked && 'text-destructive')}
        >
          <Heart className={cn('size-5', liked && 'fill-current')} aria-hidden="true" />
          J'aime
        </button>
        <button type="button" onClick={() => void share()} className={actionClass}>
          <Share2 className="size-5" aria-hidden="true" />
          Partager
        </button>
        <button
          type="button"
          aria-pressed={saved}
          aria-label="Enregistrer"
          onClick={() => setSaved((value) => !value)}
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
    </article>
  )
}
