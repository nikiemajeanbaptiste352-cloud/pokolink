/**
 * Connexion AfriLearn ↔ Wallet central.
 * Activation Canal / vente produit uniquement après paiement confirmé (onSent).
 */
import {
  activateCanalMemberSubscription,
  activateCanalSubscription,
  findEduProduct,
  getOwnerCanal,
  recordEduSale,
  upsertCanalPro,
} from '@/lib/afrilearn-commerce-store'
import { getLearnCanalMemberPlan, getLearnCanalPlan } from '@/lib/afrilearn-plans'
import { getWalletPayments } from '@/lib/wallet-payments-store'
import type { LearnCanalMemberPlanId } from '@/types/afrilearn-commerce'

const SETTLED_KEY = 'africonnect.afrilearn-wallet-settled.v1'

function loadSettled(): Set<string> {
  try {
    const raw = JSON.parse(window.localStorage.getItem(SETTLED_KEY) ?? '[]')
    if (Array.isArray(raw)) return new Set(raw.filter((x) => typeof x === 'string'))
  } catch {
    // ignore
  }
  return new Set()
}

function markSettled(key: string) {
  const set = loadSettled()
  if (set.has(key)) return false
  set.add(key)
  try {
    window.localStorage.setItem(SETTLED_KEY, JSON.stringify([...set].slice(-200)))
  } catch {
    // ignore
  }
  return true
}

function paymentRef(walletPaymentId: string): string {
  const payment = getWalletPayments().find((p) => p.id === walletPaymentId)
  return (
    payment?.provisionalReference ?? `AC-LEARN-${walletPaymentId.replace(/\W/g, '').slice(0, 10)}`
  )
}

/** Après débit Wallet : active l’abonnement Canal Pro (idempotent). */
export function settleLearnCanalPayment(input: {
  walletPaymentId: string
  ownerHandle: string
  planId: string
}): { ok: boolean; ref: string; already?: boolean } {
  const plan = getLearnCanalPlan(input.planId)
  if (!plan) return { ok: false, ref: '' }
  const key = `canal:${input.walletPaymentId}`
  const ref = paymentRef(input.walletPaymentId)
  if (!markSettled(key)) return { ok: true, ref, already: true }
  const sub = activateCanalSubscription({
    ownerHandle: input.ownerHandle,
    planId: plan.id,
    paymentRef: ref,
  })
  if (!sub) return { ok: false, ref: '' }
  // Premier paiement propriétaire : créer un brouillon de canal pour atterrir dessus.
  const handle = input.ownerHandle.replace(/^@/, '')
  if (!getOwnerCanal(handle)) {
    upsertCanalPro({
      ownerHandle: handle,
      subscriptionId: sub.id,
      name: `Canal de ${handle}`,
      tagline: '',
      description: '',
      logo: '',
      cover: '',
      published: false,
      memberPlansEnabled: true,
    })
  }
  return { ok: true, ref }
}

/** Après débit Wallet : abonnement visiteur à un Canal Pro (idempotent). */
export function settleLearnCanalMemberPayment(input: {
  walletPaymentId: string
  canalId: string
  memberHandle: string
  planId: LearnCanalMemberPlanId
}): { ok: boolean; ref: string; already?: boolean } {
  if (!getLearnCanalMemberPlan(input.planId)) return { ok: false, ref: '' }
  const key = `canal-member:${input.walletPaymentId}`
  const ref = paymentRef(input.walletPaymentId)
  if (!markSettled(key)) return { ok: true, ref, already: true }
  const sub = activateCanalMemberSubscription({
    canalId: input.canalId,
    memberHandle: input.memberHandle,
    planId: input.planId,
    paymentRef: ref,
  })
  return { ok: Boolean(sub), ref }
}

/** Après débit Wallet : enregistre la vente et l’accès acheteur (idempotent). */
export function settleLearnEduPurchase(input: {
  walletPaymentId: string
  ticketId: string
  productId: string
  buyerHandle: string
  buyerName: string
}): { ok: boolean; already?: boolean } {
  const product = findEduProduct(input.productId)
  if (!product || product.status !== 'published') return { ok: false }
  const key = `edu:${input.walletPaymentId}`
  if (!markSettled(key)) return { ok: true, already: true }
  recordEduSale({
    product,
    buyerHandle: input.buyerHandle,
    buyerName: input.buyerName,
    ticketId: input.ticketId,
    walletPaymentId: input.walletPaymentId,
  })
  return { ok: true }
}
