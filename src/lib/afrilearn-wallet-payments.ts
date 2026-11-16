import type { WalletPaymentRequest } from '@/types/wallet'

/**
 * Préfixes `beneficiaryServiceId` posés par les pages AfriLearn
 * (`WalletPaymentForm` → serviceId) — repli pour paiements sans `domain`.
 */
const LEARN_SERVICE_PREFIXES = [
  'learn-canal-member-',
  'learn-edu-',
  'africonnect-learn-',
] as const

/** Paiement Wallet rattaché au module AfriLearn (canal / produit), pas au titre. */
export function isAfriLearnWalletPayment(
  payment: Pick<
    WalletPaymentRequest,
    'beneficiaryServiceId' | 'purpose' | 'domain'
  >,
): boolean {
  if (payment.domain === 'afrilearn') return true
  const id = payment.beneficiaryServiceId ?? ''
  if (!LEARN_SERVICE_PREFIXES.some((p) => id.startsWith(p))) return false
  return payment.purpose === 'subscription' || payment.purpose === 'purchase'
}
