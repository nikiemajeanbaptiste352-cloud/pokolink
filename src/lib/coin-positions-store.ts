/**
 * Coins achetés sur cet appareil (démonstration).
 * Indice, valeur et payable viennent du serveur ; ici on enregistre l’achat local.
 */
import { createLocalStore } from '@/lib/local-store'
import { createId } from '@/lib/ids'
import type { CoinPosition } from '@/types/coin-market'

function isPosition(value: unknown): value is CoinPosition {
  if (typeof value !== 'object' || value === null) return false
  const v = value as Record<string, unknown>
  return (
    typeof v.id === 'string' &&
    typeof v.eventId === 'string' &&
    typeof v.coins === 'number' &&
    typeof v.spent === 'number'
  )
}

export const coinPositionsStore = createLocalStore<readonly CoinPosition[]>(
  'africonnect.coin-positions.v1',
  (raw) => (Array.isArray(raw) ? raw.filter(isPosition) : []),
)

export function getLocalCoinPositions(): readonly CoinPosition[] {
  return coinPositionsStore.get()
}

export function getLocalCoinPositionsFor(eventId: string): readonly CoinPosition[] {
  return coinPositionsStore.get().filter((position) => position.eventId === eventId)
}

/** Enregistre un achat de coins après paiement Wallet (démo). */
export function addLocalCoinPosition(input: {
  eventId: string
  coins: number
  spent: number
  /** Valeur théorique unitaire au moment de l’achat (souvent = prix). */
  unitValue: number
}): CoinPosition {
  const coins = Math.max(1, Math.floor(input.coins))
  const spent = Math.max(1, Math.floor(input.spent))
  const theoreticalValue = Math.floor(coins * input.unitValue)
  const position: CoinPosition = {
    id: createId(),
    eventId: input.eventId,
    coins,
    spent,
    theoreticalValue,
    payableNow: theoreticalValue,
    pendingCoins: 0,
    pendingAmount: 0,
    withdrawnCoins: 0,
    withdrawnAmount: 0,
  }
  const existing = coinPositionsStore.get()
  // Fusionne avec une position existante sur le même événement (même détenteur démo).
  const prior = existing.find((item) => item.eventId === input.eventId)
  if (prior) {
    const merged: CoinPosition = {
      ...prior,
      coins: prior.coins + coins,
      spent: prior.spent + spent,
      theoreticalValue: prior.theoreticalValue + theoreticalValue,
      payableNow: prior.payableNow + theoreticalValue,
    }
    coinPositionsStore.set([
      merged,
      ...existing.filter((item) => item.id !== prior.id),
    ])
    return merged
  }
  coinPositionsStore.set([position, ...existing])
  return position
}

/** Retire une position coins locale après retrait Wallet (démo). */
export function removeLocalCoinPosition(positionId: string): boolean {
  const list = coinPositionsStore.get()
  const next = list.filter((position) => position.id !== positionId)
  if (next.length === list.length) return false
  coinPositionsStore.set(next)
  return true
}

export const subscribeCoinPositions = coinPositionsStore.subscribe
