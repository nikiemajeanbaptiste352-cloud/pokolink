import { Handshake } from 'lucide-react'
import { Link } from 'react-router-dom'

import { AffiliatePartnerCard } from '@/components/affiliate/AffiliatePartnerCard'
import { AffiliatePublicCard } from '@/components/affiliate/AffiliatePublicCard'
import { EmptyState } from '@/components/common/EmptyState'
import { FilterChips } from '@/components/common/FilterChips'
import { StudioSection } from '@/components/studio/parts'
import { buttonVariants } from '@/components/ui/button'
import {
  useMyAffiliateMemberships,
  usePublishedAffiliatePrograms,
} from '@/hooks/use-affiliate'
import { useProfile } from '@/hooks/use-profile'
import { formatPrice } from '@/lib/format'
import { paths } from '@/routes/paths'
import { useSearchParams } from 'react-router-dom'

type AffTab =
  | 'decouvrir'
  | 'partenariats'
  | 'liens'
  | 'performances'
  | 'commissions'
  | 'historique'

const TABS: readonly { id: AffTab; label: string }[] = [
  { id: 'decouvrir', label: 'Découvrir' },
  { id: 'partenariats', label: 'Mes partenariats' },
  { id: 'liens', label: 'Mes liens' },
  { id: 'performances', label: 'Performances' },
  { id: 'commissions', label: 'Commissions' },
  { id: 'historique', label: 'Historique' },
]

function isAffTab(value: string | null): value is AffTab {
  return TABS.some((t) => t.id === value)
}

/**
 * Rubrique Creator Studio · Affiliation (côté affilié).
 * Sous-navigation indépendante ; ne modifie pas les autres rubriques Studio.
 */
export function StudioAffiliatePanel() {
  const [params, setParams] = useSearchParams()
  const raw = params.get('sous')
  const tab: AffTab = isAffTab(raw) ? raw : 'decouvrir'
  const profile = useProfile()
  const programs = usePublishedAffiliatePrograms()
  const mine = useMyAffiliateMemberships(profile.handle)

  function select(next: AffTab) {
    setParams(
      { onglet: 'affiliation', ...(next === 'decouvrir' ? {} : { sous: next }) },
      { replace: true },
    )
  }

  const totalCommissions = mine.reduce((s, m) => s + m.commissionsAmount, 0)

  return (
    <div className="space-y-4">
      <StudioSection
        title="Affiliation"
        description="Découvrez des programmes, rejoignez-les immédiatement et suivez vos liens."
      >
        <FilterChips
          label="Affiliation"
          items={TABS}
          value={tab}
          onChange={select}
          className="px-0"
        />
      </StudioSection>

      {tab === 'decouvrir' ? (
        <div className="space-y-3 px-4">
          <Link
            to={paths.affiliateDiscover}
            className="text-caption font-semibold text-brand hover:underline"
          >
            Ouvrir la page Découvrir
          </Link>
          {programs.length === 0 ? (
            <EmptyState
              icon={Handshake}
              title="Aucun programme"
              description="Les programmes publiés apparaîtront ici."
              className="py-8"
            />
          ) : (
            <ul className="space-y-3">
              {programs.map((p) => (
                <li key={p.id}>
                  <AffiliatePublicCard program={p} isCreator />
                </li>
              ))}
            </ul>
          )}
        </div>
      ) : null}

      {tab === 'partenariats' || tab === 'liens' ? (
        <div className="space-y-3 px-4">
          {mine.length === 0 ? (
            <EmptyState
              icon={Handshake}
              title="Aucun partenariat"
              description="Rejoignez un programme pour obtenir votre lien personnel."
              action={
                <button
                  type="button"
                  className={buttonVariants()}
                  onClick={() => select('decouvrir')}
                >
                  Découvrir les programmes
                </button>
              }
              className="py-8"
            />
          ) : (
            <ul className="space-y-3">
              {mine.map((m) => (
                <li key={m.id}>
                  <AffiliatePartnerCard membership={m} />
                </li>
              ))}
            </ul>
          )}
        </div>
      ) : null}

      {tab === 'performances' || tab === 'commissions' ? (
        <StudioSection
          title={tab === 'performances' ? 'Mes performances' : 'Mes commissions'}
          description="Agrégats de vos partenariats actifs."
        >
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-2xl border bg-card p-3.5 shadow-card">
              <p className="text-[11px] font-semibold text-muted-foreground uppercase">
                Programmes
              </p>
              <p className="text-title font-extrabold">{mine.length}</p>
            </div>
            <div className="rounded-2xl border bg-card p-3.5 shadow-card">
              <p className="text-[11px] font-semibold text-muted-foreground uppercase">
                Commissions
              </p>
              <p className="text-title font-extrabold tabular-nums">
                {formatPrice(totalCommissions)}
              </p>
            </div>
          </div>
          {mine.length > 0 ? (
            <ul className="space-y-3 pt-2">
              {mine.map((m) => (
                <li key={m.id}>
                  <AffiliatePartnerCard membership={m} />
                </li>
              ))}
            </ul>
          ) : null}
        </StudioSection>
      ) : null}

      {tab === 'historique' ? (
        <StudioSection
          title="Historique des paiements"
          description="Les ventes confirmées via un lien ?aff= créditent automatiquement votre portefeuille partenaire."
        >
          <EmptyState
            icon={Handshake}
            title="Pas encore d’historique"
            description="Dès qu’un acheteur paie après avoir cliqué votre lien, la commission apparaît ici et sur votre wallet."
            className="py-8"
          />
        </StudioSection>
      ) : null}
    </div>
  )
}
