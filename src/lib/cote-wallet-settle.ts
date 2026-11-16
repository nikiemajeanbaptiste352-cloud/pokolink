/**
 * Règlement Wallet démo pour les Cotes / Coins :
 * - mise / achat : déjà débités via WalletPaymentForm → applyDemoPayment
 * - retrait de position : crédit Wallet + clôture locale
 */
import { removeLocalCoinPosition } from '@/lib/coin-positions-store'
import { applyDemoCredit } from '@/lib/demo-balances-store'
import { formatPrice } from '@/lib/format'
import { removeLocalMarketPosition } from '@/lib/market-positions-store'
import { addWalletPayment } from '@/lib/wallet-payments-store'
import {
  requestWithdrawal,
  withdrawRequestsStore,
} from '@/lib/withdraw-requests-store'
import type { CoinPosition } from '@/types/coin-market'
import type { UserPosition } from '@/types/market'

export type CoteSettleResult =
  | { ok: true; credited: number }
  | { ok: false; reason: 'already' | 'unavailable' }

function alreadyRequested(positionId: string): boolean {
  return withdrawRequestsStore.get().includes(positionId)
}

/**
 * Retrait position Cotes (OUI/NON) : crédite `payableNow` sur le Wallet.
 */
export function settleCoteWithdrawal(
  position: UserPosition,
  meta: { creatorHandle: string; sideLabel: string },
  now = Date.now(),
): CoteSettleResult {
  if (alreadyRequested(position.id)) return { ok: false, reason: 'already' }
  const amount = Math.max(0, Math.floor(position.payableNow))
  if (amount <= 0) return { ok: false, reason: 'unavailable' }

  const credited = applyDemoCredit(amount)
  requestWithdrawal(position.id)
  removeLocalMarketPosition(position.id)

  addWalletPayment(
    {
      purpose: 'position',
      title: `Retrait position ${meta.sideLabel} · @${meta.creatorHandle}`,
      detail: `Crédit Wallet · ${formatPrice(credited)} (démo)`,
      amount: credited,
      recipient: 'Mon Wallet AfriConnect',
      beneficiaryName: 'Mon Wallet',
      beneficiaryHandle: 'moi',
      beneficiaryBusiness: 'Creator Market · retrait',
    },
    now,
  )

  return { ok: true, credited }
}

/**
 * Retrait coins : crédite `payableNow` sur le Wallet.
 */
export function settleCoinWithdrawal(
  position: CoinPosition,
  meta: { creatorHandle: string },
  now = Date.now(),
): CoteSettleResult {
  if (alreadyRequested(position.id)) return { ok: false, reason: 'already' }
  const amount = Math.max(0, Math.floor(position.payableNow))
  if (amount <= 0) return { ok: false, reason: 'unavailable' }

  const credited = applyDemoCredit(amount)
  requestWithdrawal(position.id)
  removeLocalCoinPosition(position.id)

  addWalletPayment(
    {
      purpose: 'coins',
      title: `Retrait coins · @${meta.creatorHandle}`,
      detail: `Crédit Wallet · ${formatPrice(credited)} (démo)`,
      amount: credited,
      recipient: 'Mon Wallet AfriConnect',
      beneficiaryName: 'Mon Wallet',
      beneficiaryHandle: 'moi',
      beneficiaryBusiness: 'Creator Market · coins',
    },
    now,
  )

  return { ok: true, credited }
}
