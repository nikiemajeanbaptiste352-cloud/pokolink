/**
 * STOCKAGE TEMPORAIRE — forfaits / commandes publicitaires Creator Studio.
 * À remplacer par l’API. Aucune page Studio existante n’importe ce module.
 */
import {
  TEMP_STUDIO_AD_ORDERS,
  TEMP_STUDIO_AD_PLANS,
  TEMP_STUDIO_AD_STATS,
} from '@/lib/placeholder-studio-ads'
import { createId } from '@/lib/ids'
import type {
  StudioAdOrder,
  StudioAdOrderStatus,
  StudioAdPlan,
  StudioAdPlanStatus,
  StudioAdStatsSnapshot,
} from '@/types/studio-ads'

const STORAGE_KEY = 'africonnect.studio-ads.v1'

type Listener = () => void

interface AdsState {
  plans: Record<string, StudioAdPlan>
  orders: Record<string, StudioAdOrder>
  removedPlans: string[]
}

let state: AdsState | null = null
let planList: readonly StudioAdPlan[] | null = null
let orderList: readonly StudioAdOrder[] | null = null
const listeners = new Set<Listener>()

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function load(): AdsState {
  if (state) return state
  state = { plans: {}, orders: {}, removedPlans: [] }
  try {
    const parsed: unknown = JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? 'null')
    if (!isRecord(parsed)) return state
    if (isRecord(parsed.plans)) {
      for (const [id, value] of Object.entries(parsed.plans)) {
        if (isRecord(value) && typeof value.name === 'string') {
          const raw = value as unknown as StudioAdPlan
          state.plans[id] = {
            ...raw,
            socialStats: Array.isArray(raw.socialStats) ? raw.socialStats : [],
          }
        }
      }
    }
    if (isRecord(parsed.orders)) {
      for (const [id, value] of Object.entries(parsed.orders)) {
        if (isRecord(value) && typeof value.number === 'string') {
          state.orders[id] = value as unknown as StudioAdOrder
        }
      }
    }
    if (Array.isArray(parsed.removedPlans)) {
      state.removedPlans = parsed.removedPlans.filter(
        (id): id is string => typeof id === 'string',
      )
    }
  } catch {
    // ignore
  }
  return state
}

function commit(next: AdsState) {
  state = next
  planList = null
  orderList = null
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  } catch {
    // quota
  }
  listeners.forEach((l) => l())
}

export function subscribeStudioAds(listener: Listener): () => void {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

function normalizePlan(plan: StudioAdPlan): StudioAdPlan {
  return {
    ...plan,
    socialStats: Array.isArray(plan.socialStats) ? plan.socialStats : [],
    platforms: Array.isArray(plan.platforms) ? plan.platforms : [],
    inclusions: Array.isArray(plan.inclusions) ? plan.inclusions : [],
  }
}

export function getStudioAdPlans(): readonly StudioAdPlan[] {
  if (planList) return planList
  const current = load()
  const byId = new Map<string, StudioAdPlan>()
  for (const plan of TEMP_STUDIO_AD_PLANS) {
    if (!current.removedPlans.includes(plan.id)) byId.set(plan.id, normalizePlan(plan))
  }
  for (const [id, plan] of Object.entries(current.plans)) {
    if (!current.removedPlans.includes(id)) byId.set(id, normalizePlan(plan))
  }
  planList = [...byId.values()].sort((a, b) => b.updatedAt - a.updatedAt)
  return planList
}

export function getStudioAdOrders(): readonly StudioAdOrder[] {
  if (orderList) return orderList
  const current = load()
  const byId = new Map<string, StudioAdOrder>()
  for (const order of TEMP_STUDIO_AD_ORDERS) byId.set(order.id, order)
  for (const [id, order] of Object.entries(current.orders)) byId.set(id, order)
  orderList = [...byId.values()].sort((a, b) => b.orderedAt - a.orderedAt)
  return orderList
}

export function getStudioAdStats(): StudioAdStatsSnapshot {
  return TEMP_STUDIO_AD_STATS
}

export type StudioAdPlanInput = Omit<
  StudioAdPlan,
  'id' | 'createdAt' | 'updatedAt' | 'status'
> & { status?: StudioAdPlanStatus }

export function saveStudioAdPlan(
  input: StudioAdPlanInput,
  id?: string,
  now = Date.now(),
): StudioAdPlan {
  const current = load()
  const existing = id ? current.plans[id] ?? TEMP_STUDIO_AD_PLANS.find((p) => p.id === id) : undefined
  const plan: StudioAdPlan = {
    id: existing?.id ?? createId(),
    name: input.name.trim(),
    description: input.description.trim(),
    ...(input.imageSrc ? { imageSrc: input.imageSrc } : {}),
    platforms: [...input.platforms],
    socialStats: (input.socialStats ?? []).map((row) => ({
      platform: row.platform,
      handle: row.handle.trim(),
      followers: Math.max(0, Math.round(row.followers)),
      engagementRate: Math.min(1, Math.max(0, row.engagementRate)),
      avgViews: Math.max(0, Math.round(row.avgViews)),
    })),
    inclusions: input.inclusions.map((s) => s.trim()).filter(Boolean),
    price: input.price,
    conditions: input.conditions.trim(),
    turnaround: input.turnaround.trim(),
    status: input.status ?? existing?.status ?? 'draft',
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
  }
  commit({
    ...current,
    plans: { ...current.plans, [plan.id]: plan },
    removedPlans: current.removedPlans.filter((x) => x !== plan.id),
  })
  return plan
}

export function setStudioAdPlanStatus(
  id: string,
  status: StudioAdPlanStatus,
  now = Date.now(),
): StudioAdPlan | undefined {
  const plans = getStudioAdPlans()
  const plan = plans.find((p) => p.id === id)
  if (!plan) return undefined
  return saveStudioAdPlan({ ...plan, status }, id, now)
}

export function getStudioAdPlan(id: string): StudioAdPlan | undefined {
  return getStudioAdPlans().find((plan) => plan.id === id)
}

/** Forfaits visibles sur la page publique du créateur. */
export function getPublishedStudioAdPlans(): readonly StudioAdPlan[] {
  return getStudioAdPlans().filter((plan) => plan.status === 'published')
}

export function updateStudioAdOrderStatus(
  id: string,
  status: StudioAdOrderStatus,
  note?: string,
  now = Date.now(),
): StudioAdOrder | undefined {
  const current = load()
  const base =
    current.orders[id] ?? TEMP_STUDIO_AD_ORDERS.find((o) => o.id === id)
  if (!base) return undefined
  const next: StudioAdOrder = {
    ...base,
    status,
    updatedAt: now,
    ...(note !== undefined ? { note } : {}),
  }
  commit({
    ...current,
    orders: { ...current.orders, [id]: next },
  })
  return next
}

export type PlaceStudioAdOrderInput = {
  plan: StudioAdPlan
  advertiserName: string
  advertiserHandle?: string
  campaignBrief?: string
  kind?: StudioAdOrder['kind']
}

/** Enregistre une commande (après paiement) ou une demande de devis côté Studio privé. */
export function placeStudioAdOrder(
  input: PlaceStudioAdOrderInput,
  now = Date.now(),
): StudioAdOrder {
  const current = load()
  const kind = input.kind ?? (input.plan.price === null ? 'quote' : 'order')
  const prefix = kind === 'quote' ? 'DEV' : 'PUB'
  const number = `${prefix}-${new Date(now).getFullYear()}-${String(
    Object.keys(current.orders).length + TEMP_STUDIO_AD_ORDERS.length + 1,
  ).padStart(4, '0')}`
  const order: StudioAdOrder = {
    id: createId(),
    number,
    kind,
    planId: input.plan.id,
    planName: input.plan.name,
    advertiserName: input.advertiserName.trim(),
    ...(input.advertiserHandle
      ? { advertiserHandle: input.advertiserHandle.replace(/^@/, '') }
      : {}),
    acceptedPrice: kind === 'order' ? input.plan.price : null,
    orderedAt: now,
    campaignBrief:
      input.campaignBrief?.trim() ||
      (kind === 'quote'
        ? 'Demande de devis depuis la page publique.'
        : 'Commande depuis la page publique.'),
    status: 'pending',
    updatedAt: now,
  }
  commit({
    ...current,
    orders: { ...current.orders, [order.id]: order },
  })
  return order
}
