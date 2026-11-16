import { cn } from '@/lib/utils'
import type { CoinEventState } from '@/types/coin-market'

import { COIN_STATE_CLASS, COIN_STATE_LABEL } from './coin-utils'

export function CoinStateBadge({ state }: { state: CoinEventState }) {
  return (
    <span
      className={cn(
        'inline-flex shrink-0 items-center rounded-full px-2.5 py-1 text-caption font-bold',
        COIN_STATE_CLASS[state],
      )}
    >
      {COIN_STATE_LABEL[state]}
    </span>
  )
}
