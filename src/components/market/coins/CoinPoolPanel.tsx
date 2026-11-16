import { TriangleAlert } from 'lucide-react'

import {
  MARKET_CREATOR_COMMISSION_RATE,
  MARKET_PLATFORM_COMMISSION_RATE,
  marketCreatorCommission,
  marketPlatformCommission,
} from '@/lib/market-commissions'
import { formatPrice } from '@/lib/format'
import { cn } from '@/lib/utils'
import type { CoinEvent } from '@/types/coin-market'

import { formatCoins, isPoolShort } from './coin-utils'

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
      <dd className={cn('text-body', strong ? 'font-extrabold' : 'font-semibold')}>
        {value}
      </dd>
    </div>
  )
}

/**
 * Pool de l'événement : ce qui a été collecté, payé, réservé et ce qui reste. Montants
 * fournis par le serveur. Les barres ne servent qu'à la lecture : le texte porte l'information.
 */
export function CoinPoolPanel({ event }: { event: CoinEvent }) {
  const share = (value: number) =>
    event.poolCollected > 0 ? `${(value / event.poolCollected) * 100}%` : '0%'
  const short = isPoolShort(event)
  const started = event.state !== 'purchases_open' && event.state !== 'purchases_closed'
  const creatorFee = marketCreatorCommission(event.poolCollected)
  const platform = marketPlatformCommission(event.poolCollected)

  return (
    <div className="space-y-3 rounded-2xl border bg-card p-4 shadow-card">
      <div className="flex items-end justify-between gap-3">
        <div>
          <p className="text-caption text-muted-foreground">Solde du pool</p>
          <p className="text-2xl leading-none font-extrabold tabular-nums">
            {formatPrice(event.poolBalance)}
          </p>
        </div>
        <p className="text-caption font-bold text-muted-foreground">
          {event.participants} participants
        </p>
      </div>

      <div
        aria-hidden="true"
        className="flex h-2.5 overflow-hidden rounded-full bg-muted"
      >
        <span
          className="bg-muted-foreground/60"
          style={{ width: share(event.poolPaid) }}
        />
        <span
          className="bg-muted-foreground/30"
          style={{ width: share(event.poolReserved) }}
        />
        <span className="bg-brand" style={{ width: share(event.poolBalance) }} />
      </div>

      <dl className="space-y-1.5">
        <Row
          label="Collecté (achats confirmés)"
          value={formatPrice(event.poolCollected)}
        />
        <Row label="Retraits payés" value={formatPrice(event.poolPaid)} />
        <Row
          label="Réservé (retraits en cours)"
          value={formatPrice(event.poolReserved)}
        />
        <Row
          label={`Commission créateur (${Math.round(MARKET_CREATOR_COMMISSION_RATE * 100)} %)`}
          value={formatPrice(creatorFee)}
        />
        <Row
          label={`Commission plateforme (${Math.round(MARKET_PLATFORM_COMMISSION_RATE * 100)} %)`}
          value={formatPrice(platform)}
        />
        <div className="border-t pt-2">
          <Row label="Solde distribuable" value={formatPrice(event.poolBalance)} strong />
        </div>
        {started ? (
          <>
            <Row label="Coins encore détenus" value={formatCoins(event.heldCoins)} />
            <Row
              label="Valeur théorique de ces coins"
              value={formatPrice(event.heldTheoreticalValue)}
            />
          </>
        ) : null}
      </dl>

      {started && short && event.state !== 'closed' ? (
        <div
          role="status"
          className="flex items-start gap-3 rounded-xl bg-warning/20 p-3.5 text-foreground"
        >
          <TriangleAlert className="mt-0.5 size-5 shrink-0" aria-hidden="true" />
          <p className="text-body">
            <strong>Le solde ne couvre pas tous les coins.</strong> Les retraits sont
            payés tant qu’il reste des fonds : si tous les détenteurs retiraient, les
            derniers pourraient recevoir moins que la valeur théorique, voire rien.
          </p>
        </div>
      ) : null}
    </div>
  )
}
