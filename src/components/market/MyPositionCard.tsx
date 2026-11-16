import { Link } from 'react-router-dom'

import { Button } from '@/components/ui/button'
import { formatPrice } from '@/lib/format'
import { paths } from '@/routes/paths'
import type { CreatorMarket, UserPosition } from '@/types/market'

import { formatCote, formatSignedPrice } from './market-utils'

interface MyPositionCardProps {
  position: UserPosition
  market: CreatorMarket
  /** Ajoute un lien vers l'événement (liste « Mes positions »). */
  showEventLink?: boolean
  onWithdraw: (position: UserPosition) => void
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

/** Position du participant : montants fournis par le serveur, aucun calcul côté interface. */
export function MyPositionCard({
  position,
  market,
  showEventLink = false,
  onWithdraw,
}: MyPositionCardProps) {
  const sideLabel =
    position.side === 'yes' ? 'OUI · le facteur monte' : 'NON · le facteur baisse'
  const partial = position.payableNow < position.netValue
  const canWithdraw = market.poolState !== 'suspended'

  return (
    <article className="space-y-3 rounded-2xl border bg-card p-4 shadow-card">
      <div className="min-w-0">
        <h3 className="truncate text-body font-bold">
          {showEventLink ? (
            <Link
              to={paths.marketEvent(market.id)}
              className="-my-2 inline-flex min-h-11 max-w-full items-center truncate hover:underline"
            >
              {market.creatorName}
            </Link>
          ) : (
            sideLabel
          )}
        </h3>
        <p className="truncate text-caption text-muted-foreground">
          {showEventLink ? `${sideLabel} · ` : ''}entrée à{' '}
          {formatCote(position.entryCote)}
        </p>
      </div>

      <dl className="space-y-1.5">
        <Row label="Mise" value={formatPrice(position.stake)} />
        <Row label="Valeur actuelle" value={formatPrice(position.theoreticalValue)} />
        <Row label="Gain ou perte" value={formatSignedPrice(position.latent)} />
        <Row
          label="Payable maintenant"
          value={
            market.poolState === 'suspended'
              ? 'Suspendu'
              : formatPrice(position.payableNow)
          }
          strong
        />
      </dl>

      {partial && market.poolState !== 'suspended' ? (
        <p className="text-caption text-muted-foreground">
          Montant limité par la liquidité du pool (net demandé :{' '}
          {formatPrice(position.netValue)}).
        </p>
      ) : null}

      <Button
        type="button"
        variant="outline"
        className="min-h-11 w-full"
        disabled={!canWithdraw}
        onClick={() => onWithdraw(position)}
      >
        Retirer ma position
      </Button>
    </article>
  )
}
