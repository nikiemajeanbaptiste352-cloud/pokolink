import { cn } from '@/lib/utils'

interface SwitchProps {
  checked: boolean
  onCheckedChange: (checked: boolean) => void
  /** Libellé accessible : le bouton n'a pas de texte visible. */
  label: string
  disabled?: boolean
  id?: string
  className?: string
  /** Classe de la piste quand l’interrupteur est activé (ex. accent orange paiement). */
  checkedTrackClassName?: string
}

/** Interrupteur : zone tactile de 44px, piste visuelle de 28px. */
export function Switch({
  checked,
  onCheckedChange,
  label,
  disabled,
  id,
  className,
  checkedTrackClassName,
}: SwitchProps) {
  return (
    <button
      id={id}
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onCheckedChange(!checked)}
      className={cn(
        'inline-flex h-11 w-14 shrink-0 items-center justify-center rounded-full disabled:opacity-50',
        className,
      )}
    >
      <span
        aria-hidden="true"
        className={cn(
          'flex h-7 w-12 items-center rounded-full p-0.5 transition-colors',
          checked
            ? cn('bg-primary', checkedTrackClassName)
            : 'bg-muted-foreground/40',
        )}
      >
        <span
          className={cn(
            'size-6 rounded-full bg-white shadow-card transition-transform',
            checked ? 'translate-x-5' : 'translate-x-0',
          )}
        />
      </span>
    </button>
  )
}
