import { ClipboardList, BarChart3, Megaphone } from 'lucide-react'
import { Link, useSearchParams } from 'react-router-dom'

import { paths } from '@/routes/paths'
import { cn } from '@/lib/utils'

const ADS_TABS = [
  {
    id: 'tarifs-pub',
    label: 'Forfaits',
    to: paths.studioAdPlans,
    icon: Megaphone,
  },
  {
    id: 'stats-pub',
    label: 'Statistiques',
    to: paths.studioAdStats,
    icon: BarChart3,
  },
  {
    id: 'commandes-pub',
    label: 'Commandes',
    to: paths.studioAdOrders,
    icon: ClipboardList,
  },
] as const

/**
 * Sous-navigation claire des 3 rubriques publicitaires du Creator Studio.
 */
export function StudioAdsNav() {
  const [params] = useSearchParams()
  const current = params.get('onglet')

  return (
    <nav
      aria-label="Publicité · Creator Studio"
      className="min-w-0 px-4"
    >
      <p className="mb-2 text-[11px] font-bold tracking-wide text-muted-foreground uppercase">
        Publicité
      </p>
      <ul className="flex w-full min-w-0 gap-1.5 overflow-x-auto overscroll-x-contain pb-0.5 [scrollbar-width:thin]">
        {ADS_TABS.map((tab) => {
          const Icon = tab.icon
          const active = current === tab.id
          return (
            <li key={tab.id} className="min-w-0 flex-1">
              <Link
                to={tab.to}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'flex h-11 w-full items-center justify-center gap-1.5 rounded-xl border px-2 text-[13px] font-bold whitespace-nowrap transition-colors',
                  active
                    ? 'border-primary/30 bg-primary text-primary-foreground'
                    : 'border-border/60 bg-card text-secondary-foreground hover:bg-muted',
                )}
              >
                <Icon className="size-4 shrink-0" aria-hidden="true" />
                {tab.label}
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
