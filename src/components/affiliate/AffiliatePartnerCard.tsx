import { Copy, ExternalLink, Handshake, Share2 } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'

import { Media } from '@/components/common/Media'
import { StatusPill } from '@/components/pro/shared'
import { Button, buttonVariants } from '@/components/ui/button'
import {
  AFFILIATE_MEMBERSHIP_STATUS_LABEL,
  AFFILIATE_TARGET_LABEL,
  formatRatePct,
} from '@/lib/affiliate-labels'
import { getAffiliateVendorPublic } from '@/lib/affiliate-public'
import {
  buildAffiliateLink,
  getProgramById,
} from '@/lib/affiliate-store'
import { formatCount, formatPrice } from '@/lib/format'
import { paths } from '@/routes/paths'
import type { AffiliateMembership } from '@/types/affiliate'

/** Carte privée affilié : un programme rejoint. */
export function AffiliatePartnerCard({
  membership,
}: {
  membership: AffiliateMembership
}) {
  const program = getProgramById(membership.programId)
  const vendor = getAffiliateVendorPublic(membership.serviceId)
  const establishmentRef = vendor?.username ?? membership.serviceId
  const link = buildAffiliateLink(
    establishmentRef,
    membership.refCode,
    program,
  )
  const openTo = link
  const [copied, setCopied] = useState(false)

  async function copy() {
    try {
      await navigator.clipboard.writeText(
        `${window.location.origin}${link}`,
      )
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2000)
    } catch {
      setCopied(false)
    }
  }

  async function share() {
    const url = `${window.location.origin}${link}`
    if (navigator.share) {
      try {
        await navigator.share({
          title: program?.name ?? 'Affiliation AfriConnect',
          url,
        })
      } catch {
        // annulé
      }
    } else {
      await copy()
    }
  }

  return (
    <article className="space-y-3 rounded-2xl border bg-card p-4 shadow-card">
      <div className="flex gap-3">
        <Media
          src={program?.imageSrc || vendor?.logo}
          alt=""
          icon={Handshake}
          className="size-14 shrink-0 rounded-xl"
        />
        <div className="min-w-0 flex-1 space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="truncate text-body font-extrabold">
              {vendor?.name ?? 'Vendeur'}
            </p>
            <StatusPill>
              {AFFILIATE_MEMBERSHIP_STATUS_LABEL[membership.status]}
            </StatusPill>
          </div>
          <p className="text-body font-bold">{program?.name ?? 'Programme'}</p>
          <p className="text-caption text-muted-foreground">
            Commission{' '}
            {program ? formatRatePct(program.affiliateRate) : '—'} ·{' '}
            {program
              ? AFFILIATE_TARGET_LABEL[program.targetKind ?? 'service']
              : '—'}{' '}
            · depuis {new Date(membership.joinedAt).toLocaleDateString('fr-FR')}
          </p>
        </div>
      </div>

      <dl className="grid grid-cols-3 gap-2 text-center">
        <div className="rounded-xl bg-muted/60 p-2">
          <dt className="text-[11px] text-muted-foreground">Clics</dt>
          <dd className="font-extrabold tabular-nums">
            {formatCount(membership.clicks)}
          </dd>
        </div>
        <div className="rounded-xl bg-muted/60 p-2">
          <dt className="text-[11px] text-muted-foreground">Ventes</dt>
          <dd className="font-extrabold tabular-nums">
            {formatCount(membership.orders)}
          </dd>
        </div>
        <div className="rounded-xl bg-muted/60 p-2">
          <dt className="text-[11px] text-muted-foreground">Commissions</dt>
          <dd className="font-extrabold tabular-nums">
            {formatPrice(membership.commissionsAmount)}
          </dd>
        </div>
      </dl>

      <Link
        to={openTo}
        className="block truncate rounded-xl bg-muted px-3 py-2 font-mono text-caption text-foreground hover:bg-muted/80"
      >
        {link}
      </Link>

      <div className="flex flex-wrap gap-2">
        <Button type="button" size="sm" variant="outline" onClick={() => void copy()}>
          <Copy aria-hidden="true" />
          {copied ? 'Copié' : 'Copier'}
        </Button>
        <Button type="button" size="sm" variant="outline" onClick={() => void share()}>
          <Share2 aria-hidden="true" />
          Partager
        </Button>
        <Link
          to={openTo}
          className={buttonVariants({ variant: 'outline', size: 'sm' })}
        >
          <ExternalLink aria-hidden="true" />
          Ouvrir
        </Link>
        <Link
          to={paths.studioAffiliatePartnership(membership.id)}
          className={buttonVariants({ size: 'sm' })}
        >
          Performances
        </Link>
      </div>
    </article>
  )
}
