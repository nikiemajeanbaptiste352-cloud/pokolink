/**
 * Crédits Rewards démo liés aux actions de l’app (paiement, participation, mission pub).
 * Attribution immédiate côté maquette : solde + ligne EARN confirmée.
 * Le serveur restera la source de vérité en production.
 */
import {
  demoBalancesStore,
  getDemoRewardsAvailable,
} from '@/lib/demo-balances-store'
import { createLocalStore } from '@/lib/local-store'
import type { RewardsOperation } from '@/types/rewards'

export interface RewardsEarnInput {
  /** Clé d’idempotence (ex. `pay:ticket-1`, `event:evt-1`, `ad:mission-1:2026-03-14`). */
  key: string
  points: number
  title: string
  detail?: string
}

interface EarnLedger {
  keys: readonly string[]
  operations: readonly RewardsOperation[]
}

function isOperation(value: unknown): value is RewardsOperation {
  if (typeof value !== 'object' || value === null) return false
  const v = value as Record<string, unknown>
  return (
    typeof v.id === 'string' &&
    typeof v.reference === 'string' &&
    v.kind === 'EARN' &&
    typeof v.points === 'number' &&
    typeof v.title === 'string' &&
    typeof v.at === 'number' &&
    v.status === 'confirmed'
  )
}

function parseLedger(raw: unknown): EarnLedger {
  if (typeof raw !== 'object' || raw === null) return { keys: [], operations: [] }
  const v = raw as Record<string, unknown>
  const keys = Array.isArray(v.keys)
    ? v.keys.filter((k): k is string => typeof k === 'string')
    : []
  const operations = Array.isArray(v.operations) ? v.operations.filter(isOperation) : []
  return { keys, operations }
}

export const rewardsEarnStore = createLocalStore<EarnLedger>(
  'africonnect.rewards-earn.v1',
  parseLedger,
)

export function hasRewardsEarn(key: string): boolean {
  return rewardsEarnStore.get().keys.includes(key)
}

export function getRewardsEarnOperations(): readonly RewardsOperation[] {
  return rewardsEarnStore.get().operations
}

/** Jour civil local, pour plafonds missions (une fois / jour / mission). */
export function rewardsEarnDayKey(now: number): string {
  const d = new Date(now)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

/**
 * Crédite immédiatement les points (démo) et journalise une opération EARN confirmée.
 * Sans effet si la clé a déjà été créditée.
 */
export function creditRewardsEarn(
  input: RewardsEarnInput,
  now: number,
): RewardsOperation | null {
  const points = Math.max(0, Math.floor(input.points))
  if (points <= 0) return null
  if (hasRewardsEarn(input.key)) return null

  const available = getDemoRewardsAvailable()
  demoBalancesStore.set({
    ...demoBalancesStore.get(),
    rewardsPoints: available + points,
  })

  const operation: RewardsOperation = {
    id: `earn-${input.key}-${now}`,
    reference: `RW-DEMO-${String(now).slice(-8)}`,
    kind: 'EARN',
    points,
    title: input.title,
    detail: input.detail ?? 'Crédit immédiat · démonstration',
    at: now,
    status: 'confirmed',
  }

  const ledger = rewardsEarnStore.get()
  rewardsEarnStore.set({
    keys: [input.key, ...ledger.keys].slice(0, 200),
    operations: [operation, ...ledger.operations].slice(0, 100),
  })
  return operation
}

/** Points gagnés après un paiement Wallet (démo) : ~1 pt pour 20 FCFA, mini 25. */
export function earnPointsForPayment(fcfaPaid: number): number {
  return Math.max(25, Math.floor(Math.max(0, fcfaPaid) / 20))
}

/** Points pour une participation Market Event (démo). */
export function earnPointsForParticipation(fcfaPaid: number): number {
  if (fcfaPaid <= 0) return 50
  return Math.max(75, Math.floor(fcfaPaid / 15))
}
