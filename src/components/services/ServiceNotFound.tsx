import { Store } from 'lucide-react'
import { Link } from 'react-router-dom'

import { EmptyState } from '@/components/common/EmptyState'
import { buttonVariants } from '@/components/ui/button'
import { paths } from '@/routes/paths'

/** Affiché quand l'identifiant d'un service ne correspond à aucun établissement. */
export function ServiceNotFound({ backTo = paths.profile }: { backTo?: string }) {
  return (
    <EmptyState
      icon={Store}
      title="Établissement introuvable"
      description="Ce service n’existe pas ou a été supprimé."
      action={
        <Link to={backTo} className={buttonVariants({ variant: 'default' })}>
          Retour
        </Link>
      }
      className="py-20"
    />
  )
}
