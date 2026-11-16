import { useSyncExternalStore } from 'react'

import {
  getStudioAdOrders,
  getStudioAdPlans,
  getStudioAdStats,
  subscribeStudioAds,
} from '@/lib/studio-ads-store'
import type {
  StudioAdOrder,
  StudioAdPlan,
  StudioAdStatsSnapshot,
} from '@/types/studio-ads'

export function useStudioAdPlans(): readonly StudioAdPlan[] {
  return useSyncExternalStore(subscribeStudioAds, getStudioAdPlans)
}

export function useStudioAdOrders(): readonly StudioAdOrder[] {
  return useSyncExternalStore(subscribeStudioAds, getStudioAdOrders)
}

export function useStudioAdStats(): StudioAdStatsSnapshot {
  return useSyncExternalStore(subscribeStudioAds, getStudioAdStats)
}
