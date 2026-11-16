import {
  Check,
  MapPin,
  MessageCircle,
  Package,
  Phone,
  Settings,
  Share2,
  Star,
  Store,
  UserPlus,
} from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'

import { BackLink } from '@/components/common/BackLink'
import { Media } from '@/components/common/Media'
import { VerifiedBadge } from '@/components/common/VerifiedBadge'
import { ServiceCover } from '@/components/services/ServiceCover'
import { Button, buttonVariants } from '@/components/ui/button'
import { useFollow } from '@/hooks/use-follow'
import type { PublicPro } from '@/hooks/use-public-pro'
import { formatCount, formatRating } from '@/lib/format'
import { getOpenStatus } from '@/lib/hours'
import { proProfilePath } from '@/lib/messaging-contexts'
import { ensureProChannel, leaveProChannel } from '@/lib/pro-channel-messaging'
import { getServiceTypeMeta } from '@/lib/service-types'
import { shareOrCopy } from '@/lib/share'
import { cn } from '@/lib/utils'
import { paths } from '@/routes/paths'

const overlayStyle = 'bg-black/50 text-white hover:bg-black/65 hover:text-white'

interface ProHeroProps {
  pro: PublicPro
  now: Date
  /** Ouvre la rubrique « Contact ». */
  onOpenContact: () => void
  /** Ouvre le catalogue (CTA principal marketplace). */
  onOpenCatalog?: () => void
}

/**
 * En-tête storefront façon Amazon Store / Alibaba :
 * bannière, logo boutique, confiance (note, vérifié, ville), actions S'abonner / Contacter.
 */
export function ProHero({ pro, now, onOpenContact, onOpenCatalog }: ProHeroProps) {
  const { service } = pro
  const meta = getServiceTypeMeta(service.type)
  const status = getOpenStatus(service.hours, now)
  const { following, toggle } = useFollow(service.id)
  const [notice, setNotice] = useState('')
  const place = [service.city, service.country].filter(Boolean).join(', ')
  const followers = pro.followers + (following && !pro.owned ? 1 : 0)
  const productCount = pro.items.length

  async function share() {
    const url = `${window.location.origin}${proProfilePath(service)}`
    const result = await shareOrCopy(url, service.name)
    if (result === 'copied') setNotice('Lien copié dans le presse-papiers.')
    else if (result === 'failed') setNotice('Impossible de partager ce lien.')
    else setNotice('')
  }

  return (
    <header className="bg-card">
      <ServiceCover service={service} showOpenStatus={false} className="h-36 sm:h-48">
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-linear-to-t from-black/55 via-black/10 to-black/35"
        />
        <div className="pt-safe absolute inset-x-0 top-0 flex items-center justify-between px-3 pt-2">
          <BackLink
            to={paths.explore}
            label="Explorer"
            history
            className={overlayStyle}
          />
          <Button
            type="button"
            size="icon"
            variant="ghost"
            onClick={() => void share()}
            aria-label="Partager cette boutique"
            className={cn('size-10 rounded-full', overlayStyle)}
          >
            <Share2 className="size-5" aria-hidden="true" />
          </Button>
        </div>
        <div className="absolute inset-x-0 bottom-0 flex items-end gap-3 p-3 pr-4 text-white">
          <Media
            src={service.logo || undefined}
            alt={`Logo de ${service.name}`}
            icon={meta.icon}
            tone={meta.tone}
            className="size-16 shrink-0 rounded-xl border-2 border-white bg-card shadow-lg sm:size-20"
          />
          <div className="min-w-0 flex-1 pb-0.5">
            <h1 className="flex items-center gap-1.5 text-title leading-tight font-extrabold sm:text-headline">
              <span className="min-w-0 truncate">{service.name}</span>
              {pro.verified ? <VerifiedBadge className="size-4 shrink-0 sm:size-5" /> : null}
            </h1>
            <p className="truncate text-[12px] font-semibold text-white/85">
              {meta.label}
              {pro.tagline ? ` · ${pro.tagline}` : ''}
            </p>
          </div>
        </div>
      </ServiceCover>

      <div className="space-y-3 px-4 py-3">
        {/* Bandeau confiance marketplace */}
        <ul className="grid grid-cols-3 gap-2">
          <li className="rounded-lg bg-gold/15 px-2 py-2 text-center">
            <p className="flex items-center justify-center gap-0.5 text-[15px] font-extrabold text-brand tabular-nums">
              {pro.rating !== null ? (
                <>
                  <Star className="size-3.5 fill-gold text-gold" aria-hidden="true" />
                  {formatRating(pro.rating)}
                </>
              ) : (
                '—'
              )}
            </p>
            <p className="text-[10px] font-semibold text-muted-foreground">
              {pro.reviewCount > 0 ? `${formatCount(pro.reviewCount)} avis` : 'Note'}
            </p>
          </li>
          <li className="rounded-lg bg-muted/80 px-2 py-2 text-center">
            <p className="flex items-center justify-center gap-1 text-[15px] font-extrabold tabular-nums">
              <Package className="size-3.5 text-brand" aria-hidden="true" />
              {formatCount(productCount)}
            </p>
            <p className="text-[10px] font-semibold text-muted-foreground">
              {meta.catalogLabel}
            </p>
          </li>
          <li className="rounded-lg bg-muted/80 px-2 py-2 text-center">
            <p className="text-[15px] font-extrabold tabular-nums">
              {formatCount(followers)}
            </p>
            <p className="text-[10px] font-semibold text-muted-foreground">Abonnés</p>
          </li>
        </ul>

        <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[12px] text-muted-foreground">
          {place ? (
            <span className="inline-flex min-w-0 items-center gap-1">
              <MapPin className="size-3.5 shrink-0" aria-hidden="true" />
              <span className="truncate">{place}</span>
            </span>
          ) : null}
          <span
            className={cn(
              'inline-flex items-center gap-1 font-bold',
              status.open ? 'text-brand' : 'text-danger',
            )}
          >
            <span aria-hidden="true" className="size-1.5 rounded-full bg-current" />
            {status.label}
          </span>
          {pro.verified ? (
            <span className="inline-flex items-center gap-1 font-semibold text-foreground">
              <Store className="size-3.5 text-gold" aria-hidden="true" />
              Boutique vérifiée
            </span>
          ) : null}
        </p>

        <div className="flex gap-2">
          {pro.owned ? (
            <Link
              to={paths.service(service.id)}
              className={buttonVariants({
                size: 'lg',
                className: 'min-w-0 flex-1 rounded-full',
              })}
            >
              <Settings aria-hidden="true" />
              Gérer mon Espace Pro
            </Link>
          ) : (
            <>
              <Button
                size="lg"
                className="min-w-0 flex-1 rounded-full bg-brand text-brand-foreground hover:bg-brand/90"
                aria-pressed={following}
                onClick={() => {
                  if (following) {
                    leaveProChannel(service.id)
                    toggle()
                    setNotice('Canal retiré de votre messagerie.')
                  } else {
                    toggle()
                    ensureProChannel(service, pro.extras)
                    setNotice('Canal ajouté dans Messages → Canaux.')
                  }
                }}
              >
                {following ? (
                  <Check aria-hidden="true" />
                ) : (
                  <UserPlus aria-hidden="true" />
                )}
                {following ? 'Abonné' : 'Suivre la boutique'}
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={onOpenContact}
                className="min-w-0 flex-1 rounded-full"
              >
                <MessageCircle aria-hidden="true" />
                Contacter
              </Button>
            </>
          )}
        </div>

        {!pro.owned && productCount > 0 && onOpenCatalog ? (
          <Button
            type="button"
            size="lg"
            variant="outline"
            className="w-full rounded-full border-brand/35 font-bold text-brand"
            onClick={onOpenCatalog}
          >
            <Package aria-hidden="true" />
            Voir le catalogue ({productCount})
          </Button>
        ) : null}

        {!pro.owned ? (
          <Button
            type="button"
            size="sm"
            variant="ghost"
            className="w-full text-muted-foreground"
            onClick={onOpenContact}
          >
            <Phone className="size-3.5" aria-hidden="true" />
            Coordonnées et horaires
          </Button>
        ) : null}

        <p role="status" className="text-caption text-muted-foreground empty:hidden">
          {notice}
        </p>
      </div>
    </header>
  )
}
