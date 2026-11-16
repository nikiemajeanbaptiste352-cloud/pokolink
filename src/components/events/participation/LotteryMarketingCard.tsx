import { Ticket } from 'lucide-react'

import { formatLotteryTicketNumber } from '@/lib/lottery-tickets'
import { cn } from '@/lib/utils'
import type { LotteryDrawTicket } from '@/types/event'

interface LotteryMarketingCardProps {
  ticket: LotteryDrawTicket
  prizeName: string
  /** Mise en avant (gagnant / mon ticket). */
  highlight?: 'winner' | 'mine' | 'pool'
  className?: string
}

/**
 * Carte loterie marketing : le numéro de ticket y est inscrit pour le tirage.
 */
export function LotteryMarketingCard({
  ticket,
  prizeName,
  highlight = 'pool',
  className,
}: LotteryMarketingCardProps) {
  return (
    <article
      className={cn(
        'relative overflow-hidden rounded-xl border p-3.5',
        highlight === 'winner' &&
          'border-gold/50 bg-linear-to-br from-amber-500/25 to-[#1a1a1a]',
        highlight === 'mine' &&
          'border-brand/50 bg-linear-to-br from-brand/20 to-[#1a1a1a]',
        highlight === 'pool' && 'border-white/10 bg-[#141414]',
        className,
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-[10px] font-semibold tracking-wide text-white/55 uppercase">
            Loterie marketing
          </p>
          <p className="mt-0.5 truncate text-body font-bold">{prizeName}</p>
        </div>
        <span
          className={cn(
            'grid size-8 shrink-0 place-items-center rounded-lg',
            highlight === 'winner' ? 'bg-gold/30 text-gold' : 'bg-white/10 text-white/80',
          )}
        >
          <Ticket className="size-4" aria-hidden="true" />
        </span>
      </div>

      <p className="mt-3 font-mono text-lg font-extrabold tracking-wider tabular-nums">
        {formatLotteryTicketNumber(ticket.number)}
      </p>
      <p className="mt-1 text-caption text-white/65">
        {ticket.holderLabel}
        {highlight === 'winner' ? ' · Gagnant' : null}
        {highlight === 'mine' ? ' · Votre ticket' : null}
      </p>
    </article>
  )
}
