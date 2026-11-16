import { Users } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'

import { AffiliateMemberCard } from '@/components/affiliate/AffiliateVendorCards'
import { EmptyState } from '@/components/common/EmptyState'
import { RubriquePage } from '@/components/services/RubriquePage'
import { buttonVariants } from '@/components/ui/button'
import {
  useAffiliateProgram,
  useProgramMemberships,
} from '@/hooks/use-affiliate'
import { useCurrentService } from '@/hooks/use-current-service'
import { setMembershipStatus } from '@/lib/affiliate-store'
import { paths } from '@/routes/paths'

/** Liste des affiliés d’un programme (Espace Pro). */
export function ServiceAffiliateMembersPage() {
  const service = useCurrentService()
  const { programId } = useParams()
  const program = useAffiliateProgram(service.id, programId)
  const members = useProgramMemberships(programId)

  return (
    <RubriquePage
      toolId="affiliation"
      title="Affiliés"
      subtitle={
        program
          ? `${program.name} · ${service.name}`
          : `Affiliation · ${service.name}`
      }
      showProgress={false}
      action={
        <Link
          to={paths.serviceAffiliate(service.id)}
          className={buttonVariants({ variant: 'outline', size: 'sm' })}
        >
          Retour programme
        </Link>
      }
    >
      {members.length === 0 ? (
        <EmptyState
          icon={Users}
          title="Aucun affilié"
          description="Dès qu’un utilisateur rejoint votre programme publié, son partenariat apparaît ici."
          className="py-10"
        />
      ) : (
        <ul className="space-y-3 px-4">
          {members.map((member) => (
            <li key={member.id}>
              <AffiliateMemberCard
                member={member}
                onSuspend={() => setMembershipStatus(member.id, 'suspended')}
                onReactivate={() => setMembershipStatus(member.id, 'active')}
              />
            </li>
          ))}
        </ul>
      )}
    </RubriquePage>
  )
}
