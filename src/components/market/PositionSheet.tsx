import { X } from 'lucide-react'
import { useEffect, useRef } from 'react'

import { Avatar } from '@/components/common/Avatar'
import { cn } from '@/lib/utils'
import type { CreatorMarket, MarketPosition } from '@/types/market'

import { formatCote, formatPercent, getTrend } from './market-utils'
import { PositionForm } from './PositionForm'

interface PositionSheetProps {
  market: CreatorMarket | null
  position?: MarketPosition
  onClose: () => void
}

/**
 * Feuille paiement : OUI / NON + mise + Wallet.
 * Ouverte depuis Participer (fil ou fiche détail).
 */
export function PositionSheet({
  market,
  position = 'yes',
  onClose,
}: PositionSheetProps) {
  const ref = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const dialog = ref.current
    if (!dialog) return
    if (market && !dialog.open) dialog.showModal()
    if (!market && dialog.open) dialog.close()
  }, [market])

  return (
    <dialog
      ref={ref}
      aria-labelledby="position-sheet-title"
      onClose={onClose}
      onKeyDown={(event) => {
        if (event.key === 'Escape') ref.current?.close()
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) ref.current?.close()
      }}
      className={cn(
        'fixed inset-x-0 top-auto bottom-0 m-0 mx-auto max-h-[92dvh] w-full max-w-180 overflow-y-auto',
        'rounded-t-3xl bg-background p-0 text-foreground backdrop:bg-black/60',
      )}
    >
      {market ? (
        <PositionSheetBody
          market={market}
          position={position}
          onClose={onClose}
          onDismiss={() => ref.current?.close()}
        />
      ) : null}
    </dialog>
  )
}

function PositionSheetBody({
  market,
  position,
  onClose,
  onDismiss,
}: {
  market: CreatorMarket
  position: MarketPosition
  onClose: () => void
  onDismiss: () => void
}) {
  const { trend, ratio } = getTrend(market)
  const change = trend === 'flat' ? 'stable' : formatPercent(ratio)

  return (
    <div className="pb-safe space-y-4 p-4">
      <div className="flex items-start gap-3">
        <Avatar name={market.creatorName} src={market.creatorAvatar} size="lg" />
        <div className="min-w-0 flex-1">
          <h2 id="position-sheet-title" className="text-title font-extrabold">
            Paiement
          </h2>
          <p className="truncate text-body text-muted-foreground">
            @{market.creatorHandle} · facteur {formatCote(market.cote)} · {change}
          </p>
        </div>
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Fermer"
          className="-mt-1 -mr-2 grid size-11 shrink-0 place-items-center rounded-full hover:bg-muted"
        >
          <X className="size-5" aria-hidden="true" />
        </button>
      </div>
      <PositionForm
        key={`${market.id}-${position}`}
        defaultPosition={position}
        idPrefix="sheet"
        creatorHandle={market.creatorHandle}
        marketId={market.id}
        entryCote={market.cote}
        onSent={onClose}
      />
    </div>
  )
}
