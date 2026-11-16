import {
  ArrowDownLeft,
  ArrowUpRight,
  Gift,
  Lock,
  LockOpen,
  ShoppingBag,
  Undo2,
  type LucideIcon,
} from 'lucide-react'

import { StatusPill } from '@/components/pro/shared'
import { formatDateTime } from '@/lib/pro-labels'
import {
  formatPoints,
  REWARDS_KIND_FLOW,
  REWARDS_KIND_LABEL,
  REWARDS_STATUS,
} from '@/lib/rewards-labels'
import { toneSoft, type Tone } from '@/lib/tones'
import { cn } from '@/lib/utils'
import type { RewardsOperation, RewardsOperationKind } from '@/types/rewards'

const KIND_ICON: Record<RewardsOperationKind, { icon: LucideIcon; tone: Tone }> = {
  EARN: { icon: Gift, tone: 'gold' },
  RESERVE: { icon: Lock, tone: 'amber' },
  RELEASE: { icon: LockOpen, tone: 'neutral' },
  SPEND: { icon: ShoppingBag, tone: 'info' },
  TRANSFER_OUT: { icon: ArrowUpRight, tone: 'violet' },
  TRANSFER_IN: { icon: ArrowDownLeft, tone: 'brand' },
  REVERSE: { icon: Undo2, tone: 'red' },
}

/**
 * Ligne du journal Rewards : type, titre, date, statut et points. Le signe (+ / −) n'apparaît
 * que lorsque l'opération est confirmée : tant qu'elle est en attente, refusée ou annulée,
 * le nombre de points est celui de la demande, pas un mouvement du solde.
 */
export function RewardsOperationRow({ operation }: { operation: RewardsOperation }) {
  const { icon: Icon, tone } = KIND_ICON[operation.kind]
  const status = REWARDS_STATUS[operation.status]
  const flow = REWARDS_KIND_FLOW[operation.kind]
  const settled = operation.status === 'confirmed' && flow !== 'hold'
  const sign = settled ? (flow === 'in' ? '+' : '−') : ''

  return (
    <div className="flex min-h-18 items-center gap-3 px-4 py-3">
      <span
        className={cn(
          'grid size-11 shrink-0 place-items-center rounded-full',
          toneSoft[tone],
        )}
      >
        <Icon className="size-5" aria-hidden="true" />
      </span>
      <span className="min-w-0 flex-1 space-y-0.5">
        <span className="block truncate text-body font-bold">{operation.title}</span>
        <span className="block truncate text-caption text-muted-foreground">
          {REWARDS_KIND_LABEL[operation.kind]} · {formatDateTime(operation.at)}
        </span>
        {operation.detail ? (
          <span className="block truncate text-caption text-muted-foreground">
            {operation.detail}
          </span>
        ) : null}
        <StatusPill className="mt-1">{status.label}</StatusPill>
      </span>
      <span
        className={cn(
          'shrink-0 text-body font-extrabold tabular-nums',
          settled && flow === 'in' && 'text-brand',
        )}
      >
        {sign}
        {formatPoints(operation.points)}
      </span>
    </div>
  )
}
