import { Handshake, Plus } from 'lucide-react'
import { Link } from 'react-router-dom'

import { AffiliateProgramSummaryCard } from '@/components/affiliate/AffiliateVendorCards'
import { EmptyState } from '@/components/common/EmptyState'
import { RubriquePage } from '@/components/services/RubriquePage'
import { buttonVariants } from '@/components/ui/button'
import {
  useAffiliatePrograms,
  useVendorAffiliateStats,
} from '@/hooks/use-affiliate'
import { useCurrentService } from '@/hooks/use-current-service'
import { setAffiliateProgramStatus } from '@/lib/affiliate-store'
import { paths } from '@/routes/paths'
import type { AffiliateProgram } from '@/types/affiliate'

/**
 * Espace Pro · Affiliation : programmes du vendeur (création, synthèse, actions).
 */
export function ServiceAffiliatePage() {
  const service = useCurrentService()
  const programs = useAffiliatePrograms(service.id)

  return (
    <RubriquePage
      toolId="affiliation"
      subtitle={`Programme d’affiliation · ${service.name}`}
      showProgress={false}
      action={
        <Link
          to={paths.serviceAffiliateNew(service.id)}
          className={buttonVariants()}
        >
          <Plus aria-hidden="true" />
          Créer un programme
        </Link>
      }
    >
      {programs.length === 0 ? (
        <EmptyState
          icon={Handshake}
          tone="brand"
          title="Aucun programme"
          description="Créez votre programme d’affiliation : les affiliés rejoignent immédiatement et reçoivent un lien personnel."
          action={
            <Link
              to={paths.serviceAffiliateNew(service.id)}
              className={buttonVariants({ size: 'lg' })}
            >
              <Plus aria-hidden="true" />
              Créer un programme
            </Link>
          }
          className="py-10"
        />
      ) : (
        <ul className="space-y-4 px-4">
          {programs.map((program) => (
            <li key={program.id}>
              <ProgramRow serviceId={service.id} program={program} />
            </li>
          ))}
        </ul>
      )}
    </RubriquePage>
  )
}

function ProgramRow({
  serviceId,
  program,
}: {
  serviceId: string
  program: AffiliateProgram
}) {
  const stats = useVendorAffiliateStats(program.id)
  return (
    <AffiliateProgramSummaryCard
      program={program}
      stats={stats}
      serviceId={serviceId}
      onSuspend={() => setAffiliateProgramStatus(program.id, 'suspended')}
      onReactivate={() => setAffiliateProgramStatus(program.id, 'published')}
    />
  )
}
