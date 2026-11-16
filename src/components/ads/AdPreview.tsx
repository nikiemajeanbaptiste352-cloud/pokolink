import { Megaphone } from 'lucide-react'

import { Media } from '@/components/common/Media'
import { AD_CTA_LABEL } from '@/lib/ad-packs'
import type { AdCta } from '@/types/ads'

interface AdPreviewProps {
  serviceName: string
  logo?: string | undefined
  title: string
  text: string
  cta: AdCta
  image: string
}

/** L'annonce telle que les utilisateurs la verront (aperçu : le bouton n'agit pas). */
export function AdPreview({
  serviceName,
  logo,
  title,
  text,
  cta,
  image,
}: AdPreviewProps) {
  return (
    <article
      aria-label="Aperçu de l’annonce"
      className="overflow-hidden rounded-2xl border bg-card shadow-card"
    >
      <div className="flex items-center gap-3 p-3">
        <Media
          src={logo || undefined}
          alt=""
          icon={Megaphone}
          tone="violet"
          className="size-10 shrink-0 rounded-full"
        />
        <div className="min-w-0 flex-1">
          <p className="truncate text-body font-bold">{serviceName}</p>
          <p className="text-caption text-muted-foreground">Sponsorisé</p>
        </div>
      </div>
      <Media
        src={image || undefined}
        alt=""
        icon={Megaphone}
        tone="violet"
        className="aspect-video w-full"
      />
      <div className="space-y-2 p-3">
        <h3
          className={
            title
              ? 'text-title font-extrabold break-words'
              : 'text-title font-extrabold break-words text-muted-foreground/60 italic'
          }
        >
          {title || 'Titre de votre annonce'}
        </h3>
        <p
          className={
            text
              ? 'text-body break-words text-muted-foreground'
              : 'text-body break-words text-muted-foreground/60 italic'
          }
        >
          {text || 'Le texte de votre annonce apparaîtra ici.'}
        </p>
        <span className="inline-flex min-h-11 w-full items-center justify-center rounded-xl bg-primary px-4 text-body font-bold text-primary-foreground">
          {AD_CTA_LABEL[cta]}
        </span>
      </div>
    </article>
  )
}
