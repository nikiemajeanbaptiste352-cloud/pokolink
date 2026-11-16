import { History } from 'lucide-react'
import { useState } from 'react'

import { BackLink } from '@/components/common/BackLink'
import { EmptyState } from '@/components/common/EmptyState'
import { FilterChips, type ChipItem } from '@/components/common/FilterChips'
import { PageHeader } from '@/components/common/PageHeader'
import { RewardsOperationRow } from '@/components/rewards/RewardsOperationRow'
import { useRewardsOperations } from '@/hooks/use-rewards'
import { REWARDS_KIND_FLOW } from '@/lib/rewards-labels'
import { paths } from '@/routes/paths'
import type { RewardsOperation } from '@/types/rewards'

type FilterId = 'all' | 'earned' | 'spent' | 'pending'

const FILTERS: readonly ChipItem<FilterId>[] = [
  { id: 'all', label: 'Tout' },
  { id: 'earned', label: 'Gagnés' },
  { id: 'spent', label: 'Dépensés' },
  { id: 'pending', label: 'En attente' },
]

const MATCH: Record<FilterId, (operation: RewardsOperation) => boolean> = {
  all: () => true,
  earned: (o) => REWARDS_KIND_FLOW[o.kind] === 'in',
  spent: (o) => REWARDS_KIND_FLOW[o.kind] === 'out',
  pending: (o) => o.status === 'pending',
}

/** Journal complet des opérations Rewards, filtrable. */
export function RewardsHistoryPage() {
  const operations = useRewardsOperations()
  const [filter, setFilter] = useState<FilterId>('all')
  const visible = operations.filter(MATCH[filter])

  return (
    <>
      <PageHeader
        title="Historique Rewards"
        leading={<BackLink to={paths.rewards} label="Rewards" history />}
      />
      <FilterChips
        label="Filtrer les opérations"
        items={FILTERS}
        value={filter}
        onChange={setFilter}
        className="py-3"
      />
      {visible.length === 0 ? (
        <EmptyState
          icon={History}
          tone="info"
          title="Aucune opération"
          description="Les opérations correspondantes apparaîtront ici."
        />
      ) : (
        <ul className="divide-y">
          {visible.map((operation) => (
            <li key={operation.id}>
              <RewardsOperationRow operation={operation} />
            </li>
          ))}
        </ul>
      )}
    </>
  )
}
