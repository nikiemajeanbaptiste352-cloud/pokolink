import { useMemo, useSyncExternalStore } from 'react'

import { useLocalStore } from '@/hooks/use-local-store'
import {
  DEMO_PAYMENT_WALLET_FCFA,
  demoBalancesStore,
} from '@/lib/demo-balances-store'
import { TEMP_BALANCES } from '@/lib/placeholder-wallet'
import { getWalletPayments, subscribeWalletPayments } from '@/lib/wallet-payments-store'
import type { WalletBalances, WalletPaymentRequest } from '@/types/wallet'

/**
 * Soldes du Wallet : placeholder + overlay démo local après paiements sur l’appareil.
 * Défaut maquette paiement : 40 000 FCFA. Le serveur restera la source de vérité.
 */
export function useWalletBalances(): WalletBalances {
  const demo = useLocalStore(demoBalancesStore)
  return useMemo(() => {
    const available = demo.walletFcfa ?? DEMO_PAYMENT_WALLET_FCFA
    const reserved = TEMP_BALANCES.reserved
    return {
      available,
      reserved,
      total: available + reserved,
    }
  }, [demo])
}

/** Demandes de paiement interne envoyées depuis cet appareil, de la plus récente à la plus ancienne. */
export function useWalletPayments(): readonly WalletPaymentRequest[] {
  return useSyncExternalStore(subscribeWalletPayments, getWalletPayments)
}
