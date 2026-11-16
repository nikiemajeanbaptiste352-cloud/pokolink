import { ChevronRight, Megaphone } from 'lucide-react'
import { Link } from 'react-router-dom'

import { CampaignObjectives } from '@/components/ads/CampaignObjectives'
import { Media } from '@/components/common/Media'
import { StatusPill } from '@/components/pro/shared'
import { AD_CHANNEL_LABEL, AD_STATUS, getAdPack } from '@/lib/ad-packs'
import { formatDate } from '@/lib/pro-labels'
import { paths } from '@/routes/paths'
import type { AdCampaign } from '@/types/ads'

/**
 * Carte de suivi d'une campagne : forfait, statut et atteinte des objectifs
 * (vues / visites / abonnés) par rapport aux cibles du forfait.
 */
export function CampaignCard({ campaign }: { campaign: AdCampaign }) {
  const pack = getAdPack(campaign.pack)
  const tracking =
    campaign.status === 'active' ||
    campaign.status === 'finished' ||
    campaign.status === 'in_review' ||
    campaign.status === 'pending_payment'

  return (
    <Link
      to={paths.serviceAd(campaign.serviceId, campaign.id)}
      className="block space-y-3 rounded-2xl border bg-card p-3.5 shadow-card"
    >
      <div className="flex items-center gap-3">
        <Media
          src={campaign.image || undefined}
          alt=""
          icon={Megaphone}
          tone="violet"
          className="size-14 shrink-0 rounded-xl"
        />
        <div className="min-w-0 flex-1 space-y-1">
          <p className="truncate text-body font-bold">{campaign.title}</p>
          <p className="truncate text-caption text-muted-foreground">
            Forfait {pack.label} · {formatDate(campaign.createdAt)}
          </p>
          <p className="truncate text-caption text-muted-foreground">
            {(campaign.channels ?? []).map((c) => AD_CHANNEL_LABEL[c].label).join(' · ') ||
              'Canaux à définir'}
          </p>
          <StatusPill>{AD_STATUS[campaign.status].label}</StatusPill>
        </div>
        <ChevronRight
          className="size-5 shrink-0 text-muted-foreground"
          aria-hidden="true"
        />
      </div>

      {tracking ? (
        <div className="space-y-2 rounded-xl bg-muted/60 p-3">
          <p className="text-caption font-extrabold tracking-wide text-muted-foreground uppercase">
            Objectifs du forfait {pack.label}
          </p>
          <CampaignObjectives campaign={campaign} />
        </div>
      ) : null}
    </Link>
  )
}
