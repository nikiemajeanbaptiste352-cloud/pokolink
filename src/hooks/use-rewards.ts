import { useMemo } from 'react'

import { useLocalStore } from '@/hooks/use-local-store'
import {
  adMissionRequestsStore,
} from '@/lib/ad-mission-requests-store'
import {
  DEMO_PAYMENT_REWARDS_POINTS,
  demoBalancesStore,
} from '@/lib/demo-balances-store'
import { TEMP_REWARDS_BALANCES, TEMP_REWARDS_OPERATIONS } from '@/lib/placeholder-rewards'
import {
  getRewardsEarnOperations,
  rewardsEarnStore,
} from '@/lib/rewards-earn-store'
import { rewardsRequestsStore } from '@/lib/rewards-requests-store'
import type { RewardsBalances, RewardsOperation } from '@/types/rewards'

/**
 * Soldes Rewards : placeholder + overlay démo (paiements, crédits d’actions).
 */
export function useRewardsBalances(): RewardsBalances {
  const demo = useLocalStore(demoBalancesStore)
  return useMemo(
    () => ({
      ...TEMP_REWARDS_BALANCES,
      available: demo.rewardsPoints ?? DEMO_PAYMENT_REWARDS_POINTS,
    }),
    [demo],
  )
}

/**
 * Journal Rewards : crédits immédiats (actions), demandes missions/transferts, puis exemples.
 */
export function useRewardsOperations(): readonly RewardsOperation[] {
  const earn = useLocalStore(rewardsEarnStore)
  const transfers = useLocalStore(rewardsRequestsStore)
  const missions = useLocalStore(adMissionRequestsStore)
  return useMemo(() => {
    void earn
    return [
      ...getRewardsEarnOperations(),
      ...missions,
      ...transfers,
      ...TEMP_REWARDS_OPERATIONS,
    ].sort((a, b) => b.at - a.at)
  }, [earn, transfers, missions])
}
