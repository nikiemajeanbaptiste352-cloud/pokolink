import { Info, Megaphone } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'

import { AdJourney } from '@/components/ads/AdJourney'
import { AdPreview } from '@/components/ads/AdPreview'
import { CampaignObjectives } from '@/components/ads/CampaignObjectives'
import { BackLink } from '@/components/common/BackLink'
import { EmptyState } from '@/components/common/EmptyState'
import { StatusPill } from '@/components/pro/shared'
import { buttonVariants } from '@/components/ui/button'
import { useAdCampaigns } from '@/hooks/use-ad-campaigns'
import { useCurrentService } from '@/hooks/use-current-service'
import {
  AD_CHANNEL_LABEL,
  AD_STATUS,
  AD_TARGET_LABEL,
  getAdPack,
} from '@/lib/ad-packs'
import { formatPrice } from '@/lib/format'
import { formatDateTime } from '@/lib/pro-labels'
import { paths } from '@/routes/paths'

/** Suivi d'une campagne : annonce, étapes, objectifs et résultats mesurés par le serveur. */
export function ServiceAdPage() {
  const service = useCurrentService()
  const { campaignId } = useParams()
  const campaigns = useAdCampaigns(service.id)
  const campaign = campaigns.find((item) => item.id === campaignId)
  const back = paths.serviceAds(service.id)

  if (!campaign) {
    return (
      <EmptyState
        icon={Megaphone}
        tone="violet"
        title="Campagne introuvable"
        description="Cette campagne n’existe pas ou a été déplacée."
        action={
          <Link to={back} className={buttonVariants()}>
            Voir mes campagnes
          </Link>
        }
        className="py-20"
      />
    )
  }

  const pack = getAdPack(campaign.pack)
  const status = AD_STATUS[campaign.status]
  const started = campaign.status === 'active' || campaign.status === 'finished'

  return (
    <article className="space-y-5 pt-4 pb-8">
      <div className="flex items-center gap-2 px-4">
        <BackLink to={back} label="Publicité" history className="-ml-2" />
        <h2 className="min-w-0 truncate text-headline font-extrabold">Campagne</h2>
      </div>

      <section aria-label="Statut de la campagne" className="space-y-3 px-4">
        <div className="flex items-center justify-between gap-3">
          <p className="min-w-0 truncate text-caption text-muted-foreground">
            Réf. {campaign.reference}
            {campaign.local ? ' (provisoire)' : ''} · {formatDateTime(campaign.createdAt)}
          </p>
          <StatusPill>{status.label}</StatusPill>
        </div>
        <AdJourney status={campaign.status} />
        <p role="status" className="rounded-xl bg-info/10 p-3.5 text-body">
          {status.message}
        </p>
      </section>

      <section aria-label="Annonce" className="space-y-2 px-4">
        <AdPreview
          serviceName={service.name}
          logo={service.logo}
          title={campaign.title}
          text={campaign.text}
          cta={campaign.cta}
          image={campaign.image}
        />
        <dl className="divide-y rounded-2xl border bg-card px-4 shadow-card">
          <div className="flex items-baseline justify-between gap-3 py-3">
            <dt className="text-body text-muted-foreground">Type</dt>
            <dd className="text-right text-body font-bold">
              {AD_TARGET_LABEL[campaign.target].label}
              {campaign.itemName ? ` · ${campaign.itemName}` : ''}
            </dd>
          </div>
          <div className="flex items-baseline justify-between gap-3 py-3">
            <dt className="text-body text-muted-foreground">Forfait</dt>
            <dd className="text-right text-body font-bold">
              {pack.label} · {formatPrice(pack.price)}
            </dd>
          </div>
          <div className="flex items-baseline justify-between gap-3 py-3">
            <dt className="text-body text-muted-foreground">Canaux</dt>
            <dd className="text-right text-body font-bold">
              {(campaign.channels ?? [])
                .map((channel) => AD_CHANNEL_LABEL[channel].label)
                .join(' · ') || '—'}
            </dd>
          </div>
          <div className="flex items-baseline justify-between gap-3 py-3">
            <dt className="text-body text-muted-foreground">Marquage</dt>
            <dd className="text-right text-body font-bold">Sponsorisé</dd>
          </div>
        </dl>
      </section>

      <section aria-label="Résultats" className="space-y-3 px-4">
        <h3 className="text-title font-extrabold">Objectifs du forfait {pack.label}</h3>
        <div className="rounded-2xl border bg-card p-4 shadow-card">
          <CampaignObjectives campaign={campaign} />
        </div>
        {started ? null : (
          <p className="flex items-start gap-2 text-caption text-muted-foreground">
            <Info className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
            Les résultats apparaissent quand la campagne est diffusée.
          </p>
        )}
      </section>
    </article>
  )
}
