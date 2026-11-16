import type { LucideIcon } from 'lucide-react'
import type * as React from 'react'

import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

interface InputWithIconProps extends React.ComponentProps<'input'> {
  icon: LucideIcon
}

/** Champ de saisie avec une icône à gauche (téléphone, carte, utilisateurs…). */
export function InputWithIcon({ icon: Icon, className, ...props }: InputWithIconProps) {
  return (
    <div className="relative">
      <Icon
        className="pointer-events-none absolute top-1/2 left-3.5 size-5 -translate-y-1/2 text-muted-foreground"
        aria-hidden="true"
      />
      <Input className={cn('pl-11', className)} {...props} />
    </div>
  )
}
