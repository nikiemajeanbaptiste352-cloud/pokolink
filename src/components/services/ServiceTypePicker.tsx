import { useId } from 'react'

import { SERVICE_TYPES } from '@/lib/service-types'
import { toneSoft } from '@/lib/tones'
import { cn } from '@/lib/utils'
import type { ServiceType } from '@/types/service'

interface ServiceTypePickerProps {
  value: ServiceType | undefined
  onChange: (type: ServiceType) => void
  /** Libellé accessible du groupe. */
  label: string
  error?: string | undefined
}

/** Choix du type d'activité : boutons radio natifs présentés en tuiles. */
export function ServiceTypePicker({
  value,
  onChange,
  label,
  error,
}: ServiceTypePickerProps) {
  const name = useId()

  return (
    <fieldset aria-describedby={error ? `${name}-error` : undefined}>
      <legend className="mb-1.5 text-body font-semibold">{label}</legend>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {SERVICE_TYPES.map((meta) => {
          const Icon = meta.icon
          return (
            <label key={meta.id} className="relative flex">
              <input
                type="radio"
                name={name}
                value={meta.id}
                checked={value === meta.id}
                onChange={() => onChange(meta.id)}
                className="peer sr-only"
              />
              <span
                className={cn(
                  'flex min-h-28 w-full cursor-pointer flex-col items-start gap-2.5 rounded-xl border-2 bg-card p-3 shadow-card transition-colors hover:bg-muted',
                  'peer-checked:border-primary peer-checked:bg-accent peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-ring',
                )}
              >
                <span
                  className={cn(
                    'grid size-10 place-items-center rounded-xl',
                    toneSoft[meta.tone],
                  )}
                >
                  <Icon className="size-5" strokeWidth={1.75} aria-hidden="true" />
                </span>
                <span>
                  <span className="block text-body font-bold">{meta.label}</span>
                  <span className="block text-caption text-muted-foreground">
                    {meta.description}
                  </span>
                </span>
              </span>
            </label>
          )
        })}
      </div>
      {error ? (
        <p
          id={`${name}-error`}
          role="alert"
          className="mt-1.5 text-caption font-medium text-danger"
        >
          {error}
        </p>
      ) : null}
    </fieldset>
  )
}
