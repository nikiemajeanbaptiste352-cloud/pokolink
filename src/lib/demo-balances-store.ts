/**
 * Soldes démo locaux (Wallet FCFA + Rewards) pour le parcours d’achat.
 * Overlay sur les placeholders : le serveur restera la source de vérité.
 *
 * Valeurs initiales alignées sur la maquette paiement :
 * Wallet 40 000 FCFA · Rewards 2 500 pts · 10 pts = 1 FCFA.
 */
import { createLocalStore } from '@/lib/local-store'

export interface DemoBalances {
  /** Solde Wallet FCFA ; absent = défaut maquette. */
  walletFcfa?: number
  /** Points Rewards ; absent = défaut maquette. */
  rewardsPoints?: number
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

/** Soldes de démonstration de la maquette de paiement. */
export const DEMO_PAYMENT_WALLET_FCFA = 40_000
export const DEMO_PAYMENT_REWARDS_POINTS = 2_500

export const demoBalancesStore = createLocalStore<DemoBalances>(
  'africonnect.demo-balances.v2',
  (raw) => {
    if (!isRecord(raw)) return {}
    const next: DemoBalances = {}
    if (typeof raw.walletFcfa === 'number' && Number.isFinite(raw.walletFcfa)) {
      next.walletFcfa = Math.max(0, Math.floor(raw.walletFcfa))
    }
    if (typeof raw.rewardsPoints === 'number' && Number.isFinite(raw.rewardsPoints)) {
      next.rewardsPoints = Math.max(0, Math.floor(raw.rewardsPoints))
    }
    return next
  },
)

/** Conversion scénario AfriConnect : 10 points = 1 FCFA. */
export const REWARDS_POINTS_PER_FCFA = 10

export function rewardsPointsToFcfa(points: number): number {
  return Math.floor(Math.max(0, points) / REWARDS_POINTS_PER_FCFA)
}

export function getDemoWalletAvailable(): number {
  return demoBalancesStore.get().walletFcfa ?? DEMO_PAYMENT_WALLET_FCFA
}

export function getDemoRewardsAvailable(): number {
  return demoBalancesStore.get().rewardsPoints ?? DEMO_PAYMENT_REWARDS_POINTS
}

/**
 * Débit atomique démo après confirmation PIN.
 * Retourne false si solde insuffisant (aucune écriture partielle).
 */
export function applyDemoPayment(fcfaDebit: number, rewardsDebit: number): boolean {
  const wallet = getDemoWalletAvailable()
  const rewards = getDemoRewardsAvailable()
  const pay = Math.max(0, Math.floor(fcfaDebit))
  const pts = Math.max(0, Math.floor(rewardsDebit))
  if (pay > wallet || pts > rewards) return false
  demoBalancesStore.set({
    walletFcfa: wallet - pay,
    rewardsPoints: rewards - pts,
  })
  return true
}

/**
 * Crédit Wallet démo (ex. retrait de position Cotes / Coins).
 * Retourne le montant effectivement crédité.
 */
export function applyDemoCredit(fcfaCredit: number): number {
  const credit = Math.max(0, Math.floor(fcfaCredit))
  if (credit <= 0) return 0
  const wallet = getDemoWalletAvailable()
  demoBalancesStore.set({
    ...demoBalancesStore.get(),
    walletFcfa: wallet + credit,
  })
  return credit
}
