import { useState } from 'react'

import { BottomSheet } from '@/components/common/BottomSheet'
import { Button } from '@/components/ui/button'
import { useLocalStore } from '@/hooks/use-local-store'
import { settleCoinWithdrawal } from '@/lib/cote-wallet-settle'
import { formatPrice } from '@/lib/format'
import { withdrawRequestsStore } from '@/lib/withdraw-requests-store'
import type { CoinEvent, CoinPosition } from '@/types/coin-market'

import { formatCoins, formatIndex } from './coin-utils'

interface CoinWithdrawSheetProps {
  position: CoinPosition | null
  event: CoinEvent | null
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
      <dd className={strong ? 'text-title font-extrabold' : 'text-body font-semibold'}>
        {value}
      </dd>
    </div>
  )
}

/**
 * Retrait coins : crédite le Wallet du montant payable (démo).
 */
export function CoinWithdrawSheet({ position, event, onClose }: CoinWithdrawSheetProps) {
  const requests = useLocalStore(withdrawRequestsStore)
  const requested = position !== null && requests.includes(position.id)
  const [notice, setNotice] = useState('')
  const canPay =
    position !== null && !requested && position.payableNow > 0

  const noticeKey = position?.id ?? ''
  const [noticeFor, setNoticeFor] = useState(noticeKey)
  if (noticeFor !== noticeKey) {
    setNoticeFor(noticeKey)
    setNotice('')
  }

  function confirmWithdraw() {
    if (!position || !event) return
    const result = settleCoinWithdrawal(position, {
      creatorHandle: event.creatorHandle,
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
    <BottomSheet
      open={position !== null && event !== null}
      onClose={onClose}
      title="Retirer mes gains"
      subtitle={
        event ? `@${event.creatorHandle} · indice ${formatIndex(event.index)}` : undefined
      }
    >
      {position && event ? (
        <>
          <dl className="space-y-2 rounded-xl border bg-card p-3.5">
            <Row label="Coins concernés" value={formatCoins(position.coins)} />
            <Row label="Valeur d’un coin" value={formatPrice(event.coinValue)} />
            <Row
              label="Valeur théorique"
              value={formatPrice(position.theoreticalValue)}
            />
            <div className="border-t pt-2">
              <Row
                label="Crédit Wallet"
                value={formatPrice(position.payableNow)}
                strong
              />
            </div>
          </dl>

          <p className="rounded-xl bg-muted p-3.5 text-body">
            L’achat a débité votre Wallet. Le retrait crédite maintenant le montant
            payable ({formatPrice(position.payableNow)}) sur votre Wallet
            (démonstration · pool {formatPrice(event.poolBalance)}).
          </p>

          <Button
            type="button"
            className="w-full"
            disabled={!canPay}
            onClick={confirmWithdraw}
          >
            {requested
              ? 'Retrait effectué'
              : `Créditer ${formatPrice(position.payableNow)}`}
          </Button>
          <p
            role="status"
            className="text-center text-caption text-muted-foreground empty:hidden"
          >
            {notice || (requested ? 'Coins retirés · Wallet crédité.' : null)}
          </p>
        </>
      ) : null}
    </BottomSheet>
  )
}
