import { AD_MISSION_LABEL, getAdPack } from '@/lib/ad-packs'
import { formatCount } from '@/lib/format'
import type { AdCampaign } from '@/types/ads'

interface CampaignObjectivesProps {
  campaign: AdCampaign
  /** Affiche les barres même si la campagne n'a pas encore démarré (objectifs du forfait). */
  showTargetsOnly?: boolean
}

/**
 * Suivi des objectifs du forfait choisi : vues, visites, abonnés vs cibles.
 * Les totaux mesurés viennent du serveur ; le frontend n'incrémente rien.
 */
export function CampaignObjectives({
  campaign,
  showTargetsOnly = false,
}: CampaignObjectivesProps) {
  const pack = getAdPack(campaign.pack)
  const started =
    showTargetsOnly ||
    campaign.status === 'active' ||
    campaign.status === 'finished'
  const rows = [
    {
      key: 'views' as const,
      label: AD_MISSION_LABEL.view.label,
      target: pack.targets.views,
      value: campaign.results.views,
    },
    {
      key: 'visits' as const,
      label: AD_MISSION_LABEL.visit.label,
      target: pack.targets.visits,
      value: campaign.results.visits,
    },
    {
      key: 'subscribers' as const,
      label: AD_MISSION_LABEL.subscription.label,
      target: pack.targets.subscribers,
      value: campaign.results.subscribers,
    },
  ]

  return (
    <ul aria-label={`Objectifs forfait ${pack.label}`} className="space-y-2.5">
      {rows.map((row) => {
        const percent = started
          ? Math.min(100, Math.round((row.value / row.target) * 100))
          : 0
        return (
          <li key={row.key} className="space-y-1">
            <div className="flex items-baseline justify-between gap-2 text-caption">
              <span className="font-bold">{row.label}</span>
              <span className="tabular-nums text-muted-foreground">
                {started ? formatCount(row.value) : '—'} / {formatCount(row.target)}
                {started ? (
                  <span className="ml-1 font-extrabold text-brand">{percent} %</span>
                ) : null}
              </span>
            </div>
            <div
              className="h-2 overflow-hidden rounded-full bg-muted"
              role="progressbar"
              aria-valuenow={percent}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={`${row.label} : ${percent} %`}
            >
              <div
                className="h-full rounded-full bg-brand transition-[width]"
                style={{ width: `${percent}%` }}
              />
            </div>
          </li>
        )
      })}
    </ul>
  )
}
