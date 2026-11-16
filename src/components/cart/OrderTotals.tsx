import type { ReactNode } from 'react'

import { formatPrice } from '@/lib/format'
import { cn } from '@/lib/utils'

interface OrderTotalsProps {
  count: number
  subtotal: number
  /** Réduction en FCFA ; `0` = aucune, `null` = décidée par le serveur. */
  discount: number | null
  /** Frais en FCFA ; `0` = aucun, `null` = calculés par le serveur. */
  fees: number | null
  /** Montant total à payer, indicatif : le serveur recalcule le montant débité. */
  total: number
  className?: string
}

function Row({
  label,
  children,
  strong,
}: {
  label: string
  children: ReactNode
  strong?: boolean
}) {
  return (
    <div className="flex items-baseline justify-between gap-3 py-1.5">
      <dt
        className={cn(
          'text-body',
          strong ? 'font-extrabold' : 'text-muted-foreground',
        )}
      >
        {label}
      </dt>
      <dd
        className={cn(
          'text-right tabular-nums',
          strong ? 'text-title font-extrabold' : 'text-body font-semibold',
        )}
      >
        {children}
      </dd>
    </div>
  )
}

/**
 * Récapitulatif d'une commande : nombre d'articles, sous-total, réductions, frais, total à
 * payer. Les réductions et frais viennent du serveur : tant qu'ils ne sont pas connus, on
 * l'indique au lieu d'inventer un montant.
 */
export function OrderTotals({
  count,
  subtotal,
  discount,
  fees,
  total,
  className,
}: OrderTotalsProps) {
  return (
    <dl className={cn('divide-y divide-dashed', className)}>
      <Row label="Articles">{count}</Row>
      <Row label="Sous-total">{formatPrice(subtotal)}</Row>
      <Row label="Réductions">
        {discount === null ? (
          <span className="text-caption font-normal text-muted-foreground">
            Selon le serveur
          </span>
        ) : discount === 0 ? (
          'Aucune'
        ) : (
          `− ${formatPrice(discount)}`
        )}
      </Row>
      <Row label="Frais">
        {fees === null ? (
          <span className="text-caption font-normal text-muted-foreground">
            Calculés par le serveur
          </span>
        ) : fees === 0 ? (
          'Aucun'
        ) : (
          formatPrice(fees)
        )}
      </Row>
      <Row label="Total à payer" strong>
        {formatPrice(total)}
      </Row>
    </dl>
  )
}
