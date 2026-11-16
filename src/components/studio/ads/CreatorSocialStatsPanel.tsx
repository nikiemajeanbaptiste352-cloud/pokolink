import { formatCount } from '@/lib/format'
import {
  getCreatorSocialStats,
  orderSocialStatsForPlan,
  type CreatorSocialStat,
} from '@/lib/creator-social-stats'
import { STUDIO_AD_PLATFORM_LABEL } from '@/lib/studio-ads-labels'
import type { StudioAdPlatform, StudioAdSocialStat } from '@/types/studio-ads'

function formatEngagement(rate: number): string {
  return `${(rate * 100).toFixed(1).replace('.', ',')} %`
}

function toRows(
  planStats: readonly StudioAdSocialStat[] | undefined,
  handle: string,
  planPlatforms: readonly StudioAdPlatform[],
): readonly CreatorSocialStat[] {
  if (planStats && planStats.length > 0) {
    return planStats.map((row) => ({
      platform: row.platform,
      handle: row.handle,
      followers: row.followers,
      engagementRate: row.engagementRate,
      avgViews: row.avgViews,
    }))
  }
  return orderSocialStatsForPlan(getCreatorSocialStats(handle), planPlatforms)
}

/**
 * Statistiques réseaux : celles du forfait si renseignées, sinon le profil créateur.
 */
export function CreatorSocialStatsPanel({
  handle,
  planPlatforms,
  planStats,
}: {
  handle: string
  planPlatforms?: readonly StudioAdPlatform[]
  planStats?: readonly StudioAdSocialStat[]
}) {
  const stats = toRows(planStats, handle, planPlatforms ?? [])

  if (stats.length === 0) return null

  return (
    <section aria-label="Statistiques des réseaux sociaux" className="space-y-3">
      <div>
        <h3 className="text-body font-extrabold">Réseaux sociaux</h3>
        <p className="text-caption text-muted-foreground">
          Audience et performance sur les plateformes de ce forfait.
        </p>
      </div>
      <ul className="space-y-2">
        {stats.map((row) => {
          const featured = planPlatforms?.includes(row.platform) ?? true
          return (
            <li
              key={row.platform}
              className={
                featured
                  ? 'rounded-2xl border border-primary/25 bg-primary/5 p-3.5'
                  : 'rounded-2xl border bg-card p-3.5 shadow-card'
              }
            >
              <div className="flex items-baseline justify-between gap-2">
                <p className="text-body font-extrabold">
                  {STUDIO_AD_PLATFORM_LABEL[row.platform]}
                </p>
                <p className="truncate text-caption text-muted-foreground">
                  {row.handle}
                </p>
              </div>
              <dl className="mt-2 grid grid-cols-3 gap-2 text-center">
                <div>
                  <dt className="text-[11px] font-semibold text-muted-foreground uppercase">
                    Abonnés
                  </dt>
                  <dd className="text-body font-extrabold tabular-nums">
                    {formatCount(row.followers)}
                  </dd>
                </div>
                <div>
                  <dt className="text-[11px] font-semibold text-muted-foreground uppercase">
                    Engagement
                  </dt>
                  <dd className="text-body font-extrabold tabular-nums">
                    {formatEngagement(row.engagementRate)}
                  </dd>
                </div>
                <div>
                  <dt className="text-[11px] font-semibold text-muted-foreground uppercase">
                    Vues moy.
                  </dt>
                  <dd className="text-body font-extrabold tabular-nums">
                    {formatCount(row.avgViews)}
                  </dd>
                </div>
              </dl>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
