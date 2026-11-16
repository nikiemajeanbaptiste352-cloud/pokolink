import { Handshake } from 'lucide-react'
import { useEffect } from 'react'

import { AffiliatePublicCard } from '@/components/affiliate/AffiliatePublicCard'
import { BackLink } from '@/components/common/BackLink'
import { EmptyState } from '@/components/common/EmptyState'
import { PageHeader } from '@/components/common/PageHeader'
import { usePublishedAffiliatePrograms } from '@/hooks/use-affiliate'
import { useServices } from '@/hooks/use-services'
import { ensureDemoAffiliateProgram } from '@/lib/affiliate-store'
import { findDemoPro } from '@/lib/directory'
import { paths } from '@/routes/paths'

/**
 * Découverte publique des programmes d’affiliation publiés.
 */
export function AffiliateDiscoverPage() {
  const { services } = useServices()
  const programs = usePublishedAffiliatePrograms()

  useEffect(() => {
    for (const s of services) ensureDemoAffiliateProgram(s.id)
    // Seed aussi un vendeur démo courant si aucun service perso
    if (services.length === 0) {
      const demo = findDemoPro('boutique.alpha')
      if (demo) ensureDemoAffiliateProgram(demo.service.id)
    }
  }, [services])

  return (
    <>
      <PageHeader
        title="Découvrir les programmes"
        leading={<BackLink to={paths.explore} label="Explorer" history />}
      />
      <div className="space-y-3 px-4 py-4">
        <p className="text-body text-muted-foreground">
          Adhésion immédiate : consultez les conditions, rejoignez, recevez votre
          lien personnel. Aucune candidature.
        </p>
        {programs.length === 0 ? (
          <EmptyState
            icon={Handshake}
            title="Aucun programme"
            description="Les programmes publiés par les vendeurs apparaîtront ici."
            className="py-12"
          />
        ) : (
          <ul className="space-y-3">
            {programs.map((program) => (
              <li key={program.id}>
                <AffiliatePublicCard program={program} isCreator />
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  )
}
