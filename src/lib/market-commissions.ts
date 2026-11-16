/**
 * Commissions Creator Market (cotes OUI/NON et coins).
 * Créateur 2 % · plateforme 3 % — sur le volume collecté (mises / achats).
 */

export const MARKET_CREATOR_COMMISSION_RATE = 0.02
export const MARKET_PLATFORM_COMMISSION_RATE = 0.03

export function marketCreatorCommission(collected: number): number {
  return Math.floor(Math.max(0, collected) * MARKET_CREATOR_COMMISSION_RATE)
}

export function marketPlatformCommission(collected: number): number {
  return Math.floor(Math.max(0, collected) * MARKET_PLATFORM_COMMISSION_RATE)
}
