/**
 * Positions Cotes (OUI / NON) prises sur cet appareil (démonstration).
 * Le serveur calculera valeur théorique, net et payable ; ici on enregistre la mise.
 */
import { createLocalStore } from '@/lib/local-store'
import { createId } from '@/lib/ids'
import type { MarketPosition, UserPosition } from '@/types/market'

function isPosition(value: unknown): value is UserPosition {
  if (typeof value !== 'object' || value === null) return false
  const v = value as Record<string, unknown>
  return (
    typeof v.id === 'string' &&
    typeof v.marketId === 'string' &&
    (v.side === 'yes' || v.side === 'no') &&
    typeof v.stake === 'number'
  )
}

export const marketPositionsStore = createLocalStore<readonly UserPosition[]>(
  'africonnect.market-positions.v1',
  (raw) => (Array.isArray(raw) ? raw.filter(isPosition) : []),
)

export function getLocalMarketPositions(): readonly UserPosition[] {
  return marketPositionsStore.get()
}

export function getLocalMarketPositionsFor(marketId: string): readonly UserPosition[] {
  return marketPositionsStore.get().filter((position) => position.marketId === marketId)
}

/** Enregistre une position après paiement Wallet (démo). */
export function addLocalMarketPosition(input: {
  marketId: string
  side: MarketPosition
  stake: number
  entryCote: number
}): UserPosition {
  const stake = Math.max(1, Math.floor(input.stake))
  const position: UserPosition = {
    id: createId(),
    marketId: input.marketId,
    side: input.side,
    stake,
    entryCote: input.entryCote,
    theoreticalValue: stake,
    latent: 0,
    netValue: stake,
    payableNow: stake,
  }
  marketPositionsStore.set([position, ...marketPositionsStore.get()])
  return position
}

/** Retire une position locale après retrait Wallet (démo). */
export function removeLocalMarketPosition(positionId: string): boolean {
  const list = marketPositionsStore.get()
  const next = list.filter((position) => position.id !== positionId)
  if (next.length === list.length) return false
  marketPositionsStore.set(next)
  return true
}

export const subscribeMarketPositions = marketPositionsStore.subscribe
