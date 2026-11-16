import { Handshake } from 'lucide-react'

import { AffiliatePublicCard } from '@/components/affiliate/AffiliatePublicCard'
import { EmptyState } from '@/components/common/EmptyState'
import { usePublishedProgramsForService } from '@/hooks/use-affiliate'
import type { PublicPro } from '@/hooks/use-public-pro'
import { Link } from 'react-router-dom'
import { buttonVariants } from '@/components/ui/button'
import { paths } from '@/routes/paths'

/** Section affiliation du profil public vendeur. */
export function AffiliationTab({ pro }: { pro: PublicPro }) {
  const programs = usePublishedProgramsForService(pro.service.id)

  return (
    <section aria-label="Affiliation" className="space-y-4 px-4 py-4">
      <div>
        <h2 className="text-title font-extrabold">Programme d’affiliation</h2>
        <p className="text-body text-muted-foreground">
          Rejoignez immédiatement, obtenez votre lien personnel et gagnez une
          commission sur les paiements commerciaux attribués.
        </p>
      </div>

      {programs.length === 0 ? (
        <EmptyState
          icon={Handshake}
          title="Aucun programme publié"
          description="Ce vendeur n’a pas encore de programme d’affiliation ouvert."
          action={
            <Link to={paths.affiliateDiscover} className={buttonVariants()}>
              Découvrir d’autres programmes
            </Link>
          }
          className="py-10"
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
    </section>
  )
}
