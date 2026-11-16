import { ArrowLeft } from 'lucide-react'
import { Link, useLocation, useNavigate } from 'react-router-dom'

import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface BackLinkProps {
  to: string
  /** Destination, pour le libellé accessible (ex. « Mes services »). */
  label: string
  /**
   * Revient à l'écran PRÉCÉDENT de l'historique (Accueil, Explorer, fil d'origine…) quand
   * l'utilisateur vient d'ailleurs dans l'application ; `to` ne sert que si la page a été
   * ouverte directement (lien partagé, rechargement).
   */
  history?: boolean
  className?: string
}

/** Bouton retour rond (44px) : lien vers l'écran parent, ou retour dans l'historique. */
export function BackLink({ to, label, history = false, className }: BackLinkProps) {
  const navigate = useNavigate()
  const location = useLocation()
  const canGoBack = history && location.key !== 'default'

  return (
    <Link
      to={to}
      aria-label={`Retour : ${label}`}
      onClick={
        canGoBack
          ? (event) => {
              event.preventDefault()
              navigate(-1)
            }
          : undefined
      }
      className={cn(buttonVariants({ variant: 'ghost', size: 'icon' }), className)}
    >
      <ArrowLeft className="size-5" aria-hidden="true" />
    </Link>
  )
}
