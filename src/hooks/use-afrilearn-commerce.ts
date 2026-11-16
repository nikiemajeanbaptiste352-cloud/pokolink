import { useSyncExternalStore } from 'react'

import {
  getAfriLearnCommerceState,
  getMemberSubscription,
  getOwnerCanal,
  getOwnerCanalSubscription,
  listBuyerAccesses,
  listCanalMemberSubscribers,
  listMemberCanalSubscriptions,
  listPublishedCanals,
  listPublishedProducts,
  listSellerProducts,
  listSellerSales,
  subscribeAfriLearnCommerce,
} from '@/lib/afrilearn-commerce-store'

export function useAfriLearnCommerce() {
  return useSyncExternalStore(
    subscribeAfriLearnCommerce,
    getAfriLearnCommerceState,
    getAfriLearnCommerceState,
  )
}

export function useOwnerCanal(handle: string) {
  useAfriLearnCommerce()
  return getOwnerCanal(handle)
}

export function useOwnerCanalSubscription(handle: string) {
  useAfriLearnCommerce()
  return getOwnerCanalSubscription(handle)
}

export function useSellerEduProducts(handle: string) {
  useAfriLearnCommerce()
  return listSellerProducts(handle)
}

export function usePublishedEduProducts() {
  useAfriLearnCommerce()
  return listPublishedProducts()
}

export function usePublishedLearnCanals() {
  useAfriLearnCommerce()
  return listPublishedCanals()
}

export function useSellerEduSales(handle: string) {
  useAfriLearnCommerce()
  return listSellerSales(handle)
}

export function useBuyerEduAccesses(handle: string) {
  useAfriLearnCommerce()
  return listBuyerAccesses(handle)
}

export function useCanalMemberSubscription(
  canalId: string | undefined,
  memberHandle: string,
) {
  useAfriLearnCommerce()
  if (!canalId) return undefined
  return getMemberSubscription(canalId, memberHandle)
}

export function useCanalMemberSubscribers(canalId: string | undefined) {
  useAfriLearnCommerce()
  if (!canalId) return []
  return listCanalMemberSubscribers(canalId)
}

export function useMyCanalSubscriptions(memberHandle: string) {
  useAfriLearnCommerce()
  return listMemberCanalSubscriptions(memberHandle)
}
