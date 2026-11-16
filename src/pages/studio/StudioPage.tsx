import { Globe, Plus } from 'lucide-react'
import { Link, useSearchParams } from 'react-router-dom'

import { BackLink } from '@/components/common/BackLink'
import { FilterChips } from '@/components/common/FilterChips'
import { PageHeader } from '@/components/common/PageHeader'
import { ProfileWelcome } from '@/components/common/ProfileWelcome'
import { StudioAdOrdersTab } from '@/components/studio/ads/StudioAdOrdersTab'
import { StudioAdPlansTab } from '@/components/studio/ads/StudioAdPlansTab'
import { StudioAdStatsTab } from '@/components/studio/ads/StudioAdStatsTab'
import { StudioAdsNav } from '@/components/studio/ads/StudioAdsNav'
import { StudioAffiliatePanel } from '@/components/studio/affiliate/StudioAffiliatePanel'
import { StudioEventsTab } from '@/components/studio/StudioEventsTab'
import { StudioOverview } from '@/components/studio/StudioOverview'
import { StudioRevenueTab } from '@/components/studio/StudioRevenueTab'
import { StudioStatsTab } from '@/components/studio/StudioStatsTab'
import { buttonVariants } from '@/components/ui/button'
import { useStudioEvents } from '@/hooks/use-studio'
import { useProfile } from '@/hooks/use-profile'
import { paths } from '@/routes/paths'

type Tab =
  | 'apercu'
  | 'evenements'
  | 'statistiques'
  | 'revenus'
  | 'tarifs-pub'
  | 'stats-pub'
  | 'commandes-pub'
  | 'affiliation'

const TABS: readonly { id: Tab; label: string }[] = [
  { id: 'apercu', label: 'Aperçu' },
  { id: 'evenements', label: 'Événements' },
  { id: 'statistiques', label: 'Statistiques' },
  { id: 'revenus', label: 'Revenus' },
  { id: 'tarifs-pub', label: 'Forfaits pub' },
  { id: 'stats-pub', label: 'Stats pub' },
  { id: 'commandes-pub', label: 'Commandes pub' },
  { id: 'affiliation', label: 'Affiliation' },
]

const ADS_TABS: readonly Tab[] = ['tarifs-pub', 'stats-pub', 'commandes-pub']

function isTab(value: string | null): value is Tab {
  return TABS.some((tab) => tab.id === value)
}

/**
 * Creator Studio (Profil → Creator Studio) : l'espace du créateur pour proposer des événements
 * Creator Market, suivre leur historique et leurs statistiques. L'onglet est dans l'adresse
 * (`?onglet=`) pour pouvoir y revenir ou le partager.
 */
export function StudioPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const events = useStudioEvents()
  const profile = useProfile()
  const requested = searchParams.get('onglet')
  const tab: Tab = isTab(requested) ? requested : 'apercu'

  function selectTab(next: Tab) {
    setSearchParams(next === 'apercu' ? {} : { onglet: next }, { replace: true })
  }

  return (
    <>
      <ProfileWelcome
        name={profile.name}
        eyebrow="Creator Studio"
        subtitle={profile.handle ? `@${profile.handle}` : undefined}
        avatarSrc={profile.avatarSrc}
      />
      <PageHeader
        title="Creator Studio"
        leading={<BackLink to={paths.profile} label="Profil" history />}
        actions={
          <div className="flex items-center gap-2">
            <Link
              to={paths.creator(profile.handle)}
              className={buttonVariants({ variant: 'outline', size: 'sm' })}
            >
              <Globe aria-hidden="true" />
              Ma page<span className="sr-only"> publique</span>
            </Link>
            <Link to={paths.studioEventNew} className={buttonVariants({ size: 'sm' })}>
              <Plus aria-hidden="true" />
              Créer<span className="sr-only"> un événement</span>
            </Link>
          </div>
        }
      />

      <div className="min-w-0 space-y-4 py-4">
        <FilterChips
          label="Rubriques du Studio"
          items={TABS}
          value={tab}
          onChange={selectTab}
          className="pb-1 pe-6"
        />

        {ADS_TABS.includes(tab) ? <StudioAdsNav /> : null}

        {tab === 'apercu' ? (
          <StudioOverview events={events} onShowHistory={() => selectTab('evenements')} />
        ) : null}
        {tab === 'evenements' ? <StudioEventsTab events={events} /> : null}
        {tab === 'statistiques' ? <StudioStatsTab events={events} /> : null}
        {tab === 'revenus' ? <StudioRevenueTab events={events} /> : null}
        {tab === 'tarifs-pub' ? <StudioAdPlansTab /> : null}
        {tab === 'stats-pub' ? <StudioAdStatsTab /> : null}
        {tab === 'commandes-pub' ? <StudioAdOrdersTab /> : null}
        {tab === 'affiliation' ? <StudioAffiliatePanel /> : null}
      </div>
    </>
  )
}
