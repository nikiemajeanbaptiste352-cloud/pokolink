import { Link, useParams } from 'react-router-dom'

import { AffiliatePartnerCard } from '@/components/affiliate/AffiliatePartnerCard'
import { BackLink } from '@/components/common/BackLink'
import { EmptyState } from '@/components/common/EmptyState'
import { PageHeader } from '@/components/common/PageHeader'
import { buttonVariants } from '@/components/ui/button'
import { useAllAffiliateMemberships } from '@/hooks/use-affiliate'
import { Handshake } from 'lucide-react'
import { paths } from '@/routes/paths'

/** Détail d’un partenariat affilié (lien + perfs). */
export function StudioAffiliatePartnershipPage() {
  const { membershipId } = useParams()
  const all = useAllAffiliateMemberships()
  const membership = all.find((m) => m.id === membershipId)

  return (
    <>
      <PageHeader
        title="Mon partenariat"
        leading={
          <BackLink
            to={paths.studioAffiliate}
            label="Affiliation"
            history
          />
        }
      />
      <div className="px-4 py-4">
        {membership ? (
          <AffiliatePartnerCard membership={membership} />
        ) : (
          <EmptyState
            icon={Handshake}
            title="Partenariat introuvable"
            description="Ce partenariat n’existe pas ou a été retiré."
            action={
              <Link to={paths.studioAffiliate} className={buttonVariants()}>
                Retour Affiliation
              </Link>
            }
            className="py-12"
          />
        )}
      </div>
    </>
  )
}
