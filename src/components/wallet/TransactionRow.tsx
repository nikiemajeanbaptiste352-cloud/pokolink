import {
  ArrowDownLeft,
  ArrowDownToLine,
  ArrowUpFromLine,
  BadgePercent,
  ChevronRight,
  ShoppingBag,
  Undo2,
  XCircle,
  type LucideIcon,
} from 'lucide-react'
import { Link } from 'react-router-dom'

import { formatSignedPrice } from '@/components/market/market-utils'
import { formatPrice } from '@/lib/format'
import { StatusPill } from '@/components/wallet/StatusCard'
import { formatDateTime } from '@/lib/pro-labels'
import { toneSoft, type Tone } from '@/lib/tones'
import { cn } from '@/lib/utils'
import { getTransactionStatus } from '@/lib/placeholder-wallet'
import type { WalletTransaction, WalletTransactionKind } from '@/types/wallet'

const KIND_ICON: Record<WalletTransactionKind, { icon: LucideIcon; tone: Tone }> = {
  deposit: { icon: ArrowDownToLine, tone: 'brand' },
  withdrawal: { icon: ArrowUpFromLine, tone: 'violet' },
  payment: { icon: ShoppingBag, tone: 'info' },
  credit: { icon: ArrowDownLeft, tone: 'brand' },
  commission: { icon: BadgePercent, tone: 'gold' },
  refund: { icon: Undo2, tone: 'gold' },
  cancellation: { icon: XCircle, tone: 'red' },
}

/** Ligne de l'historique : type, titre, date, statut et montant signé. */
export function TransactionRow({ transaction }: { transaction: WalletTransaction }) {
  const { icon: Icon, tone } = KIND_ICON[transaction.kind]
  const status = getTransactionStatus(transaction)
  // Un dépôt ou un retrait n'a de signe (+ / −) que lorsqu'il est réglé : tant qu'il est en
  // cours, rejeté ou expiré, le montant est celui de la demande, pas un mouvement du solde.
  const settled = !status || status.outcome === 'success'

  const content = (
    <>
      <span
        className={cn(
          'grid size-11 shrink-0 place-items-center rounded-2xl',
          toneSoft[tone],
        )}
      >
        <Icon className="size-5" aria-hidden="true" />
      </span>
      <span className="min-w-0 flex-1 space-y-0.5">
        <span className="block truncate text-body font-bold">{transaction.title}</span>
        <span className="block truncate text-caption text-muted-foreground">
          {formatDateTime(transaction.at)}
          {transaction.detail ? ` · ${transaction.detail}` : ''}
        </span>
        {status ? <StatusPill meta={status} className="mt-1" /> : null}
      </span>
      <span
        className={cn(
          'shrink-0 text-body font-extrabold tabular-nums',
          settled && transaction.amount > 0 && 'text-brand',
        )}
      >
        {settled
          ? formatSignedPrice(transaction.amount)
          : formatPrice(Math.abs(transaction.amount))}
      </span>
      {transaction.to ? (
        <ChevronRight
          className="size-4 shrink-0 text-muted-foreground"
          aria-hidden="true"
        />
      ) : null}
    </>
  )

  const className = 'flex min-h-16 items-center gap-3 px-4 py-3'
  return transaction.to ? (
    <Link to={transaction.to} className={cn(className, 'hover:bg-muted')}>
      {content}
    </Link>
  ) : (
    <div className={className}>{content}</div>
  )
}
