import { Megaphone, Plus } from 'lucide-react'
import { Link } from 'react-router-dom'

import { AdPackCard } from '@/components/ads/AdPackCard'
import { CampaignCard } from '@/components/ads/CampaignCard'
import { EmptyState } from '@/components/common/EmptyState'
import { RubriquePage } from '@/components/services/RubriquePage'
import { buttonVariants } from '@/components/ui/button'
import { useAdCampaigns } from '@/hooks/use-ad-campaigns'
import { useCurrentService } from '@/hooks/use-current-service'
import { AD_PACKS } from '@/lib/ad-packs'
import { paths } from '@/routes/paths'

/**
 * Publicité : les campagnes du service et le point d'entrée du parcours de création.
 * Les forfaits et les résultats affichés viennent du serveur ; ici, ce sont des exemples.
 */
export function ServiceAdsPage() {
  const service = useCurrentService()
  const campaigns = useAdCampaigns(service.id)
  const createPath = paths.serviceAdNew(service.id)

  return (
    <RubriquePage
      toolId="ads"
      subtitle={`Campagnes sponsorisées · ${service.name}`}
      action={
        <Link to={createPath} className={buttonVariants()}>
          <Plus aria-hidden="true" />
          Créer<span className="sr-only"> une publicité</span>
        </Link>
      }
    >
      <section aria-labelledby="ads-campaigns" className="space-y-3">
        <div className="px-4">
          <h3 id="ads-campaigns" className="text-title font-extrabold tracking-tight">
            Mes campagnes
          </h3>
          <p className="text-caption text-muted-foreground">
            Suivi centralisé des publications sponsorisées et de leur diffusion.
          </p>
        </div>
        {campaigns.length === 0 ? (
          <EmptyState
            icon={Megaphone}
            tone="violet"
            title="Aucune campagne"
            description="Choisissez un forfait, rédigez votre annonce et lancez votre première campagne."
            action={
              <Link to={createPath} className={buttonVariants()}>
                <Plus aria-hidden="true" />
                Créer une publicité
              </Link>
            }
            className="py-8"
          />
        ) : (
          <ul className="space-y-3 px-4">
            {campaigns.map((campaign) => (
              <li key={campaign.id}>
                <CampaignCard campaign={campaign} />
              </li>
            ))}
          </ul>
        )}
      </section>

      <section aria-labelledby="ads-packs" className="space-y-3">
        <div className="px-4">
          <h3 id="ads-packs" className="text-title font-extrabold tracking-tight">
            Les forfaits publicitaires
          </h3>
          <p className="text-body text-muted-foreground">
            Chaque forfait fixe un nombre de vues, de visites et d’abonnements visés.
          </p>
        </div>
        <ul className="space-y-3 px-4">
          {AD_PACKS.map((pack) => (
            <li key={pack.id}>
              <AdPackCard pack={pack} />
            </li>
          ))}
        </ul>
      </section>
    </RubriquePage>
  )
}
