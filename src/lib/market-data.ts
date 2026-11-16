/**
 * Lecture Creator Market : placeholders + positions / coins locaux.
 */
import { getLocalCoinPositions } from '@/lib/coin-positions-store'
import { getLocalMarketPositions } from '@/lib/market-positions-store'
import {
  TEMP_COIN_EVENTS,
  TEMP_COIN_POSITIONS,
  getTempCoinEvent,
} from '@/lib/placeholder-coin-markets'
import {
  TEMP_MARKETS,
  TEMP_POSITIONS,
  getTempMarket,
} from '@/lib/placeholder-markets'
import type { CoinEvent, CoinPosition } from '@/types/coin-market'
import type { CreatorMarket, UserPosition } from '@/types/market'

function mergeById<T extends { id: string }>(
  local: readonly T[],
  temp: readonly T[],
): T[] {
  const seen = new Set(local.map((item) => item.id))
  return [...local, ...temp.filter((item) => !seen.has(item.id))]
}

export function getMarketPositions(marketId?: string): readonly UserPosition[] {
  const all = mergeById(getLocalMarketPositions(), TEMP_POSITIONS)
  return marketId ? all.filter((item) => item.marketId === marketId) : all
}

export function getCoinPositions(eventId?: string): readonly CoinPosition[] {
  const all = mergeById(getLocalCoinPositions(), TEMP_COIN_POSITIONS)
  return eventId ? all.filter((item) => item.eventId === eventId) : all
}

export function resolveFactorMarket(id: string | undefined): CreatorMarket | undefined {
  return getTempMarket(id) ?? TEMP_MARKETS.find((market) => market.id === id)
}

export function resolveCoinEvent(id: string | undefined): CoinEvent | undefined {
  return getTempCoinEvent(id) ?? TEMP_COIN_EVENTS.find((event) => event.id === id)
}
