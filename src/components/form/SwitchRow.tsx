import { useId } from 'react'

import { Switch } from '@/components/ui/switch'

interface SwitchRowProps {
  label: string
  description?: string
  checked: boolean
  onCheckedChange: (checked: boolean) => void
}

/** Ligne « libellé + interrupteur » pour les réglages oui/non. */
export function SwitchRow({
  label,
  description,
  checked,
  onCheckedChange,
}: SwitchRowProps) {
  const id = useId()

  return (
    <div className="flex min-h-14 items-center justify-between gap-3">
      <div className="min-w-0">
        <label htmlFor={id} className="block text-body font-semibold">
          {label}
        </label>
        {description ? (
          <p className="text-caption text-muted-foreground">{description}</p>
        ) : null}
      </div>
      <Switch id={id} label={label} checked={checked} onCheckedChange={onCheckedChange} />
    </div>
  )
}
