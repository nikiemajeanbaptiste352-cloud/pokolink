import type { LucideIcon } from 'lucide-react'

import { CountBadge } from '@/components/common/CountBadge'
import { Button, type ButtonProps } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface IconActionProps extends Omit<ButtonProps, 'children'> {
  icon: LucideIcon
  /** Libellé accessible (obligatoire : le bouton n'a pas de texte). */
  label: string
  count?: number
}

/** Bouton rond à icône seule, avec pastille de compteur optionnelle. */
export function IconAction({
  icon: Icon,
  label,
  count = 0,
  variant = 'secondary',
  className,
  ...props
}: IconActionProps) {
  return (
    <Button
      size="icon"
      variant={variant}
      // Le compteur est ajouté au libellé : `aria-label` remplace le contenu du bouton.
      aria-label={count > 0 ? `${label} (${count})` : label}
      className={cn('relative', className)}
      {...props}
    >
      <Icon className="size-5" />
      <CountBadge count={count} className="absolute -top-0.5 -right-0.5" />
    </Button>
  )
}
