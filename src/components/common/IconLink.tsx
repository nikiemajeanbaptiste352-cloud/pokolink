import type { LucideIcon } from 'lucide-react'
import { Link, type LinkProps } from 'react-router-dom'

import { CountBadge } from '@/components/common/CountBadge'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface IconLinkProps extends Omit<LinkProps, 'children'> {
  icon: LucideIcon
  /** Libellé accessible (obligatoire : le lien n'a pas de texte). */
  label: string
  count?: number
  variant?: 'secondary' | 'ghost' | 'outline'
}

/** Lien rond à icône seule (même aspect que `IconAction`) qui ouvre un écran. */
export function IconLink({
  icon: Icon,
  label,
  count = 0,
  variant = 'secondary',
  className,
  ...props
}: IconLinkProps) {
  return (
    <Link
      aria-label={count > 0 ? `${label} (${count})` : label}
      className={cn(buttonVariants({ size: 'icon', variant }), 'relative', className)}
      {...props}
    >
      <Icon className="size-5" aria-hidden="true" />
      <CountBadge count={count} className="absolute -top-0.5 -right-0.5" />
    </Link>
  )
}
