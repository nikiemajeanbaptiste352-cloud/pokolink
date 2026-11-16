import { Handshake } from 'lucide-react'
import { Link } from 'react-router-dom'

import { Media } from '@/components/common/Media'
import { StatusPill } from '@/components/pro/shared'
import { Button, buttonVariants } from '@/components/ui/button'
import {
  useMyProgramMembership,
  useProgramMemberships,
} from '@/hooks/use-affiliate'
import { useProfile } from '@/hooks/use-profile'
import {
  AFFILIATE_AUDIENCE_LABEL,
  AFFILIATE_PROGRAM_STATUS_LABEL,
  formatRatePct,
} from '@/lib/affiliate-labels'
import {
  getAffiliateVendorPublic,
  programAllowsAudience,
} from '@/lib/affiliate-public'
import { joinAffiliateProgram } from '@/lib/affiliate-store'
import { formatCount } from '@/lib/format'
import { cn } from '@/lib/utils'
import { paths } from '@/routes/paths'
import type { AffiliateProgram } from '@/types/affiliate'
import { useState } from 'react'

/**
 * Carte publique d’un programme : rejoindre immédiatement ou voir le partenariat.
 */
export function AffiliatePublicCard({
  program,
  isCreator = true,
}: {
  program: AffiliateProgram
  /** L’utilisateur courant est-il un créateur (éligibilité). */
  isCreator?: boolean
}) {
  const profile = useProfile()
  const vendor = getAffiliateVendorPublic(program.serviceId)
  const mine = useMyProgramMembership(program.id, profile.handle)
  const members = useProgramMemberships(program.id)
  const [error, setError] = useState('')
  const allowed = programAllowsAudience(program, isCreator)

  function join() {
    if (!allowed) {
      setError('Vous n’êtes pas dans les catégories autorisées pour ce programme.')
      return
    }
    try {
      joinAffiliateProgram(program.id, {
        handle: profile.handle,
        name: profile.name,
        ...(profile.avatarSrc ? { avatarSrc: profile.avatarSrc } : {}),
      })
      setError('')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Adhésion impossible.')
    }
  }

  const establishmentRef = vendor?.username ?? program.serviceId

  return (
    <article className="space-y-3 rounded-2xl border bg-card p-4 shadow-card">
      <div className="flex gap-3">
        <Media
          src={program.imageSrc || vendor?.logo}
          alt=""
          icon={Handshake}
          className="size-14 shrink-0 rounded-xl"
        />
        <div className="min-w-0 flex-1 space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="truncate text-body font-extrabold">
              {vendor?.name ?? 'Vendeur AfriConnect'}
            </p>
            <StatusPill>
              {AFFILIATE_PROGRAM_STATUS_LABEL[program.status]}
            </StatusPill>
          </div>
          <p className="text-caption text-muted-foreground">
            {vendor ? `@${vendor.username}` : null}
          </p>
          <h3 className="text-body font-bold">{program.name}</h3>
          <p className="line-clamp-2 text-caption text-muted-foreground">
            {program.description}
          </p>
        </div>
      </div>

      <dl className="flex flex-wrap gap-x-4 gap-y-1 text-caption">
        <div>
          <dt className="inline text-muted-foreground">Commission · </dt>
          <dd className="inline font-extrabold text-brand">
            {formatRatePct(program.affiliateRate)}
          </dd>
        </div>
        <div>
          <dt className="inline text-muted-foreground">Participants · </dt>
          <dd className="inline font-semibold">
            {AFFILIATE_AUDIENCE_LABEL[program.audience]}
          </dd>
        </div>
        {program.showParticipantCount ? (
          <div>
            <dt className="inline text-muted-foreground">Inscrits · </dt>
            <dd className="inline font-semibold tabular-nums">
              {formatCount(members.length)}
            </dd>
          </div>
        ) : null}
      </dl>

      {error ? (
        <p role="alert" className="text-caption font-semibold text-destructive">
          {error}
        </p>
      ) : null}

      <div className="flex flex-wrap gap-2">
        {mine ? (
          <Link
            to={paths.studioAffiliatePartnership(mine.id)}
            className={cn(buttonVariants({ size: 'sm' }), 'justify-center')}
          >
            Voir mon partenariat
          </Link>
        ) : (
          <Button type="button" size="sm" onClick={join} disabled={!allowed}>
            Rejoindre le programme
          </Button>
        )}
        <Link
          to={paths.establishment(establishmentRef)}
          className={buttonVariants({ variant: 'outline', size: 'sm' })}
        >
          Voir le vendeur
        </Link>
      </div>
    </article>
  )
}
