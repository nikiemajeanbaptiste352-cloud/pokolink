import { Check } from 'lucide-react'

import { formatCount, formatNumber, formatPrice } from '@/lib/format'
import { cn } from '@/lib/utils'
import type { AdPack } from '@/types/ads'

interface AdPackCardProps {
  pack: AdPack
  /** Si fourni, la carte devient un choix (bouton radio) du parcours de création. */
  selected?: boolean
  onSelect?: () => void
}

/** Un forfait publicitaire : prix, objectifs de diffusion et budget Rewards de la campagne. */
export function AdPackCard({ pack, selected, onSelect }: AdPackCardProps) {
  const body = (
    <>
      <span className="flex items-start justify-between gap-3">
        <span className="min-w-0">
          <span className="block text-title font-extrabold">{pack.label}</span>
          <span className="block text-headline font-extrabold tabular-nums">
            {formatPrice(pack.price)}
          </span>
        </span>
        {onSelect ? (
          <span
            aria-hidden="true"
            className={cn(
              'grid size-6 shrink-0 place-items-center rounded-full border-2',
              selected ? 'border-brand bg-brand text-brand-foreground' : 'border-border',
            )}
          >
            {selected ? <Check className="size-4" /> : null}
          </span>
        ) : null}
      </span>
      <span className="mt-3 grid grid-cols-3 gap-2 text-center">
        {(
          [
            ['Vues', pack.targets.views],
            ['Visites', pack.targets.visits],
            ['Abonnés', pack.targets.subscribers],
          ] as const
        ).map(([label, value]) => (
          <span key={label} className="min-w-0 rounded-lg bg-muted px-1 py-1.5">
            <span className="block truncate text-body font-extrabold">
              {formatCount(value)}
            </span>
            <span className="block truncate text-caption text-muted-foreground">
              {label}
            </span>
          </span>
        ))}
      </span>
      <span className="mt-3 block text-caption text-muted-foreground">
        Budget Rewards : {formatPrice(pack.rewardBudget)} (
        {formatNumber(pack.rewardPoints)} points nominaux)
      </span>
    </>
  )

  const base = 'block w-full rounded-2xl border bg-card p-4 text-left shadow-card'

  if (!onSelect) return <div className={base}>{body}</div>

  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      onClick={onSelect}
      className={cn(base, 'min-h-11', selected && 'border-brand ring-2 ring-brand/30')}
    >
      {body}
    </button>
  )
}
