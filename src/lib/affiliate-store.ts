/**
 * STOCKAGE TEMPORAIRE — programmes d’affiliation Espace Pro.
 * À remplacer par l’API. Aucune migration DB.
 */
import {
  buildVendorStatsFromMembers,
  createDemoMemberships,
  createDemoProgramForService,
  TEMP_AFFILIATE_MEMBERSHIPS,
  TEMP_AFFILIATE_PROGRAMS,
} from '@/lib/placeholder-affiliate'
import {
  AFRICONNECT_AFFILIATE_PLATFORM_RATE,
  isAffiliateRateValid,
} from '@/lib/affiliate-labels'
import { createId } from '@/lib/ids'
import { paths } from '@/routes/paths'
import type {
  AffiliateMembership,
  AffiliateMembershipStatus,
  AffiliateProgram,
  AffiliateProgramStatus,
  AffiliateVendorStats,
} from '@/types/affiliate'

const STORAGE_KEY = 'africonnect.affiliate.v1'
const DEMO_SEEDED_KEY = 'africonnect.affiliate.demo-seeded.v1'

type Listener = () => void

interface AffiliateState {
  programs: Record<string, AffiliateProgram>
  memberships: Record<string, AffiliateMembership>
  removedPrograms: string[]
  /** Dernière attribution par serviceId (last-click, 30 j). */
  attributions: Record<string, { refCode: string; at: number }>
}

let state: AffiliateState | null = null
let programList: readonly AffiliateProgram[] | null = null
let membershipList: readonly AffiliateMembership[] | null = null
const listeners = new Set<Listener>()

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function load(): AffiliateState {
  if (state) return state
  state = { programs: {}, memberships: {}, removedPrograms: [], attributions: {} }
  try {
    const parsed: unknown = JSON.parse(
      window.localStorage.getItem(STORAGE_KEY) ?? 'null',
    )
    if (!isRecord(parsed)) return state
    if (isRecord(parsed.programs)) {
      for (const [id, value] of Object.entries(parsed.programs)) {
        if (isRecord(value) && typeof value.name === 'string') {
          state.programs[id] = value as unknown as AffiliateProgram
        }
      }
    }
    if (isRecord(parsed.memberships)) {
      for (const [id, value] of Object.entries(parsed.memberships)) {
        if (isRecord(value) && typeof value.refCode === 'string') {
          state.memberships[id] = value as unknown as AffiliateMembership
        }
      }
    }
    if (Array.isArray(parsed.removedPrograms)) {
      state.removedPrograms = parsed.removedPrograms.filter(
        (id): id is string => typeof id === 'string',
      )
    }
    if (isRecord(parsed.attributions)) {
      for (const [serviceId, value] of Object.entries(parsed.attributions)) {
        if (
          isRecord(value) &&
          typeof value.refCode === 'string' &&
          typeof value.at === 'number'
        ) {
          state.attributions[serviceId] = {
            refCode: value.refCode,
            at: value.at,
          }
        }
      }
    }
  } catch {
    // ignore
  }
  return state
}

function commit(next: AffiliateState) {
  state = next
  programList = null
  membershipList = null
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  } catch {
    // quota
  }
  listeners.forEach((l) => l())
}

export function subscribeAffiliate(listener: Listener): () => void {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

function normalizeProgram(raw: AffiliateProgram): AffiliateProgram {
  const targetKind =
    raw.targetKind === 'product' && raw.productId ? 'product' : 'service'
  return {
    ...raw,
    targetKind,
    ...(targetKind === 'product' && raw.productId
      ? { productId: raw.productId }
      : {}),
  }
}

export function getAffiliatePrograms(): readonly AffiliateProgram[] {
  if (programList) return programList
  const current = load()
  const byId = new Map<string, AffiliateProgram>()
  for (const p of TEMP_AFFILIATE_PROGRAMS) {
    if (!current.removedPrograms.includes(p.id)) byId.set(p.id, normalizeProgram(p))
  }
  for (const [id, p] of Object.entries(current.programs)) {
    if (!current.removedPrograms.includes(id)) byId.set(id, normalizeProgram(p))
  }
  programList = [...byId.values()].sort((a, b) => b.updatedAt - a.updatedAt)
  return programList
}

export function getAffiliateMemberships(): readonly AffiliateMembership[] {
  if (membershipList) return membershipList
  const current = load()
  const byId = new Map<string, AffiliateMembership>()
  for (const m of TEMP_AFFILIATE_MEMBERSHIPS) byId.set(m.id, m)
  for (const [id, m] of Object.entries(current.memberships)) byId.set(id, m)
  membershipList = [...byId.values()].sort((a, b) => b.joinedAt - a.joinedAt)
  return membershipList
}

export function getProgramsForService(
  serviceId: string,
): readonly AffiliateProgram[] {
  return getAffiliatePrograms().filter((p) => p.serviceId === serviceId)
}

export function getProgramById(id: string): AffiliateProgram | undefined {
  return getAffiliatePrograms().find((p) => p.id === id)
}

export function getMembershipsForProgram(
  programId: string,
): readonly AffiliateMembership[] {
  return getAffiliateMemberships().filter((m) => m.programId === programId)
}

export function getVendorStatsForProgram(
  programId: string,
): AffiliateVendorStats {
  return buildVendorStatsFromMembers(getMembershipsForProgram(programId))
}

/** Premier affichage Espace Pro : seed démo si aucun programme pour ce service. */
export function ensureDemoAffiliateProgram(serviceId: string): void {
  try {
    const seeded = JSON.parse(
      window.localStorage.getItem(DEMO_SEEDED_KEY) ?? '{}',
    ) as Record<string, boolean>
    if (seeded[serviceId]) return
    if (getProgramsForService(serviceId).length > 0) {
      window.localStorage.setItem(
        DEMO_SEEDED_KEY,
        JSON.stringify({ ...seeded, [serviceId]: true }),
      )
      return
    }
    const program = createDemoProgramForService(serviceId)
    const members = createDemoMemberships(program)
    const current = load()
    const memberships = { ...current.memberships }
    for (const m of members) memberships[m.id] = m
    commit({
      ...current,
      programs: { ...current.programs, [program.id]: program },
      memberships,
    })
    window.localStorage.setItem(
      DEMO_SEEDED_KEY,
      JSON.stringify({ ...seeded, [serviceId]: true }),
    )
  } catch {
    // ignore
  }
}

export type AffiliateProgramInput = Omit<
  AffiliateProgram,
  'id' | 'createdAt' | 'updatedAt' | 'platformRate' | 'status'
> & { status?: AffiliateProgramStatus }

export function saveAffiliateProgram(
  input: AffiliateProgramInput,
  id?: string,
  now = Date.now(),
): AffiliateProgram {
  if (!isAffiliateRateValid(input.affiliateRate)) {
    throw new Error('Taux affilié invalide ou supérieur au montant distribuable.')
  }
  const current = load()
  const existing = id
    ? current.programs[id] ?? TEMP_AFFILIATE_PROGRAMS.find((p) => p.id === id)
    : undefined
  const targetKind =
    input.targetKind === 'product' && input.productId ? 'product' : 'service'
  if (targetKind === 'product' && !input.productId?.trim()) {
    throw new Error('Choisissez le produit concerné par le programme.')
  }
  const program: AffiliateProgram = {
    id: existing?.id ?? createId(),
    serviceId: input.serviceId,
    name: input.name.trim(),
    description: input.description.trim(),
    collaboration: input.collaboration.trim(),
    objective: input.objective.trim(),
    ...(input.imageSrc ? { imageSrc: input.imageSrc } : {}),
    targetKind,
    ...(targetKind === 'product' && input.productId
      ? { productId: input.productId.trim() }
      : {}),
    affiliateRate: input.affiliateRate,
    platformRate: AFRICONNECT_AFFILIATE_PLATFORM_RATE,
    commissionBase: input.commissionBase.trim(),
    excludedFees: input.excludedFees.trim(),
    audience: input.audience,
    specialConditions: input.specialConditions.trim(),
    promotionRules: input.promotionRules.trim(),
    fraudRules: input.fraudRules.trim(),
    startsAt: input.startsAt,
    ...(input.endsAt !== undefined ? { endsAt: input.endsAt } : {}),
    status: input.status ?? existing?.status ?? 'draft',
    showParticipantCount: input.showParticipantCount,
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
  }
  commit({
    ...current,
    programs: { ...current.programs, [program.id]: program },
    removedPrograms: current.removedPrograms.filter((x) => x !== program.id),
  })
  return program
}

export function setAffiliateProgramStatus(
  id: string,
  status: AffiliateProgramStatus,
  now = Date.now(),
): AffiliateProgram | undefined {
  const program = getProgramById(id)
  if (!program) return undefined
  return saveAffiliateProgram({ ...program, status }, id, now)
}

export function setMembershipStatus(
  id: string,
  status: AffiliateMembershipStatus,
  now = Date.now(),
): AffiliateMembership | undefined {
  const current = load()
  const base =
    current.memberships[id] ??
    TEMP_AFFILIATE_MEMBERSHIPS.find((m) => m.id === id) ??
    getAffiliateMemberships().find((m) => m.id === id)
  if (!base) return undefined
  const next: AffiliateMembership = { ...base, status, updatedAt: now }
  commit({
    ...current,
    memberships: { ...current.memberships, [id]: next },
  })
  return next
}

const ATTR_TTL_MS = 30 * 86_400_000

export function getPublishedPrograms(): readonly AffiliateProgram[] {
  return getAffiliatePrograms().filter((p) => p.status === 'published')
}

export function getPublishedProgramsForService(
  serviceId: string,
): readonly AffiliateProgram[] {
  return getProgramsForService(serviceId).filter((p) => p.status === 'published')
}

export function getMembershipForAffiliate(
  programId: string,
  affiliateHandle: string,
): AffiliateMembership | undefined {
  const handle = affiliateHandle.replace(/^@/, '')
  return getAffiliateMemberships().find(
    (m) => m.programId === programId && m.affiliateHandle === handle,
  )
}

export function getMembershipsForAffiliate(
  affiliateHandle: string,
): readonly AffiliateMembership[] {
  const handle = affiliateHandle.replace(/^@/, '')
  return getAffiliateMemberships().filter((m) => m.affiliateHandle === handle)
}

function makeRefCode(handle: string): string {
  const base = handle.replace(/[^a-zA-Z0-9]/g, '').slice(0, 6).toUpperCase() || 'USR'
  return `AFF-${base}${String(Date.now()).slice(-4)}`
}

/**
 * Adhésion immédiate : pas de candidature.
 * Un seul partenariat par utilisateur et par programme.
 */
export function joinAffiliateProgram(
  programId: string,
  affiliate: { handle: string; name: string; avatarSrc?: string },
  now = Date.now(),
): AffiliateMembership {
  const program = getProgramById(programId)
  if (!program || program.status !== 'published') {
    throw new Error('Ce programme n’est pas disponible.')
  }
  const handle = affiliate.handle.replace(/^@/, '')
  const existing = getMembershipForAffiliate(programId, handle)
  if (existing) return existing

  const membership: AffiliateMembership = {
    id: createId(),
    programId: program.id,
    serviceId: program.serviceId,
    affiliateHandle: handle,
    affiliateName: affiliate.name.trim(),
    ...(affiliate.avatarSrc ? { affiliateAvatar: affiliate.avatarSrc } : {}),
    refCode: makeRefCode(handle),
    status: 'active',
    joinedAt: now,
    clicks: 0,
    customers: 0,
    orders: 0,
    salesAmount: 0,
    commissionsAmount: 0,
    updatedAt: now,
  }
  const current = load()
  commit({
    ...current,
    memberships: { ...current.memberships, [membership.id]: membership },
  })
  return membership
}

/** Enregistre un clic d’affiliation (last-click, fenêtre 30 jours). */
export function recordAffiliateClick(
  refCode: string,
  now = Date.now(),
): AffiliateMembership | undefined {
  const member = getAffiliateMemberships().find((m) => m.refCode === refCode)
  if (!member || member.status !== 'active') return undefined
  const current = load()
  const nextMember: AffiliateMembership = {
    ...member,
    clicks: member.clicks + 1,
    updatedAt: now,
  }
  commit({
    ...current,
    memberships: { ...current.memberships, [member.id]: nextMember },
    attributions: {
      ...current.attributions,
      [member.serviceId]: { refCode, at: now },
    },
  })
  return nextMember
}

/** Attribution encore valide pour un vendeur (30 jours). */
export function getActiveAttribution(
  serviceId: string,
  now = Date.now(),
): { refCode: string; at: number } | undefined {
  const current = load()
  const hit = current.attributions[serviceId]
  if (!hit) return undefined
  if (now - hit.at > ATTR_TTL_MS) return undefined
  return hit
}

/**
 * Lien personnel affilié selon la cible du programme :
 * - service → page publique de l’établissement
 * - product → fiche produit + ouverture directe du paiement (`payer=1`)
 */
export function buildAffiliateLink(
  establishmentRef: string,
  refCode: string,
  program?: Pick<AffiliateProgram, 'targetKind' | 'productId'> | null,
): string {
  const aff = `aff=${encodeURIComponent(refCode)}`
  if (program?.targetKind === 'product' && program.productId) {
    return `${paths.product(program.productId)}?${aff}&payer=1`
  }
  return `${paths.establishment(establishmentRef)}?${aff}`
}

/** Après un paiement commercial confirmé : crédite l’affilié last-click (30 j). */
export function applyAffiliateSale(
  serviceId: string,
  amount: number,
  now = Date.now(),
): AffiliateMembership | undefined {
  if (amount <= 0) return undefined
  const attr = getActiveAttribution(serviceId, now)
  if (!attr) return undefined
  const member = getAffiliateMemberships().find(
    (m) => m.refCode === attr.refCode && m.status === 'active',
  )
  if (!member || member.serviceId !== serviceId) return undefined
  const program = getProgramById(member.programId)
  if (!program || program.status !== 'published') return undefined
  const commission = Math.round(amount * program.affiliateRate)
  const nextMember: AffiliateMembership = {
    ...member,
    customers: member.customers + 1,
    orders: member.orders + 1,
    salesAmount: member.salesAmount + amount,
    commissionsAmount: member.commissionsAmount + commission,
    updatedAt: now,
  }
  const current = load()
  commit({
    ...current,
    memberships: { ...current.memberships, [member.id]: nextMember },
  })
  return nextMember
}
