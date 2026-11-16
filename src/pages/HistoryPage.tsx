import { History } from 'lucide-react'
import { useMemo, useState } from 'react'

import { BackLink } from '@/components/common/BackLink'
import { EmptyState } from '@/components/common/EmptyState'
import { FilterChips, type ChipItem } from '@/components/common/FilterChips'
import { PageHeader } from '@/components/common/PageHeader'
import { PurchaseRow } from '@/components/purchases/PurchaseRow'
import { RewardsOperationRow } from '@/components/rewards/RewardsOperationRow'
import { PaymentRequestRow } from '@/components/wallet/PaymentRequestRow'
import { usePurchases } from '@/hooks/use-purchases'
import { useRewardsOperations } from '@/hooks/use-rewards'
import { useWalletPayments } from '@/hooks/use-wallet'
import { paths } from '@/routes/paths'
import type { Purchase } from '@/types/purchase'
import type { RewardsOperation } from '@/types/rewards'
import type { WalletPaymentRequest } from '@/types/wallet'

type FilterId = 'all' | 'wallet' | 'purchases' | 'rewards'

const FILTERS: readonly ChipItem<FilterId>[] = [
  { id: 'all', label: 'Tout' },
  { id: 'wallet', label: 'Wallet' },
  { id: 'purchases', label: 'Achats' },
  { id: 'rewards', label: 'Rewards' },
]

type Entry =
  | { type: 'wallet'; id: string; at: number; request: WalletPaymentRequest }
  | { type: 'purchases'; id: string; at: number; purchase: Purchase }
  | { type: 'rewards'; id: string; at: number; operation: RewardsOperation }

/** Historique personnel : paiements Wallet, achats et opérations Rewards, du plus récent au plus ancien. */
export function HistoryPage() {
  const payments = useWalletPayments()
  const purchases = usePurchases()
  const operations = useRewardsOperations()
  const [filter, setFilter] = useState<FilterId>('all')

  const entries = useMemo<Entry[]>(() => {
    const all: Entry[] = [
      ...payments.map((request) => ({
        type: 'wallet' as const,
        id: `w-${request.id}`,
        at: request.createdAt,
        request,
      })),
      ...purchases.map((purchase) => ({
        type: 'purchases' as const,
        id: `p-${purchase.id}`,
        at: purchase.createdAt,
        purchase,
      })),
      ...operations.map((operation) => ({
        type: 'rewards' as const,
        id: `r-${operation.id}`,
        at: operation.at,
        operation,
      })),
    ]
    return all.sort((a, b) => b.at - a.at)
  }, [payments, purchases, operations])

  const visible = entries.filter((entry) => filter === 'all' || entry.type === filter)

  return (
    <>
      <PageHeader
        title="Historique"
        leading={<BackLink to={paths.profile} label="Profil" history />}
      />
      <div className="space-y-3 py-3">
        <FilterChips
          label="Filtrer l’historique"
          items={FILTERS}
          value={filter}
          onChange={setFilter}
        />
      </div>

      {visible.length === 0 ? (
        <EmptyState
          icon={History}
          tone="info"
          title="Rien à afficher"
          description="Vos paiements, achats et points apparaîtront ici."
        />
      ) : (
        <ul className="divide-y">
          {visible.map((entry) => (
            <li key={entry.id}>
              {entry.type === 'wallet' ? (
                <PaymentRequestRow request={entry.request} />
              ) : entry.type === 'purchases' ? (
                <PurchaseRow purchase={entry.purchase} />
              ) : (
                <RewardsOperationRow operation={entry.operation} />
              )}
            </li>
          ))}
        </ul>
      )}
    </>
  )
}
