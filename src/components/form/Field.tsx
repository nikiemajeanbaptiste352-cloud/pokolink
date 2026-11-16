import type { ReactNode } from 'react'

import { cn } from '@/lib/utils'

interface FieldControlProps {
  id: string
  'aria-invalid': boolean
  'aria-describedby': string | undefined
}

interface FieldProps {
  id: string
  label: string
  /** Message d'erreur de validation (Zod via React Hook Form). */
  error?: string | undefined
  hint?: string
  /** Champ facultatif : ajoute « (facultatif) » au libellé. */
  optional?: boolean
  /** Reçoit les attributs d'accessibilité à poser sur le contrôle. */
  children: (control: FieldControlProps) => ReactNode
  className?: string
}

/** Libellé + contrôle + aide + erreur, reliés pour les lecteurs d'écran. */
export function Field({
  id,
  label,
  error,
  hint,
  optional,
  children,
  className,
}: FieldProps) {
  const hintId = hint ? `${id}-hint` : undefined
  const errorId = error ? `${id}-error` : undefined
  const describedBy = [hintId, errorId].filter(Boolean).join(' ') || undefined

  return (
    <div className={cn('space-y-1', className)}>
      <label htmlFor={id} className="block text-[12px] font-semibold text-muted-foreground">
        {label}
        {optional ? (
          <span className="font-normal"> · facultatif</span>
        ) : null}
      </label>
      {children({ id, 'aria-invalid': Boolean(error), 'aria-describedby': describedBy })}
      {hint ? (
        <p id={hintId} className="text-[11px] text-muted-foreground">
          {hint}
        </p>
      ) : null}
      {error ? (
        <p id={errorId} role="alert" className="text-[12px] font-medium text-danger">
          {error}
        </p>
      ) : null}
    </div>
  )
}
