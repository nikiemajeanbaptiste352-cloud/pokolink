/**
 * Stats publiques / privées d’un membre AfriLearn (contributions + commerce).
 * Pont profil public ↔ espace privé Mon AfriLearn.
 */
import {
  canManageCanal,
  getOwnerCanal,
  getOwnerCanalSubscription,
  listSellerProducts,
  listSellerSales,
  sellerFinanceSummary,
} from '@/lib/afrilearn-commerce-store'
import { getContributions } from '@/lib/learn-contributions'
import { getProfile } from '@/lib/profile-store'
import type { LearnAuthor } from '@/types/learn'

export interface LearnMemberCommerceStats {
  hasCanal: boolean
  canalPublished: boolean
  canalActive: boolean
  canalName?: string
  canalId?: string
  productsPublished: number
  productsTotal: number
  salesCount: number
  /** Visible surtout en vue privée (propriétaire). */
  salesNet?: number
  subscriptionStatus?: string
}

export function getLearnMemberCommerceStats(
  handle: string,
): LearnMemberCommerceStats {
  const h = handle.replace(/^@/, '')
  const canal = getOwnerCanal(h)
  const sub = getOwnerCanalSubscription(h)
  const products = listSellerProducts(h)
  const published = products.filter((p) => p.status === 'published')
  const sales = listSellerSales(h)
  const finance = sellerFinanceSummary(h)
  const active = canManageCanal(h)

  return {
    hasCanal: Boolean(canal),
    canalPublished: Boolean(canal?.published && active),
    canalActive: active,
    ...(canal ? { canalName: canal.name, canalId: canal.id } : {}),
    productsPublished: published.length,
    productsTotal: products.length,
    salesCount: sales.length,
    salesNet: finance.netTotal,
    ...(sub ? { subscriptionStatus: sub.status } : {}),
  }
}

export function getLearnMemberContentStats(author: LearnAuthor, own: boolean) {
  const { publications, questions, documents, answers } = getContributions(
    author,
    own,
  )
  return {
    publications: publications.length + questions.length,
    documents: documents.length,
    answers: answers.length,
  }
}

/** Handle du compte connecté (profil). */
export function isLearnOwnHandle(handle: string): boolean {
  const me = getProfile().handle.replace(/^@/, '').toLowerCase()
  return handle.replace(/^@/, '').toLowerCase() === me
}
