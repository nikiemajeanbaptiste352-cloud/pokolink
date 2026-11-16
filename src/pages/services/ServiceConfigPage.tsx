import { useSearchParams } from 'react-router-dom'

import { DeleteServiceSection } from '@/components/services/config/DeleteServiceSection'
import { ServiceConfigWizard } from '@/components/services/config/ServiceConfigWizard'
import { useCurrentService } from '@/hooks/use-current-service'

/**
 * Étapes 2 à 8 de la création (brouillon), puis outil « Configuration » de l'espace pro.
 * `?etape=8` ouvre directement une étape d'un service actif (ex. le QR code).
 */
export function ServiceConfigPage() {
  const service = useCurrentService()
  const [searchParams] = useSearchParams()
  const isDraft = service.status === 'draft'
  const requested = Number(searchParams.get('etape'))
  const initialStep = isDraft
    ? service.setupStep
    : Number.isInteger(requested) && requested > 0
      ? requested - 1
      : 0

  return (
    <>
      <ServiceConfigWizard key={service.id} service={service} initialStep={initialStep} />
      {/* Disponible aussi pour un brouillon : on peut abandonner une création. */}
      <DeleteServiceSection service={service} />
    </>
  )
}
