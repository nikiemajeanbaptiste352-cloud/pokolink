import { Check, Clock, Eye, MapPin, UserPlus, type LucideIcon } from 'lucide-react'
import { Link } from 'react-router-dom'

import { StatusPill } from '@/components/pro/shared'
import { Button, buttonVariants } from '@/components/ui/button'
import { AD_MISSION_LABEL, formatMissionPoints, getAdPack } from '@/lib/ad-packs'
import { cn } from '@/lib/utils'
import type { AdMissionStatus, RewardsAdMission } from '@/types/ad-missions'
import type { AdMissionType } from '@/types/ads'

const TYPE_ICON: Record<AdMissionType, LucideIcon> = {
  view: Eye,
  visit: MapPin,
  subscription: UserPlus,
}

const STATUS_META: Record<
  AdMissionStatus,
  { label: string; cta: string }
> = {
  available: { label: 'Disponible', cta: 'Faire la mission' },
  pending: { label: 'En cours', cta: 'Voir la page' },
  done: { label: 'Points crédités', cta: 'Revoir' },
  capped: { label: 'Plafond atteint', cta: 'Revoir' },
}

interface AdMissionCardProps {
  mission: RewardsAdMission
  /** Demande déjà envoyée depuis cet appareil (statut local). */
  locallyPending?: boolean
  onClaim?: () => void
}

/**
 * Une mission publicitaire Rewards : type, points nominaux, plafond journalier et CTA.
 * En démo, « Faire la mission » crédite immédiatement (voir RewardsAdsPage).
 */
export function AdMissionCard({
  mission,
  locallyPending = false,
  onClaim,
}: AdMissionCardProps) {
  const Icon = TYPE_ICON[mission.type]
  const pack = getAdPack(mission.pack)
  const typeMeta = AD_MISSION_LABEL[mission.type]
  const status: AdMissionStatus = locallyPending ? 'pending' : mission.status
  const meta = STATUS_META[status]
  const canClaim = status === 'available' && Boolean(onClaim)
  const progress = Math.min(100, Math.round((mission.doneToday / mission.dailyLimit) * 100))

  return (
    <article className="space-y-3 rounded-2xl border bg-card p-4 shadow-card">
      <div className="flex items-start gap-3">
        <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-amber-500/15 text-amber-700">
          <Icon className="size-5" aria-hidden="true" />
        </span>
        <div className="min-w-0 flex-1 space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-body font-extrabold">{typeMeta.label}</p>
            <StatusPill>{meta.label}</StatusPill>
          </div>
          <p className="truncate text-caption text-muted-foreground">
            {mission.businessName} · {mission.campaignTitle}
          </p>
          <p className="text-caption text-muted-foreground">
            Forfait {pack.label} · {formatMissionPoints(mission.points)} si validée
          </p>
        </div>
      </div>

      <div className="space-y-1">
        <div className="flex items-baseline justify-between gap-2 text-caption">
          <span className="font-semibold text-muted-foreground">Aujourd’hui</span>
          <span className="tabular-nums text-muted-foreground">
            {mission.doneToday} / {mission.dailyLimit}
          </span>
        </div>
        <div
          className="h-1.5 overflow-hidden rounded-full bg-muted"
          role="progressbar"
          aria-valuenow={progress}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`Plafond journalier : ${mission.doneToday} sur ${mission.dailyLimit}`}
        >
          <div
            className={cn(
              'h-full rounded-full',
              status === 'capped' ? 'bg-muted-foreground' : 'bg-brand',
            )}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <Link
          to={mission.to}
          className={cn(buttonVariants({ variant: canClaim ? 'outline' : 'default' }), 'flex-1')}
        >
          {canClaim ? 'Voir la page' : meta.cta}
        </Link>
        {canClaim ? (
          <Button type="button" className="flex-1" onClick={onClaim}>
            {meta.cta}
          </Button>
        ) : null}
        {status === 'pending' ? (
          <p className="flex w-full items-start gap-2 text-caption text-muted-foreground">
            <Clock className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
            Action en cours…
          </p>
        ) : null}
        {status === 'done' ? (
          <p className="flex w-full items-start gap-2 text-caption text-muted-foreground">
            <Check className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
            Points crédités immédiatement pour cette mission aujourd’hui.
          </p>
        ) : null}
      </div>
    </article>
  )
}
