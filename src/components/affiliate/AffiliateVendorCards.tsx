import {
  BarChart3,
  Handshake,
  Pause,
  Pencil,
  Play,
  Users,
} from 'lucide-react'
import { Link } from 'react-router-dom'

import { Media } from '@/components/common/Media'
import { StatusPill } from '@/components/pro/shared'
import { Button, buttonVariants } from '@/components/ui/button'
import {
  AFFILIATE_MEMBERSHIP_STATUS_LABEL,
  AFFILIATE_PROGRAM_STATUS_LABEL,
  AFFILIATE_TARGET_LABEL,
  formatRatePct,
} from '@/lib/affiliate-labels'
import { formatCount, formatPrice } from '@/lib/format'
import { cn } from '@/lib/utils'
import { paths } from '@/routes/paths'
import type {
  AffiliateMembership,
  AffiliateProgram,
  AffiliateVendorStats,
} from '@/types/affiliate'

/** Carte principale de gestion du programme (Espace Pro). */
export function AffiliateProgramSummaryCard({
  program,
  stats,
  serviceId,
  onSuspend,
  onReactivate,
}: {
  program: AffiliateProgram
  stats: AffiliateVendorStats
  serviceId: string
  onSuspend: () => void
  onReactivate: () => void
}) {
  return (
    <article className="space-y-3 rounded-2xl border bg-card p-4 shadow-card">
      <div className="flex gap-3">
        <Media
          src={program.imageSrc}
          alt=""
          icon={Handshake}
          className="size-16 shrink-0 rounded-xl"
        />
        <div className="min-w-0 flex-1 space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="truncate text-body font-extrabold">{program.name}</h3>
            <StatusPill>
              {AFFILIATE_PROGRAM_STATUS_LABEL[program.status]}
            </StatusPill>
          </div>
          <p className="text-caption font-semibold text-muted-foreground">
            Commission affilié {formatRatePct(program.affiliateRate)} ·
            AfriConnect {formatRatePct(program.platformRate)} ·{' '}
            {AFFILIATE_TARGET_LABEL[program.targetKind ?? 'service']}
          </p>
          <p className="line-clamp-2 text-caption text-muted-foreground">
            {program.description}
          </p>
        </div>
      </div>

      <dl className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        <Stat label="Affiliés actifs" value={String(stats.activeAffiliates)} />
        <Stat label="Clics" value={formatCount(stats.clicks)} />
        <Stat label="Ventes attribuées" value={formatCount(stats.orders)} />
        <Stat label="Ventes générées" value={formatPrice(stats.salesAmount)} />
        <Stat
          label="Commissions affiliés"
          value={formatPrice(stats.affiliateCommissions)}
        />
      </dl>

      <div className="flex flex-wrap gap-2">
        <Link
          to={paths.serviceAffiliateMembers(serviceId, program.id)}
          className={buttonVariants({ size: 'sm', variant: 'outline' })}
        >
          <Users aria-hidden="true" />
          Gérer les affiliés
        </Link>
        <Link
          to={paths.serviceAffiliateStats(serviceId, program.id)}
          className={buttonVariants({ size: 'sm', variant: 'outline' })}
        >
          <BarChart3 aria-hidden="true" />
          Statistiques
        </Link>
        <Link
          to={paths.serviceAffiliateEdit(serviceId, program.id)}
          className={buttonVariants({ size: 'sm', variant: 'outline' })}
        >
          <Pencil aria-hidden="true" />
          Modifier
        </Link>
        {program.status === 'published' ? (
          <Button type="button" size="sm" variant="secondary" onClick={onSuspend}>
            <Pause aria-hidden="true" />
            Suspendre
          </Button>
        ) : program.status === 'suspended' || program.status === 'draft' ? (
          <Button
            type="button"
            size="sm"
            variant="secondary"
            onClick={onReactivate}
          >
            <Play aria-hidden="true" />
            {program.status === 'draft' ? 'Publier' : 'Réactiver'}
          </Button>
        ) : null}
      </div>
    </article>
  )
}

/** Carte individuelle d’un affilié (vendeur). */
export function AffiliateMemberCard({
  member,
  onSuspend,
  onReactivate,
}: {
  member: AffiliateMembership
  onSuspend: () => void
  onReactivate: () => void
}) {
  return (
    <article className="space-y-3 rounded-2xl border bg-card p-4 shadow-card">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate text-body font-extrabold">{member.affiliateName}</p>
          <p className="text-caption text-muted-foreground">
            @{member.affiliateHandle} · depuis{' '}
            {new Date(member.joinedAt).toLocaleDateString('fr-FR')}
          </p>
        </div>
        <StatusPill>
          {AFFILIATE_MEMBERSHIP_STATUS_LABEL[member.status]}
        </StatusPill>
      </div>
      <dl className="grid grid-cols-2 gap-2 text-caption sm:grid-cols-3">
        <Stat label="Clics" value={formatCount(member.clicks)} />
        <Stat label="Clients" value={formatCount(member.customers)} />
        <Stat label="Commandes" value={formatCount(member.orders)} />
        <Stat label="Ventes" value={formatPrice(member.salesAmount)} />
        <Stat
          label="Commissions"
          value={formatPrice(member.commissionsAmount)}
        />
        <Stat label="Lien" value={member.refCode} />
      </dl>
      <div className="flex flex-wrap gap-2">
        {member.status === 'active' ? (
          <Button type="button" size="sm" variant="secondary" onClick={onSuspend}>
            Suspendre le partenariat
          </Button>
        ) : (
          <Button type="button" size="sm" variant="secondary" onClick={onReactivate}>
            Réactiver
          </Button>
        )}
      </div>
    </article>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className={cn('rounded-xl bg-muted/60 px-2.5 py-2')}>
      <dt className="text-[11px] font-semibold text-muted-foreground uppercase">
        {label}
      </dt>
      <dd className="text-body font-extrabold tabular-nums">{value}</dd>
    </div>
  )
}
