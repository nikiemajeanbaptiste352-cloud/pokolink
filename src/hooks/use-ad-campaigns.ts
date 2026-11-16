import { useMemo, useSyncExternalStore } from 'react'

import { getStoredCampaigns, subscribeCampaigns } from '@/lib/ad-campaigns-store'
import { getPlaceholderCampaigns } from '@/lib/placeholder-ads'
import type { AdCampaign } from '@/types/ads'

/**
 * Campagnes d'un Service Pro, de la plus récente à la plus ancienne : celles créées sur cet
 * appareil, puis des exemples. À remplacer par TanStack Query.
 */
export function useAdCampaigns(serviceId: string): AdCampaign[] {
  const stored = useSyncExternalStore(subscribeCampaigns, getStoredCampaigns)
  return useMemo(
    () =>
      [
        ...stored.filter((campaign) => campaign.serviceId === serviceId),
        ...getPlaceholderCampaigns(serviceId),
      ].sort((a, b) => b.createdAt - a.createdAt),
    [stored, serviceId],
  )
}
