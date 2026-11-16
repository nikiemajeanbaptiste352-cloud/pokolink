import { Link } from 'react-router-dom'

import { Button } from '@/components/ui/button'
import { formatPrice } from '@/lib/format'
import { paths } from '@/routes/paths'
import type { CoinEvent, CoinPosition } from '@/types/coin-market'

import { canRequestWithdrawal, formatCoins } from './coin-utils'

interface CoinPositionCardProps {
  position: CoinPosition
  event: CoinEvent
  /** Ajoute un lien vers l'événement (liste « Mes coins »). */
  showEventLink?: boolean
  onWithdraw: (position: CoinPosition) => void
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
      <dd className={strong ? 'text-body font-extrabold' : 'text-body font-semibold'}>
        {value}
      </dd>
    </div>
  )
}

/** Position du participant : montants du serveur, aucun calcul côté interface. */
export function CoinPositionCard({
  position,
  event,
  showEventLink = false,
  onWithdraw,
}: CoinPositionCardProps) {
  const started = event.state !== 'purchases_open' && event.state !== 'purchases_closed'
  const canWithdraw = canRequestWithdrawal(event) && position.coins > 0
  const limited = started && position.payableNow < position.theoreticalValue

  return (
    <article className="space-y-3 rounded-2xl border bg-card p-4 shadow-card">
      <div className="min-w-0">
        <h3 className="truncate text-body font-bold">
          {showEventLink ? (
            <Link
              to={paths.coinEvent(event.id)}
              className="-my-2 inline-flex min-h-11 max-w-full items-center truncate hover:underline"
            >
              {event.creatorName}
            </Link>
          ) : (
            'Mes coins'
          )}
        </h3>
        <p className="truncate text-caption text-muted-foreground">
          {showEventLink ? '@' + event.creatorHandle + ' · ' : ''}
          {formatCoins(position.coins + position.pendingCoins)} coin
          {position.coins + position.pendingCoins > 1 ? 's' : ''} détenu
          {position.coins + position.pendingCoins > 1 ? 's' : ''}
        </p>
      </div>

      <dl className="space-y-1.5">
        <Row label="Payé à l’achat" value={formatPrice(position.spent)} />
        <Row
          label="Valeur théorique (non garantie)"
          value={formatPrice(position.theoreticalValue)}
        />
        <Row
          label="Payable maintenant"
          value={
            event.state === 'suspended' || !started
              ? '—'
              : formatPrice(position.payableNow)
          }
          strong
        />
        {position.pendingCoins > 0 ? (
          <Row
            label={`Retrait en cours (${position.pendingCoins} coin${position.pendingCoins > 1 ? 's' : ''})`}
            value={`${formatPrice(position.pendingAmount)} réservés`}
          />
        ) : null}
        {position.withdrawnCoins > 0 ? (
          <Row
            label={`Déjà retiré (${position.withdrawnCoins} coin${position.withdrawnCoins > 1 ? 's' : ''})`}
            value={formatPrice(position.withdrawnAmount)}
          />
        ) : null}
      </dl>

      {position.pendingCoins > 0 ? (
        <p className="text-caption text-muted-foreground">
          Une demande en attente n’est pas un paiement terminé : le montant n’est versé
          qu’une fois le paiement confirmé.
        </p>
      ) : null}
      {limited && event.state === 'closing' ? (
        <p className="text-caption text-muted-foreground">
          Pool épuisé : rien n’est payable pour le moment. Vos coins sont conservés.
        </p>
      ) : limited && event.state === 'running' ? (
        <p className="text-caption text-muted-foreground">
          Montant limité par le solde actuel du pool.
        </p>
      ) : null}

      {event.state === 'running' ? (
        <Button
          type="button"
          variant="outline"
          className="min-h-11 w-full"
          disabled={!canWithdraw}
          onClick={() => onWithdraw(position)}
        >
          Retirer mes gains
        </Button>
      ) : null}
    </article>
  )
}
