/**
 * Stockage démo AfriLearn commerce (Canal Pro + produits + ventes).
 * Paiements via Wallet central — pas de second portefeuille.
 */
import { LEARN_EDU_PLATFORM_FEE_RATE } from '@/lib/afrilearn-commerce-labels'
import {
  getLearnCanalMemberPlan,
  getLearnCanalPlan,
  memberPlanPrice,
} from '@/lib/afrilearn-plans'
import { createId } from '@/lib/ids'
import type {
  LearnCanalMemberPlanId,
  LearnCanalMemberSubscription,
  LearnCanalPro,
  LearnCanalSubscription,
  LearnEduProduct,
  LearnEduPurchaseAccess,
  LearnEduSale,
} from '@/types/afrilearn-commerce'

const STORAGE_KEY = 'africonnect.afrilearn-commerce.v1'

interface State {
  subscriptions: LearnCanalSubscription[]
  canals: LearnCanalPro[]
  memberSubscriptions: LearnCanalMemberSubscription[]
  products: LearnEduProduct[]
  sales: LearnEduSale[]
  accesses: LearnEduPurchaseAccess[]
}

type Listener = () => void

let state: State | null = null
const listeners = new Set<Listener>()

function normalizeCanal(raw: LearnCanalPro): LearnCanalPro {
  return {
    ...raw,
    // Absent (canaux créés avant V1 forfaits) → activé par défaut.
    memberPlansEnabled:
      typeof raw.memberPlansEnabled === 'boolean'
        ? raw.memberPlansEnabled
        : true,
  }
}

const SEED_CANAL_AICHA = 'seed-canal-aicha'

/** Seed démo : cartes visibles dans les fils + profils. */
function seedDemo(): State {
  const now = Date.now()
  const subId = 'seed-sub-amadou'
  const canalId = 'seed-canal-amadou'
  const subAicha = 'seed-sub-aicha'
  const productId = 'seed-prod-fiche-maths'
  return {
    subscriptions: [
      {
        id: subId,
        ownerHandle: 'amadou.ba',
        planId: 'pro',
        planName: 'Pro',
        amountPaid: 15_000,
        startedAt: now - 7 * 86_400_000,
        expiresAt: now + 80 * 86_400_000,
        status: 'active',
        paymentRefs: ['AC-SEED-LEARN-001'],
      },
      {
        id: subAicha,
        ownerHandle: 'aicha.o',
        planId: 'pro',
        planName: 'Pro',
        amountPaid: 15_000,
        startedAt: now - 5 * 86_400_000,
        expiresAt: now + 85 * 86_400_000,
        status: 'active',
        paymentRefs: ['AC-SEED-LEARN-002'],
      },
    ],
    canals: [
      {
        id: canalId,
        ownerHandle: 'amadou.ba',
        subscriptionId: subId,
        name: 'Maths Terminale · Amadou',
        tagline: 'Exercices, méthodes et annales',
        description:
          'Canal Pro éducatif : méthodes de maths pour la Terminale D, annales commentées.',
        logo: '',
        cover: '',
        published: true,
        memberPlansEnabled: true,
        memberPlanPrices: {
          mensuel: 1_500,
          trimestriel: 3_500,
          annuel: 10_000,
        },
        createdAt: now - 6 * 86_400_000,
        updatedAt: now - 6 * 86_400_000,
      },
      {
        id: SEED_CANAL_AICHA,
        ownerHandle: 'aicha.o',
        subscriptionId: subAicha,
        name: 'Français BEPC · Aïcha',
        tagline: 'Méthodes, dissertations et oraux',
        description:
          'Canal Pro pour préparer le français au BEPC : méthodes, sujets commentés.',
        logo: '',
        cover: '',
        published: true,
        memberPlansEnabled: true,
        memberPlanPrices: {
          mensuel: 1_200,
          trimestriel: 3_000,
          annuel: 9_000,
        },
        createdAt: now - 4 * 86_400_000,
        updatedAt: now - 4 * 86_400_000,
      },
    ],
    memberSubscriptions: [],
    products: [
      {
        id: productId,
        sellerHandle: 'amadou.ba',
        sellerName: 'Amadou Ba',
        name: 'Fiche révision · Probabilités',
        description:
          'Synthèse probabilités Terminale : arbres, lois, exercices corrigés.',
        category: 'revision',
        image: '',
        price: 2_500,
        kind: 'revision',
        delivery: 'download',
        preview: 'Sommaire + 2 exercices en aperçu.',
        digitalContent:
          'Fichier démo : Probabilités_Terminale.pdf (accès après paiement).',
        status: 'published',
        createdAt: now - 5 * 86_400_000,
        updatedAt: now - 5 * 86_400_000,
      },
      {
        id: 'seed-prod-aicha',
        sellerHandle: 'aicha.o',
        sellerName: 'Aïcha Ouédraogo',
        name: 'Cours BEPC · Français',
        description: 'Support de cours pour la préparation du BEPC.',
        category: 'course',
        image: '',
        price: 3_000,
        kind: 'course',
        delivery: 'online',
        preview: 'Plan du cours + vocabulaire.',
        digitalContent: 'Accès en ligne réservé aux acheteurs.',
        status: 'published',
        createdAt: now - 4 * 86_400_000,
        updatedAt: now - 4 * 86_400_000,
      },
    ],
    sales: [],
    accesses: [],
  }
}

/** Complète le seed Aïcha si l’ancienne démo n’avait que le canal Amadou. */
function ensureVisitorDemoCanal(s: State): State {
  if (s.canals.some((c) => c.id === SEED_CANAL_AICHA)) return s
  const demo = seedDemo()
  const canal = demo.canals.find((c) => c.id === SEED_CANAL_AICHA)
  const sub = demo.subscriptions.find((x) => x.id === 'seed-sub-aicha')
  if (!canal || !sub) return s
  const next: State = {
    ...s,
    subscriptions: s.subscriptions.some((x) => x.id === sub.id)
      ? s.subscriptions
      : [...s.subscriptions, sub],
    canals: [...s.canals, canal],
  }
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  } catch {
    // ignore
  }
  return next
}

function load(): State {
  if (state) return state
  try {
    const parsed: unknown = JSON.parse(
      window.localStorage.getItem(STORAGE_KEY) ?? 'null',
    )
    if (parsed && typeof parsed === 'object') {
      const raw = parsed as Partial<State>
      state = {
        subscriptions: Array.isArray(raw.subscriptions) ? raw.subscriptions : [],
        canals: (Array.isArray(raw.canals) ? raw.canals : []).map(normalizeCanal),
        memberSubscriptions: Array.isArray(raw.memberSubscriptions)
          ? raw.memberSubscriptions
          : [],
        products: Array.isArray(raw.products) ? raw.products : [],
        sales: Array.isArray(raw.sales) ? raw.sales : [],
        accesses: Array.isArray(raw.accesses) ? raw.accesses : [],
      }
      // Première visite sans données : seed pour les fils / profils.
      if (
        state.subscriptions.length === 0 &&
        state.canals.length === 0 &&
        state.products.length === 0
      ) {
        state = seedDemo()
        try {
          window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
        } catch {
          // ignore
        }
      } else {
        state = ensureVisitorDemoCanal(state)
      }
      refreshSubscriptionStatuses(Date.now())
      return state
    }
  } catch {
    // ignore
  }
  state = seedDemo()
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {
    // ignore
  }
  return state
}

function commit(next: State) {
  state = next
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  } catch {
    // quota
  }
  listeners.forEach((l) => l())
}

function refreshSubscriptionStatuses(now: number) {
  const s = load()
  let changed = false
  const subscriptions = s.subscriptions.map((sub) => {
    if (sub.status === 'active' && sub.expiresAt < now) {
      changed = true
      return { ...sub, status: 'expired' as const }
    }
    return sub
  })
  if (changed) {
    state = { ...s, subscriptions }
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    } catch {
      // ignore
    }
  }
}

export function subscribeAfriLearnCommerce(listener: Listener): () => void {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

export function getAfriLearnCommerceState(): State {
  return load()
}

export function getOwnerCanalSubscription(
  ownerHandle: string,
): LearnCanalSubscription | undefined {
  const handle = ownerHandle.replace(/^@/, '').toLowerCase()
  return load()
    .subscriptions.filter((s) => s.ownerHandle.toLowerCase() === handle)
    .sort((a, b) => b.startedAt - a.startedAt)[0]
}

export function getOwnerCanal(ownerHandle: string): LearnCanalPro | undefined {
  const handle = ownerHandle.replace(/^@/, '').toLowerCase()
  return load().canals.find((c) => c.ownerHandle.toLowerCase() === handle)
}

export function listPublishedCanals(): LearnCanalPro[] {
  refreshSubscriptionStatuses(Date.now())
  const s = load()
  const activeOwners = new Set(
    s.subscriptions
      .filter((sub) => sub.status === 'active')
      .map((sub) => sub.ownerHandle.toLowerCase()),
  )
  return s.canals.filter(
    (c) => c.published && activeOwners.has(c.ownerHandle.toLowerCase()),
  )
}

export function findCanal(id: string | undefined): LearnCanalPro | undefined {
  if (!id) return undefined
  return load().canals.find((c) => c.id === id)
}

/** Active un abonnement après paiement Wallet confirmé. */
export function activateCanalSubscription(input: {
  ownerHandle: string
  planId: string
  paymentRef: string
  now?: number
}): LearnCanalSubscription | undefined {
  const plan = getLearnCanalPlan(input.planId)
  if (!plan) return undefined
  const now = input.now ?? Date.now()
  const handle = input.ownerHandle.replace(/^@/, '')
  const existing = getOwnerCanalSubscription(handle)
  const baseStart =
    existing?.status === 'active' && existing.expiresAt > now
      ? existing.expiresAt
      : now
  const sub: LearnCanalSubscription = {
    id: createId(),
    ownerHandle: handle,
    planId: plan.id,
    planName: plan.name,
    amountPaid: plan.price,
    startedAt: now,
    expiresAt: baseStart + plan.durationDays * 86_400_000,
    status: 'active',
    paymentRefs: [input.paymentRef],
    ...(existing ? { renewedAt: now } : {}),
  }
  const s = load()
  const subscriptions = [
    sub,
    ...s.subscriptions.map((x) =>
      x.ownerHandle.toLowerCase() === handle.toLowerCase() && x.status === 'active'
        ? { ...x, status: 'expired' as const }
        : x,
    ),
  ]
  commit({ ...s, subscriptions })
  return sub
}

export function upsertCanalPro(
  input: Omit<LearnCanalPro, 'id' | 'createdAt' | 'updatedAt'> & {
    id?: string
  },
  now = Date.now(),
): LearnCanalPro {
  const s = load()
  const existing = input.id
    ? s.canals.find((c) => c.id === input.id)
    : getOwnerCanal(input.ownerHandle)
  if (existing) {
    const next: LearnCanalPro = {
      ...existing,
      ...input,
      id: existing.id,
      createdAt: existing.createdAt,
      updatedAt: now,
    }
    commit({
      ...s,
      canals: s.canals.map((c) => (c.id === existing.id ? next : c)),
    })
    return next
  }
  const created: LearnCanalPro = {
    id: createId(),
    ownerHandle: input.ownerHandle.replace(/^@/, ''),
    subscriptionId: input.subscriptionId,
    name: input.name,
    tagline: input.tagline,
    description: input.description,
    logo: input.logo,
    cover: input.cover,
    published: input.published,
    memberPlansEnabled: input.memberPlansEnabled === true,
    ...(input.memberPlanPrices
      ? { memberPlanPrices: input.memberPlanPrices }
      : {}),
    createdAt: now,
    updatedAt: now,
  }
  commit({ ...s, canals: [created, ...s.canals] })
  return created
}

function refreshMemberStatuses(now: number) {
  const s = load()
  let changed = false
  const memberSubscriptions = s.memberSubscriptions.map((sub) => {
    if (sub.status === 'active' && sub.expiresAt < now) {
      changed = true
      return { ...sub, status: 'expired' as const }
    }
    return sub
  })
  if (changed) {
    state = { ...s, memberSubscriptions }
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    } catch {
      // ignore
    }
  }
}

export function getMemberSubscription(
  canalId: string,
  memberHandle: string,
): LearnCanalMemberSubscription | undefined {
  refreshMemberStatuses(Date.now())
  const handle = memberHandle.replace(/^@/, '').toLowerCase()
  return load()
    .memberSubscriptions.filter(
      (s) =>
        s.canalId === canalId &&
        s.memberHandle.toLowerCase() === handle &&
        s.status === 'active',
    )
    .sort((a, b) => b.expiresAt - a.expiresAt)[0]
}

export function hasCanalMemberAccess(
  canalId: string,
  memberHandle: string,
  now = Date.now(),
): boolean {
  const canal = findCanal(canalId)
  if (!canal) return false
  if (canal.ownerHandle.toLowerCase() === memberHandle.replace(/^@/, '').toLowerCase()) {
    return true
  }
  const sub = getMemberSubscription(canalId, memberHandle)
  return Boolean(sub && sub.status === 'active' && sub.expiresAt > now)
}

/** Active un abonnement visiteur après paiement Wallet. */
export function activateCanalMemberSubscription(input: {
  canalId: string
  memberHandle: string
  planId: LearnCanalMemberPlanId
  paymentRef: string
  now?: number
}): LearnCanalMemberSubscription | undefined {
  const canal = findCanal(input.canalId)
  const plan = getLearnCanalMemberPlan(input.planId)
  if (!canal || !plan || !canal.memberPlansEnabled) return undefined
  const now = input.now ?? Date.now()
  const handle = input.memberHandle.replace(/^@/, '')
  const price = memberPlanPrice(canal, plan.id)
  const existing = getMemberSubscription(canal.id, handle)
  const baseStart =
    existing?.status === 'active' && existing.expiresAt > now
      ? existing.expiresAt
      : now
  const created: LearnCanalMemberSubscription = {
    id: createId(),
    canalId: canal.id,
    canalName: canal.name,
    ownerHandle: canal.ownerHandle,
    memberHandle: handle,
    planId: plan.id,
    planName: plan.name,
    amountPaid: price,
    startedAt: now,
    expiresAt: baseStart + plan.durationDays * 86_400_000,
    status: 'active',
    paymentRef: input.paymentRef,
  }
  const s = load()
  commit({
    ...s,
    memberSubscriptions: [
      created,
      ...s.memberSubscriptions.map((x) =>
        x.canalId === canal.id &&
        x.memberHandle.toLowerCase() === handle.toLowerCase() &&
        x.status === 'active'
          ? { ...x, status: 'expired' as const }
          : x,
      ),
    ],
  })
  return created
}

export function listCanalMemberSubscribers(
  canalId: string,
): LearnCanalMemberSubscription[] {
  refreshMemberStatuses(Date.now())
  return load()
    .memberSubscriptions.filter(
      (s) => s.canalId === canalId && s.status === 'active',
    )
    .sort((a, b) => b.startedAt - a.startedAt)
}

/** Abonnements visiteurs actifs du compte connecté (autres canaux). */
export function listMemberCanalSubscriptions(
  memberHandle: string,
): LearnCanalMemberSubscription[] {
  refreshMemberStatuses(Date.now())
  const handle = memberHandle.replace(/^@/, '').toLowerCase()
  const now = Date.now()
  return load()
    .memberSubscriptions.filter(
      (s) =>
        s.memberHandle.toLowerCase() === handle &&
        s.status === 'active' &&
        s.expiresAt > now,
    )
    .sort((a, b) => b.expiresAt - a.expiresAt)
}

export function canManageCanal(ownerHandle: string, now = Date.now()): boolean {
  refreshSubscriptionStatuses(now)
  const sub = getOwnerCanalSubscription(ownerHandle)
  return Boolean(sub && sub.status === 'active' && sub.expiresAt > now)
}

export function listSellerProducts(sellerHandle: string): LearnEduProduct[] {
  const handle = sellerHandle.replace(/^@/, '').toLowerCase()
  return load()
    .products.filter((p) => p.sellerHandle.toLowerCase() === handle)
    .sort((a, b) => b.updatedAt - a.updatedAt)
}

export function listPublishedProducts(): LearnEduProduct[] {
  return load()
    .products.filter((p) => p.status === 'published')
    .sort((a, b) => b.updatedAt - a.updatedAt)
}

export function findEduProduct(id: string | undefined): LearnEduProduct | undefined {
  if (!id) return undefined
  return load().products.find((p) => p.id === id)
}

export function saveEduProduct(
  input: Omit<LearnEduProduct, 'id' | 'createdAt' | 'updatedAt'> & { id?: string },
  now = Date.now(),
): LearnEduProduct {
  const s = load()
  if (input.id) {
    const existing = s.products.find((p) => p.id === input.id)
    if (existing) {
      const next: LearnEduProduct = {
        ...existing,
        ...input,
        id: existing.id,
        createdAt: existing.createdAt,
        updatedAt: now,
      }
      commit({
        ...s,
        products: s.products.map((p) => (p.id === existing.id ? next : p)),
      })
      return next
    }
  }
  const created: LearnEduProduct = {
    ...input,
    id: createId(),
    sellerHandle: input.sellerHandle.replace(/^@/, ''),
    createdAt: now,
    updatedAt: now,
  }
  commit({ ...s, products: [created, ...s.products] })
  return created
}

export function setEduProductStatus(
  id: string,
  status: LearnEduProduct['status'],
  now = Date.now(),
) {
  const s = load()
  commit({
    ...s,
    products: s.products.map((p) =>
      p.id === id ? { ...p, status, updatedAt: now } : p,
    ),
  })
}

/** Enregistre une vente après paiement Wallet (commission séparée des abonnements). */
export function recordEduSale(input: {
  product: LearnEduProduct
  buyerHandle: string
  buyerName: string
  ticketId?: string
  walletPaymentId?: string
  now?: number
}): LearnEduSale {
  const now = input.now ?? Date.now()
  const platformFee = Math.round(input.product.price * LEARN_EDU_PLATFORM_FEE_RATE)
  const sellerNet = Math.max(0, input.product.price - platformFee)
  const sale: LearnEduSale = {
    id: createId(),
    productId: input.product.id,
    productName: input.product.name,
    sellerHandle: input.product.sellerHandle,
    buyerHandle: input.buyerHandle.replace(/^@/, ''),
    buyerName: input.buyerName,
    price: input.product.price,
    platformFee,
    sellerNet,
    ...(input.ticketId ? { ticketId: input.ticketId } : {}),
    ...(input.walletPaymentId ? { walletPaymentId: input.walletPaymentId } : {}),
    createdAt: now,
  }
  const access: LearnEduPurchaseAccess = {
    id: createId(),
    productId: input.product.id,
    buyerHandle: sale.buyerHandle,
    saleId: sale.id,
    ...(input.ticketId ? { ticketId: input.ticketId } : {}),
    grantedAt: now,
  }
  const s = load()
  let products = s.products
  if (
    input.product.delivery !== 'download' &&
    input.product.delivery !== 'online' &&
    typeof input.product.stock === 'number' &&
    input.product.stock > 0
  ) {
    products = s.products.map((p) =>
      p.id === input.product.id
        ? { ...p, stock: Math.max(0, (p.stock ?? 0) - 1), updatedAt: now }
        : p,
    )
  }
  commit({
    ...s,
    products,
    sales: [sale, ...s.sales],
    accesses: [access, ...s.accesses],
  })
  return sale
}

export function listSellerSales(sellerHandle: string): LearnEduSale[] {
  const handle = sellerHandle.replace(/^@/, '').toLowerCase()
  return load()
    .sales.filter((x) => x.sellerHandle.toLowerCase() === handle)
    .sort((a, b) => b.createdAt - a.createdAt)
}

export function listBuyerAccesses(buyerHandle: string): LearnEduPurchaseAccess[] {
  const handle = buyerHandle.replace(/^@/, '').toLowerCase()
  return load()
    .accesses.filter((a) => a.buyerHandle.toLowerCase() === handle)
    .sort((a, b) => b.grantedAt - a.grantedAt)
}

export function buyerHasAccess(buyerHandle: string, productId: string): boolean {
  const handle = buyerHandle.replace(/^@/, '').toLowerCase()
  return load().accesses.some(
    (a) => a.buyerHandle.toLowerCase() === handle && a.productId === productId,
  )
}

export function sellerFinanceSummary(sellerHandle: string): {
  salesTotal: number
  feesTotal: number
  netTotal: number
  salesCount: number
} {
  const sales = listSellerSales(sellerHandle)
  return {
    salesCount: sales.length,
    salesTotal: sales.reduce((s, x) => s + x.price, 0),
    feesTotal: sales.reduce((s, x) => s + x.platformFee, 0),
    netTotal: sales.reduce((s, x) => s + x.sellerNet, 0),
  }
}
