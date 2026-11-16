import { useSyncExternalStore } from 'react'

import {
  getDebtsForClient,
  getDebtsForService,
  getMerchantDebts,
  subscribeMerchantDebts,
} from '@/lib/merchant-credits-store'
import type { MerchantDebt } from '@/types/merchant-credit'

export function useMerchantDebts(): readonly MerchantDebt[] {
  return useSyncExternalStore(subscribeMerchantDebts, getMerchantDebts, getMerchantDebts)
}

export function useClientDebts(clientHandle: string): MerchantDebt[] {
  useMerchantDebts()
  return getDebtsForClient(clientHandle)
}

export function useServiceDebts(serviceId: string): MerchantDebt[] {
  useMerchantDebts()
  return getDebtsForService(serviceId)
}
