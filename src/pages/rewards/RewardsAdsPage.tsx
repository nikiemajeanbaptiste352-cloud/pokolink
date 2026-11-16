import { Megaphone } from 'lucide-react'
import { useMemo, useSyncExternalStore } from 'react'

import { BackLink } from '@/components/common/BackLink'
import { EmptyState } from '@/components/common/EmptyState'
import { PageHeader } from '@/components/common/PageHeader'
import { AdMissionCard } from '@/components/rewards/AdMissionCard'
import { getStoredCampaigns, subscribeCampaigns } from '@/lib/ad-campaigns-store'
import { getRewardsAdMissions } from '@/lib/ad-distribution'
import { AD_DAILY_LIMITS, AD_MISSION_LABEL, formatMissionPoints } from '@/lib/ad-packs'
import {
  creditRewardsEarn,
  hasRewardsEarn,
  rewardsEarnDayKey,
  rewardsEarnStore,
} from '@/lib/rewards-earn-store'
import { paths } from '@/routes/paths'
import type { AdMissionType } from '@/types/ads'

const LIMIT_ROWS: readonly AdMissionType[] = ['view', 'visit', 'subscription']

/** Horodatage d'une action utilisateur (appelée depuis un événement, jamais au rendu). */
function timestamp() {
  return Date.now()
}

function missionEarnKey(missionId: string, now: number): string {
  return `ad:${missionId}:${rewardsEarnDayKey(now)}`
}

/**
 * Missions publicitaires Rewards : regarder une pub, visiter, s’abonner.
 * Démo : les points sont crédités immédiatement une fois l’action faite.
 */
export function RewardsAdsPage() {
  const earnLedger = useSyncExternalStore(
    rewardsEarnStore.subscribe,
    rewardsEarnStore.get,
    rewardsEarnStore.get,
  )
  const campaigns = useSyncExternalStore(subscribeCampaigns, getStoredCampaigns)
  void earnLedger

  const missions = useMemo(() => getRewardsAdMissions(), [campaigns])
  const now = timestamp()

  function claim(missionId: string) {
    const mission = missions.find((m) => m.id === missionId)
    if (!mission || mission.status !== 'available') return
    const key = missionEarnKey(mission.id, now)
    if (hasRewardsEarn(key)) return
    const typeLabel = AD_MISSION_LABEL[mission.type].label
    creditRewardsEarn(
      {
        key,
        points: mission.points,
        title:
          mission.type === 'view'
            ? `Pub regardée · ${mission.businessName}`
            : `${typeLabel} · ${mission.businessName}`,
        detail: `Campagne « ${mission.campaignTitle} » · +${formatMissionPoints(mission.points)}`,
      },
      timestamp(),
    )
  }

  return (
    <>
      <PageHeader
        title="Missions publicitaires"
        leading={<BackLink to={paths.rewardsEarn} label="Gagner" history />}
      />

      <div className="space-y-5 py-4">

        <section aria-labelledby="ads-limits" className="space-y-2 px-4">
          <h3 id="ads-limits" className="text-title font-extrabold">
            Plafonds du jour
          </h3>
          <p className="text-caption text-muted-foreground">
            Une même mission ne peut être validée qu’un nombre limité de fois par jour.
          </p>
          <ul className="grid grid-cols-3 gap-2">
            {LIMIT_ROWS.map((type) => (
              <li
                key={type}
                className="rounded-xl border bg-card px-3 py-2.5 text-center shadow-card"
              >
                <p className="text-caption font-semibold text-muted-foreground">
                  {AD_MISSION_LABEL[type].label}
                </p>
                <p className="text-title font-extrabold tabular-nums">
                  {AD_DAILY_LIMITS[type]}
                </p>
              </li>
            ))}
          </ul>
        </section>

        {missions.length === 0 ? (
          <EmptyState
            icon={Megaphone}
            title="Aucune mission"
            description="Les campagnes avec budget Rewards apparaîtront ici."
            className="py-12"
          />
        ) : (
          <ul className="space-y-3 px-4">
            {missions.map((mission) => {
              const doneToday = hasRewardsEarn(missionEarnKey(mission.id, now))
              return (
                <li key={mission.id}>
                  <AdMissionCard
                    mission={
                      doneToday
                        ? { ...mission, status: 'done', doneToday: mission.doneToday + 1 }
                        : mission
                    }
                    onClaim={
                      !doneToday && mission.status === 'available'
                        ? () => claim(mission.id)
                        : undefined
                    }
                  />
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </>
  )
}
