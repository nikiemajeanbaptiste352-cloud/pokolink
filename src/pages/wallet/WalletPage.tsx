import { ReceiptText } from 'lucide-react'
import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'

import { BackLink } from '@/components/common/BackLink'
import { EmptyState } from '@/components/common/EmptyState'
import { FilterChips } from '@/components/common/FilterChips'
import { PageHeader } from '@/components/common/PageHeader'
import { SectionHeader } from '@/components/common/SectionHeader'
import { BalanceCard } from '@/components/wallet/BalanceCard'
import { MerchantDepositCard } from '@/components/wallet/MerchantDepositCard'
import { PaymentRequestRow } from '@/components/wallet/PaymentRequestRow'
import { TransactionRow } from '@/components/wallet/TransactionRow'
import { useWalletBalances, useWalletPayments } from '@/hooks/use-wallet'
import { ACTIVE_DEPOSIT, ACTIVE_WITHDRAWAL } from '@/lib/wallet-labels'
import { findDeposit, findWithdrawal, TEMP_TRANSACTIONS } from '@/lib/placeholder-wallet'
import { safeReturnPath } from '@/lib/safe-return-path'
import { paths } from '@/routes/paths'
import type { WalletTransaction } from '@/types/wallet'

type Filter = 'all' | 'deposit' | 'withdrawal' | 'payment'

const FILTERS = [
  { id: 'all', label: 'Tout' },
  { id: 'deposit', label: 'Dépôts' },
  { id: 'withdrawal', label: 'Retraits' },
  { id: 'payment', label: 'Paiements' },
] as const satisfies readonly { id: Filter; label: string }[]

function matches(transaction: WalletTransaction, filter: Filter): boolean {
  if (filter === 'all') return true
  if (filter === 'payment')
    return transaction.kind === 'payment' || transaction.kind === 'refund'
  return transaction.kind === filter
}

function isActive(transaction: WalletTransaction): boolean {
  if (transaction.kind === 'deposit') {
    const item = findDeposit(transaction.id)
    return item ? ACTIVE_DEPOSIT.includes(item.status) : false
  }
  if (transaction.kind === 'withdrawal') {
    const item = findWithdrawal(transaction.id)
    return item ? ACTIVE_WITHDRAWAL.includes(item.status) : false
  }
  return false
}

/** Wallet : soldes, opérations en cours et historique. */
export function WalletPage() {
  const [filter, setFilter] = useState<Filter>('all')
  const [searchParams] = useSearchParams()
  const returnTo = safeReturnPath(searchParams.get('retour'))
  const balances = useWalletBalances()
  const payments = useWalletPayments()
  const active = TEMP_TRANSACTIONS.filter(isActive)
  const history = TEMP_TRANSACTIONS.filter(
    (item) => !isActive(item) && matches(item, filter),
  )

  return (
    <div className="wallet-page relative min-h-full pb-6">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_80%_40%_at_50%_0%,color-mix(in_srgb,var(--brand)_14%,transparent)_0%,transparent_55%),linear-gradient(180deg,var(--background)_0%,color-mix(in_srgb,var(--muted)_40%,var(--background))_100%)]"
      />

      <PageHeader
        title="Wallet"
        leading={
          <BackLink
            to={returnTo ?? paths.profile}
            label={returnTo ? 'Retour' : 'Profil'}
            history={!returnTo}
          />
        }
      />

      <div className="space-y-4 px-0 pt-1">
        <BalanceCard balances={balances} />
        <MerchantDepositCard showDeclareCta />
      </div>

      {active.length > 0 || payments.length > 0 ? (
        <section aria-labelledby="active-title" className="mt-5 space-y-2.5">
          <SectionHeader
            title={<span id="active-title">En cours</span>}
            description="Dépôts, retraits et paiements en attente"
          />
          <ul className="mx-3 space-y-2 sm:mx-4">
            {payments.map((request) => (
              <li
                key={request.id}
                className="overflow-hidden rounded-2xl border border-border/70 bg-card/95 shadow-[0_10px_28px_-22px_rgba(15,23,42,0.35)]"
              >
                <PaymentRequestRow request={request} />
              </li>
            ))}
            {active.map((item) => (
              <li
                key={item.id}
                className="overflow-hidden rounded-2xl border border-border/70 bg-card/95 shadow-[0_10px_28px_-22px_rgba(15,23,42,0.35)]"
              >
                <TransactionRow transaction={item} />
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section aria-labelledby="history-title" className="mt-5 space-y-2.5">
        <SectionHeader
          title={<span id="history-title">Historique</span>}
          description="Opérations terminées"
        />
        <div className="px-0">
          <FilterChips
            label="Type d’opération"
            items={FILTERS}
            value={filter}
            onChange={setFilter}
          />
        </div>
        {history.length > 0 ? (
          <ul className="mx-3 divide-y overflow-hidden rounded-2xl border border-border/70 bg-card/95 shadow-[0_10px_28px_-22px_rgba(15,23,42,0.35)] sm:mx-4">
            {history.map((item) => (
              <li key={item.id}>
                <TransactionRow transaction={item} />
              </li>
            ))}
          </ul>
        ) : (
          <div className="mx-3 rounded-2xl border border-dashed border-border/80 bg-card/60 sm:mx-4">
            <EmptyState
              icon={ReceiptText}
              title="Aucune opération"
              description="Rien à afficher pour ce type d’opération."
              className="py-10"
            />
          </div>
        )}
      </section>
    </div>
  )
}
