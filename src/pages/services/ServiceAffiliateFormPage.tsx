import { AffiliateProgramForm } from '@/components/affiliate/AffiliateProgramForm'
import { RubriquePage } from '@/components/services/RubriquePage'
import { useAffiliateProgram } from '@/hooks/use-affiliate'
import { useCurrentService } from '@/hooks/use-current-service'
import { useParams } from 'react-router-dom'

/** Création ou édition d’un programme d’affiliation. */
export function ServiceAffiliateFormPage() {
  const service = useCurrentService()
  const { programId } = useParams()
  const program = useAffiliateProgram(service.id, programId)
  const editing = Boolean(programId)

  return (
    <RubriquePage
      toolId="affiliation"
      title={editing ? 'Modifier le programme' : 'Créer un programme'}
      subtitle="Affiliation · configuration vendeur"
      showProgress={false}
    >
      <AffiliateProgramForm
        serviceId={service.id}
        {...(program ? { program } : {})}
      />
    </RubriquePage>
  )
}
