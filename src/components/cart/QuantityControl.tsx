import { Minus, Plus } from 'lucide-react'

import { cn } from '@/lib/utils'

interface QuantityControlProps {
  name: string
  quantity: number
  max: number
  onChange: (quantity: number) => void
  /** `pill` : style Mon Panier (gris arrondi). */
  variant?: 'default' | 'pill'
}

/** Choix de la quantité d'un article du panier (retirer à 0 supprime la ligne). */
export function QuantityControl({
  name,
  quantity,
  max,
  onChange,
  variant = 'default',
}: QuantityControlProps) {
  const pill = variant === 'pill'

  return (
    <div
      role="group"
      aria-label={`Quantité : ${name}`}
      className={cn(
        'inline-flex items-center',
        pill && 'rounded-full bg-muted px-1',
      )}
    >
      <button
        type="button"
        onClick={() => onChange(quantity - 1)}
        aria-label={
          quantity <= 1 ? `Retirer ${name} du panier` : `Une unité de moins : ${name}`
        }
        className={cn(
          'grid place-items-center rounded-full hover:bg-muted',
          pill ? 'size-8 text-muted-foreground' : 'size-11',
        )}
      >
        <Minus className={pill ? 'size-3.5' : 'size-5'} aria-hidden="true" />
      </button>
      <span
        className={cn(
          'text-center font-extrabold tabular-nums',
          pill ? 'min-w-6 text-[13px]' : 'min-w-8 text-body',
        )}
        aria-live="polite"
      >
        {quantity}
      </span>
      <button
        type="button"
        disabled={quantity >= max}
        onClick={() => onChange(quantity + 1)}
        aria-label={`Une unité de plus : ${name}`}
        className={cn(
          'grid place-items-center rounded-full hover:bg-muted disabled:opacity-40',
          pill ? 'size-8 text-muted-foreground' : 'size-11',
        )}
      >
        <Plus className={pill ? 'size-3.5' : 'size-5'} aria-hidden="true" />
      </button>
    </div>
  )
}
