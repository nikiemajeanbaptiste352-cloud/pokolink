import { Droplets, Pause, TriangleAlert } from 'lucide-react'

import { cn } from '@/lib/utils'
import type { PoolState } from '@/types/market'

import { formatCoverage } from './market-utils'

interface PoolStatusProps {
  poolState: PoolState
  coverageRatio: number
  /** Version courte (une ligne) pour les cartes. */
  compact?: boolean
  className?: string
}

/** Liquidité du pool, telle que fournie par le serveur. Aucun calcul ici. */
export function PoolStatus({
  poolState,
  coverageRatio,
  compact = false,
  className,
}: PoolStatusProps) {
  if (poolState === 'covered') {
    if (compact) return null
    return (
      <div
        role="status"
        className={cn('flex items-start gap-3 rounded-xl bg-muted p-3.5', className)}
      >
        <Droplets className="mt-0.5 size-5 shrink-0" aria-hidden="true" />
        <div className="min-w-0 space-y-1">
          <p className="text-body font-bold">Pool couvert</p>
          <p className="text-body">
            Les retraits sont payés à 100 % du montant net, dans la limite des fonds du
            pool.
          </p>
        </div>
      </div>
    )
  }

  const limited = poolState === 'limited'
  const Icon = limited ? TriangleAlert : Pause
  const title = limited
    ? `Liquidité limitée : ${formatCoverage(coverageRatio)} payable`
    : 'Paiements suspendus'

  if (compact) {
    return (
      // Pas de `cn` : tailwind-merge retirerait `text-caption` si `className` porte une couleur.
      <span
        className={`flex items-center gap-1.5 text-caption font-bold ${className ?? ''}`}
      >
        <Icon className="size-4 shrink-0" aria-hidden="true" />
        {title}
      </span>
    )
  }

  return (
    <div
      role="status"
      className={cn('flex items-start gap-3 rounded-xl bg-warning/20 p-3.5', className)}
    >
      <Icon className="mt-0.5 size-5 shrink-0" aria-hidden="true" />
      <div className="min-w-0 space-y-1">
        <p className="text-body font-bold">{title}</p>
        {limited ? (
          <p className="text-body">
            Le pool ne couvre pas tous les montants demandés. Chaque retrait est payé au
            même taux ({formatCoverage(coverageRatio)}), quelle que soit l’heure de la
            demande. Les nouvelles positions sont bloquées tant que le pool n’est pas
            rééquilibré.
          </p>
        ) : (
          <p className="text-body">
            Aucun paiement pour le moment. Vos positions et les montants qui vous sont dus
            sont conservés.
          </p>
        )}
      </div>
    </div>
  )
}
