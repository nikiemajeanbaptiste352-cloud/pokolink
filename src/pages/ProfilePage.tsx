import { Briefcase, Plus, Settings, Store } from 'lucide-react'
import { Link } from 'react-router-dom'

import { EmptyState } from '@/components/common/EmptyState'
import { IconLink } from '@/components/common/IconLink'
import { PageHeader } from '@/components/common/PageHeader'
import { ActivityChart } from '@/components/profile/ActivityChart'
import { ContentGrid } from '@/components/profile/ContentGrid'
import { PersonalToolCard } from '@/components/profile/PersonalToolCard'
import { ProfileHeader } from '@/components/profile/ProfileHeader'
import { WalletCard } from '@/components/profile/WalletCard'
import { ServiceCard } from '@/components/services/ServiceCard'
import { buttonVariants } from '@/components/ui/button'
import { useProfile } from '@/hooks/use-profile'
import { useProfileStats } from '@/hooks/use-profile-stats'
import { useServices } from '@/hooks/use-services'
import { useWalletBalances } from '@/hooks/use-wallet'
import { TEMP_PERSONAL_TOOLS } from '@/lib/placeholder-profile'
import { paths } from '@/routes/paths'

/** Ordre d’affichage professionnel des outils (mêmes liens, meilleure lecture). */
const TOOL_ORDER = [
  'creator',
  'affiliation',
  'learn',
  'rewards',
  'cart',
  'credits',
  'tickets',
  'historique',
] as const

/**
 * Hub profil pro : identité → Wallet → outils → services → contenu.
 */
export function ProfilePage() {
  const { services } = useServices()
  const profile = useProfile()
  const liveStats = useProfileStats(profile.handle)
  const wallet = useWalletBalances()

  const orderedTools = TOOL_ORDER.map((id) =>
    TEMP_PERSONAL_TOOLS.find((tool) => tool.id === id),
  ).filter((tool): tool is (typeof TEMP_PERSONAL_TOOLS)[number] => tool != null)

  return (
    <div className="profile-page pb-4">
      <PageHeader
        title="Profil"
        large
        className="bg-card/95 backdrop-blur-md"
        actions={
          <IconLink
            to={paths.settings}
            icon={Settings}
            label="Paramètres"
            variant="secondary"
            className="size-10 rounded-full border-0 bg-muted shadow-none"
          />
        }
      />

      <ProfileHeader
        profile={profile}
        liveStats={{
          posts: liveStats.posts,
          followers: liveStats.followers,
          following: liveStats.following,
        }}
      />

      <div className="mt-3 space-y-4 pb-2 sm:mt-4 sm:space-y-5">
        <WalletCard balance={wallet.available} />

        <section
          aria-labelledby="profile-tools-title"
          className="profile-section profile-section-delay-1 space-y-2 px-3 sm:px-4"
        >
          <h2
            id="profile-tools-title"
            className="text-[15px] font-extrabold tracking-tight"
          >
            Accès rapide
          </h2>
          <ul className="grid grid-cols-4 gap-1 rounded-2xl border border-border/70 bg-card p-1.5 sm:grid-cols-5">
            {orderedTools.map((tool) => (
              <li key={tool.id} className="min-w-0">
                <PersonalToolCard tool={tool} variant="hub" />
              </li>
            ))}
          </ul>
        </section>

        <section
          aria-labelledby="my-services-title"
          className="profile-section profile-section-delay-2 space-y-2.5"
        >
          <div className="flex items-center justify-between gap-3 px-3 sm:px-4">
            <h2
              id="my-services-title"
              className="text-[15px] font-extrabold tracking-tight"
            >
              Mes services
            </h2>
            {services.length > 0 ? (
              <Link
                to={paths.serviceNew}
                className={buttonVariants({
                  size: 'sm',
                  className: 'h-8 rounded-lg px-3 font-bold',
                })}
              >
                <Plus aria-hidden="true" className="size-4" />
                Créer
              </Link>
            ) : null}
          </div>

          {services.length === 0 ? (
            <EmptyState
              icon={Store}
              tone="gold"
              title="Aucun service"
              description="Créez une boutique, un restaurant ou un hôtel — chaque service a son Espace Pro."
              action={
                <Link
                  to={paths.serviceNew}
                  className={buttonVariants({
                    size: 'lg',
                    className: 'rounded-xl font-bold',
                  })}
                >
                  <Plus aria-hidden="true" />
                  Créer un service
                </Link>
              }
              className="py-8"
            />
          ) : (
            <div className="space-y-2 px-3 sm:px-4">
              <ul className="space-y-2">
                {services.map((service) => (
                  <li key={service.id}>
                    <ServiceCard service={service} />
                  </li>
                ))}
              </ul>
              <Link
                to={paths.proSpace}
                className={buttonVariants({
                  variant: 'outline',
                  className: 'h-11 w-full rounded-xl font-bold',
                })}
              >
                <Briefcase aria-hidden="true" />
                Ouvrir l’Espace Pro
              </Link>
            </div>
          )}
        </section>

        <ActivityChart handle={profile.handle} />

        <section
          aria-labelledby="profile-content-title"
          className="profile-section profile-section-delay-3 space-y-2"
        >
          <h2
            id="profile-content-title"
            className="px-3 text-[15px] font-extrabold tracking-tight sm:px-4"
          >
            Mon contenu
          </h2>
          <ContentGrid />
        </section>
      </div>
    </div>
  )
}
