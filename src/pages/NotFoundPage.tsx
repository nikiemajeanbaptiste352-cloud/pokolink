import { Link } from 'react-router-dom'

import { PageHeader } from '@/components/common/PageHeader'
import { buttonVariants } from '@/components/ui/button'
import { paths } from '@/routes/paths'

export function NotFoundPage() {
  return (
    <>
      <PageHeader title="Page introuvable" />
      <div className="flex flex-col items-center gap-4 px-6 py-20 text-center">
        <p className="text-body text-muted-foreground">
          Cette page n'existe pas ou a été déplacée.
        </p>
        <Link to={paths.home} className={buttonVariants()}>
          Retour à l'accueil
        </Link>
      </div>
    </>
  )
}
