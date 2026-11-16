/**
 * DONNÉES TEMPORAIRES du Wallet : uniquement pour vérifier le rendu de chaque statut.
 * Les soldes, statuts, frais, limites et le numéro marchand viennent du serveur et de
 * l'administration : à remplacer par l'API (TanStack Query). Aucun calcul financier n'est
 * fait dans le frontend.
 */
import { DEPOSIT_STATUS, WITHDRAWAL_STATUS, type StatusMeta } from '@/lib/wallet-labels'
import { paths } from '@/routes/paths'
import type {
  DepositRequest,
  DepositStatus,
  WalletBalances,
  WalletMethod,
  WalletTransaction,
  WithdrawalRequest,
  WithdrawalStatus,
} from '@/types/wallet'

const MIN = 60_000
const HOUR = 60 * MIN
const NOW = Date.now()

/** Cohérents entre eux : 125 000 disponibles + 50 000 réservés (retraits en cours). */
export const TEMP_BALANCES: WalletBalances = {
  available: 125_000,
  reserved: 50_000,
  total: 175_000,
}

/** Limites d'exemple : les vraies sont configurées par l'administration (à définir). */
export const TEMP_LIMITS = {
  depositMin: 1_000,
  depositMax: 500_000,
  withdrawalMin: 1_000,
  withdrawalMax: 300_000,
  p2pMin: 100,
  p2pMax: 200_000,
} as const

export const TEMP_DEPOSIT_METHODS: readonly WalletMethod[] = [
  { id: 'orange-money', label: 'Orange Money' },
  { id: 'moov-money', label: 'Moov Money' },
  { id: 'wave', label: 'Wave' },
]

/** Moyens de retrait activés par l'administration (exemples du rapport). */
export const TEMP_WITHDRAWAL_METHODS: readonly WalletMethod[] = [
  { id: 'orange-money', label: 'Orange Money' },
  { id: 'moov-money', label: 'Moov Money' },
  { id: 'wave', label: 'Wave' },
]

/** Numéro marchand d'exemple (celui du rapport) : à remplacer par le compte réel. */
export const TEMP_MERCHANT_NUMBER = '65 67 97 44'

/**
 * Code USSD d'exemple du rapport (`*114*2*1*65679744*montant#`) : format à confirmer avec
 * les paramètres réels du compte marchand. Le serveur fournira le code final.
 */
export function buildDemoUssd(amount: number): string {
  return `*114*2*1*${TEMP_MERCHANT_NUMBER.replace(/\s/g, '')}*${amount}#`
}

export function getMethodLabel(methodId: string): string {
  return (
    [...TEMP_DEPOSIT_METHODS, ...TEMP_WITHDRAWAL_METHODS].find((m) => m.id === methodId)
      ?.label ?? methodId
  )
}

function deposit(
  n: number,
  status: DepositStatus,
  amount: number,
  ageMin: number,
  extra: Partial<DepositRequest> = {},
): DepositRequest {
  const createdAt = NOW - ageMin * MIN
  return {
    id: `dep-${n}`,
    reference: `DEP-2026-${String(1000 + n)}`,
    operator: 'Orange Money',
    amount,
    status,
    createdAt,
    expiresAt: createdAt + 5 * MIN,
    merchantNumber: TEMP_MERCHANT_NUMBER,
    ussd: buildDemoUssd(amount),
    ...extra,
  }
}

function declared(amount: number, ageMin: number, transactionId?: string) {
  return {
    amount,
    senderNumber: '70 12 34 56',
    merchantNumber: TEMP_MERCHANT_NUMBER,
    transferredAt: NOW - ageMin * MIN,
    ...(transactionId ? { transactionId } : {}),
  }
}

/** Un dépôt par statut, pour contrôler chaque écran. */
export const TEMP_DEPOSITS: readonly DepositRequest[] = [
  deposit(1, 'WAITING_PAYMENT', 10_000, 1),
  deposit(2, 'PAYMENT_DETECTED', 15_000, 8, {
    declaration: declared(15_000, 8, 'OM240812.1530.A41'),
  }),
  deposit(3, 'VERIFYING', 5_000, 20, {
    declaration: declared(5_000, 20, 'OM240812.1512.B07'),
  }),
  deposit(4, 'MANUAL_REVIEW', 20_000, 70, { declaration: declared(20_000, 70) }),
  deposit(5, 'CREDITED', 25_000, 3 * 60, {
    declaration: declared(25_000, 3 * 60, 'OM240812.1140.C92'),
    creditedAt: NOW - 3 * HOUR + 4 * MIN,
  }),
  deposit(6, 'EXPIRED', 10_000, 26 * 60),
  deposit(7, 'REJECTED', 8_000, 2 * 24 * 60, {
    declaration: declared(8_000, 2 * 24 * 60, 'OM240810.0902.D15'),
  }),
  deposit(8, 'APPROVED', 12_000, 40, {
    declaration: declared(12_000, 40, 'OM240812.1450.E63'),
  }),
  deposit(9, 'CREATED', 3_000, 0),
]

function withdrawal(
  n: number,
  status: WithdrawalStatus,
  amount: number,
  ageMin: number,
  extra: Partial<WithdrawalRequest> = {},
): WithdrawalRequest {
  const createdAt = NOW - ageMin * MIN
  return {
    id: `ret-${n}`,
    reference: `RET-2026-${String(2000 + n)}`,
    amount,
    // Les frais ne sont pas définis : le serveur n'en applique pas encore.
    fee: null,
    netAmount: null,
    methodId: 'orange-money',
    beneficiaryName: 'Amadou Ba',
    beneficiaryNumber: '70 12 34 56',
    status,
    createdAt,
    updatedAt: createdAt + 10 * MIN,
    ...extra,
  }
}

/** Un retrait par statut. Réservés (en cours) : 5 000 + 10 000 + 20 000 + 15 000 = 50 000. */
export const TEMP_WITHDRAWALS: readonly WithdrawalRequest[] = [
  withdrawal(1, 'PENDING_ADMIN', 5_000, 12),
  withdrawal(2, 'VALIDATED', 10_000, 90),
  withdrawal(3, 'PROCESSING', 20_000, 150, { methodId: 'wave' }),
  withdrawal(4, 'MANUAL_REVIEW', 15_000, 5 * 60, {
    methodId: 'moov-money',
    beneficiaryNumber: '01 23 45 67',
  }),
  withdrawal(5, 'COMPLETED', 30_000, 2 * 24 * 60, {
    payout: {
      externalId: 'OM240810.1015.F28',
      amountSent: 30_000,
      transferredAt: NOW - 2 * 24 * 60 * MIN + 35 * MIN,
    },
  }),
  withdrawal(6, 'REJECTED', 7_000, 3 * 24 * 60),
  withdrawal(7, 'FAILED', 9_000, 4 * 24 * 60, { methodId: 'moov-money' }),
  withdrawal(8, 'CANCELLED', 4_000, 5 * 24 * 60),
]

export function findTransaction(id: string | undefined): WalletTransaction | undefined {
  return TEMP_TRANSACTIONS.find((item) => item.id === id)
}

export function findTransactionByReference(
  reference: string | undefined,
): WalletTransaction | undefined {
  return reference ? TEMP_TRANSACTIONS.find((item) => item.reference === reference) : undefined
}

export function findDeposit(id: string | undefined): DepositRequest | undefined {
  return TEMP_DEPOSITS.find((item) => item.id === id)
}

export function findWithdrawal(id: string | undefined): WithdrawalRequest | undefined {
  return TEMP_WITHDRAWALS.find((item) => item.id === id)
}

/** Historique d'exemple : opérations des services AfriConnect en plus des dépôts et retraits. */
const OTHER_TRANSACTIONS: readonly WalletTransaction[] = [
  {
    id: 'pay-1',
    kind: 'payment',
    title: 'Achat · TechPro Services',
    detail: 'Casque Bluetooth',
    amount: -25_000,
    at: NOW - 6 * HOUR,
    to: paths.walletOperation('pay-1'),
    reference: 'TX-2026-004211',
    counterpart: { name: 'TechPro Services', handle: 'techpro' },
    document: 'ticket',
  },
  {
    id: 'pay-2',
    kind: 'payment',
    title: 'Participation · Salon des Entrepreneurs d’Afrique',
    amount: -2_000,
    at: NOW - 30 * HOUR,
    to: paths.walletOperation('pay-2'),
    reference: 'TX-2026-004102',
    counterpart: { name: 'Salon des Entrepreneurs d’Afrique' },
    document: 'ticket',
  },
  {
    id: 'pay-3',
    kind: 'refund',
    title: 'Remboursement · Sahel Sneakers',
    amount: 18_000,
    at: NOW - 3 * 24 * HOUR,
    to: paths.walletOperation('pay-3'),
    reference: 'RMB-2026-000031',
    counterpart: { name: 'Sahel Sneakers', handle: 'sahel.sneakers' },
    relatedReference: 'TX-2026-003850',
  },
  // Exemple du rapport : vente de 5 000 FCFA, commission AfriConnect de 5 % (250 FCFA).
  {
    id: 'credit-1',
    kind: 'credit',
    title: 'Vente · Casque Bluetooth',
    detail: 'Crédit net après commission',
    amount: 4_750,
    at: NOW - 9 * HOUR,
    to: paths.walletOperation('credit-1'),
    reference: 'TX-2026-004305',
    counterpart: { name: 'Awa Konaté', handle: 'awa.k' },
    gross: 5_000,
    commission: 250,
    document: 'receipt',
  },
  {
    id: 'commission-1',
    kind: 'commission',
    title: 'Commission AfriConnect · Vente',
    detail: 'Déjà déduite du crédit net',
    amount: 250,
    at: NOW - 9 * HOUR,
    to: paths.walletOperation('commission-1'),
    reference: 'COM-2026-000091',
    relatedReference: 'TX-2026-004305',
    gross: 5_000,
    commission: 250,
  },
  {
    id: 'pay-4',
    kind: 'payment',
    title: 'Réservation · Salon Beauté Aminata',
    amount: -6_000,
    at: NOW - 2 * 24 * HOUR,
    to: paths.walletOperation('pay-4'),
    reference: 'TX-2026-003902',
    counterpart: { name: 'Salon Beauté Aminata', handle: 'aminata.beaute' },
  },
  {
    id: 'cancel-1',
    kind: 'cancellation',
    title: 'Annulation · Salon Beauté Aminata',
    detail: 'Contrepassation de la réservation',
    amount: 6_000,
    at: NOW - 2 * 24 * HOUR + 3 * HOUR,
    to: paths.walletOperation('cancel-1'),
    reference: 'ANN-2026-000012',
    counterpart: { name: 'Salon Beauté Aminata', handle: 'aminata.beaute' },
    relatedReference: 'TX-2026-003902',
  },
]

/** Historique complet, du plus récent au plus ancien. */
export const TEMP_TRANSACTIONS: readonly WalletTransaction[] = [
  ...OTHER_TRANSACTIONS,
  ...TEMP_DEPOSITS.map((item): WalletTransaction => ({
    id: item.id,
    kind: 'deposit',
    title: `Dépôt ${item.operator}`,
    detail: item.reference,
    amount: item.amount,
    at: item.createdAt,
    to: paths.walletDeposit(item.id),
    reference: item.reference,
  })),
  ...TEMP_WITHDRAWALS.map((item): WalletTransaction => ({
    id: item.id,
    kind: 'withdrawal',
    title: `Retrait ${getMethodLabel(item.methodId)}`,
    detail: item.reference,
    amount: -item.amount,
    at: item.createdAt,
    to: paths.walletWithdrawal(item.id),
    reference: item.reference,
  })),
].sort((a, b) => b.at - a.at)

/** Statut affiché d'une ligne d'historique : seuls les dépôts et retraits en ont un. */
export function getTransactionStatus(
  transaction: WalletTransaction,
): StatusMeta | undefined {
  if (transaction.kind === 'deposit') {
    const item = findDeposit(transaction.id)
    return item ? DEPOSIT_STATUS[item.status] : undefined
  }
  if (transaction.kind === 'withdrawal') {
    const item = findWithdrawal(transaction.id)
    return item ? WITHDRAWAL_STATUS[item.status] : undefined
  }
  return undefined
}
