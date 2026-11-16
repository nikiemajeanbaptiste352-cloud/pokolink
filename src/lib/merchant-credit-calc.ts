import type { DemoPaymentOrderLine } from '@/lib/demo-payment-order'

/** Montant éligible au crédit commerçant (somme des lignes autorisées). */
export function creditEligibleAmount(
  lines: readonly DemoPaymentOrderLine[],
  fallbackTotal: number,
  allowCreditFallback = false,
): number {
  if (lines.length === 0) {
    return allowCreditFallback ? Math.max(0, fallbackTotal) : 0
  }
  return lines.reduce((sum, line) => {
    if (!line.allowMerchantCredit) return sum
    return sum + line.unitPrice * line.quantity
  }, 0)
}

/**
 * Répartit un montant reporté sur les lignes éligibles uniquement.
 * Le reste (articles sans crédit) doit être payé immédiatement.
 */
export function clampDeferredCredit(
  deferred: number,
  eligible: number,
  orderTotal: number,
): number {
  const max = Math.min(Math.max(0, eligible), Math.max(0, orderTotal))
  return Math.min(Math.max(0, Math.floor(deferred)), max)
}
