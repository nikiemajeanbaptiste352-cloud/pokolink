import { useMemo, useSyncExternalStore } from 'react'

import { TEMP_PURCHASES } from '@/lib/placeholder-purchases'
import { getStoredPurchases, subscribePurchases } from '@/lib/purchases-store'
import type { Purchase } from '@/types/purchase'

/**
 * Achats de l'utilisateur, du plus récent au plus ancien : ceux demandés sur cet appareil,
 * puis des exemples. À remplacer par TanStack Query.
 */
export function usePurchases(): Purchase[] {
  const stored = useSyncExternalStore(subscribePurchases, getStoredPurchases)
  return useMemo(
    () => [...stored, ...TEMP_PURCHASES].sort((a, b) => b.createdAt - a.createdAt),
    [stored],
  )
}
