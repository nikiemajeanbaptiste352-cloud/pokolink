import { X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

import { Button } from '@/components/ui/button'
import { useLocalStore } from '@/hooks/use-local-store'
import { settleCoteWithdrawal } from '@/lib/cote-wallet-settle'
import { formatPrice } from '@/lib/format'
import { cn } from '@/lib/utils'
import { withdrawRequestsStore } from '@/lib/withdraw-requests-store'
import type { CreatorMarket, UserPosition } from '@/types/market'

import { formatCote, formatCoverage, formatSignedPrice } from './market-utils'
import { PoolStatus } from './PoolStatus'

interface WithdrawSheetProps {
  position: UserPosition | null
  market: CreatorMarket | null
  onClose: () => void
}

function Row({
  label,
  value,
  strong,
}: {
  label: string
  value: string
  strong?: boolean
}) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <dt className="text-body text-muted-foreground">{label}</dt>
      <dd
        className={cn(
          'text-body',
          strong ? 'text-title font-extrabold' : 'font-semibold',
        )}
      >
        {value}
      </dd>
    </div>
  )
}

/**
 * Retrait d’une position Cotes : crédite le Wallet du montant payable (démo).
 */
export function WithdrawSheet({ position, market, onClose }: WithdrawSheetProps) {
  const ref = useRef<HTMLDialogElement>(null)
  const open = position !== null && market !== null
  const requests = useLocalStore(withdrawRequestsStore)
  const requested = position !== null && requests.includes(position.id)
  const [notice, setNotice] = useState('')
  const suspended = market?.poolState === 'suspended'
  const canPay =
    position !== null && !requested && !suspended && position.payableNow > 0

  useEffect(() => {
    const dialog = ref.current
    if (!dialog) return
    if (open && !dialog.open) dialog.showModal()
    if (!open && dialog.open) dialog.close()
  }, [open])

  const noticeKey = `${open ? '1' : '0'}:${position?.id ?? ''}`
  const [noticeFor, setNoticeFor] = useState(noticeKey)
  if (noticeFor !== noticeKey) {
    setNoticeFor(noticeKey)
    setNotice('')
  }

  function confirmWithdraw() {
    if (!position || !market) return
    const result = settleCoteWithdrawal(position, {
      creatorHandle: market.creatorHandle,
      sideLabel: position.side === 'yes' ? 'OUI' : 'NON',
    })
    if (!result.ok) {
      setNotice(
        result.reason === 'already'
          ? 'Ce retrait a déjà été traité.'
          : 'Montant non payable pour le moment.',
      )
      return
    }
    setNotice(
      `${formatPrice(result.credited)} crédités sur votre Wallet AfriConnect.`,
    )
  }

  return (
    <dialog
      ref={ref}
      aria-labelledby="withdraw-sheet-title"
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
      {position && market ? (
        <div className="pb-safe space-y-4 p-4">
          <div className="flex items-start gap-3">
            <div className="min-w-0 flex-1">
              <h2 id="withdraw-sheet-title" className="text-title font-extrabold">
                Retirer ma position
              </h2>
              <p className="truncate text-body text-muted-foreground">
                @{market.creatorHandle} · {position.side === 'yes' ? 'OUI' : 'NON'} ·
                facteur {formatCote(market.cote)}
              </p>
            </div>
            <button
              type="button"
              onClick={() => ref.current?.close()}
              aria-label="Fermer"
              className="-mt-1 -mr-2 grid size-11 shrink-0 place-items-center rounded-full hover:bg-muted"
            >
              <X className="size-5" aria-hidden="true" />
            </button>
          </div>

          <dl className="space-y-2 rounded-xl border bg-card p-3.5">
            <Row label="Mise initiale" value={formatPrice(position.stake)} />
            <Row label="Valeur actuelle" value={formatPrice(position.theoreticalValue)} />
            <Row label="Gain ou perte" value={formatSignedPrice(position.latent)} />
            <Row label="Montant net" value={formatPrice(position.netValue)} />
            <div className="border-t pt-2">
              <Row
                label={
                  market.poolState === 'limited'
                    ? `Crédit Wallet (${formatCoverage(market.coverageRatio)})`
                    : 'Crédit Wallet'
                }
                value={
                  suspended ? 'Suspendu' : formatPrice(position.payableNow)
                }
                strong
              />
            </div>
          </dl>

          {market.poolState !== 'covered' ? (
            <PoolStatus
              poolState={market.poolState}
              coverageRatio={market.coverageRatio}
            />
          ) : null}

          <p className="text-caption text-muted-foreground">
            La mise a été débitée de votre Wallet à l’ouverture. Le retrait crédite
            maintenant le montant payable sur votre Wallet (démonstration).
          </p>

          <Button
            type="button"
            className="w-full"
            disabled={!canPay}
            onClick={confirmWithdraw}
          >
            {requested
              ? 'Retrait effectué'
              : suspended
                ? 'Retrait suspendu'
                : `Créditer ${formatPrice(position.payableNow)}`}
          </Button>
          <p role="status" className="text-center text-caption text-muted-foreground empty:hidden">
            {notice ||
              (requested
                ? 'Position retirée · Wallet crédité.'
                : null)}
          </p>
        </div>
      ) : null}
    </dialog>
  )
}
