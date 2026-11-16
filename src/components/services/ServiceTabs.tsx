import { useEffect, useMemo } from 'react'
import { NavLink, useLocation } from 'react-router-dom'

import { useAdCampaigns } from '@/hooks/use-ad-campaigns'
import { useProExtras } from '@/hooks/use-pro-extras'
import { useServiceOrders } from '@/hooks/use-service-orders'
import { useService, useServiceItems } from '@/hooks/use-services'
import { getRubriqueStats } from '@/lib/service-rubrique-stats'
import { SERVICE_TOOLS } from '@/lib/service-tools'
import { cn } from '@/lib/utils'
import { paths } from '@/routes/paths'
import type { Service } from '@/types/service'

/**
 * Navigation fixe (sticky) entre les outils d’un service.
 * Chaque rubrique affiche une barre d’avancement de l’activité.
 */
export function ServiceTabs({ serviceId }: { serviceId: string }) {
  const service = useService(serviceId)
  if (!service) return null
  return <ServiceTabsInner service={service} />
}

function ServiceTabsInner({ service }: { service: Service }) {
  const base = paths.service(service.id)
  const { pathname } = useLocation()
  const items = useServiceItems(service.id)
  const orders = useServiceOrders(service)
  const { data: extras } = useProExtras(service)
  const campaigns = useAdCampaigns(service.id)

  const stats = useMemo(
    () => getRubriqueStats({ service, items, orders, extras, campaigns }),
    [service, items, orders, extras, campaigns],
  )
  const byId = useMemo(() => new Map(stats.map((s) => [s.id, s])), [stats])

  useEffect(() => {
    const active = document.querySelector<HTMLElement>(
      '[data-service-tabs] [aria-current="page"]',
    )
    active?.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' })
  }, [pathname])

  return (
    <nav
      aria-label="Outils de l’établissement"
      data-service-tabs
      className="sticky top-16 z-10 min-w-0 border-b border-border/60 bg-background/80 backdrop-blur-xl"
    >
      <ul className="flex w-full min-w-0 gap-1.5 overflow-x-auto overscroll-x-contain px-3 py-2.5 pe-5 [scrollbar-width:thin] sm:px-4">
        {SERVICE_TOOLS.filter((tool) => tool.id !== 'notifications').map((tool) => {
          const Icon = tool.icon
          const stat = tool.id === 'dashboard' ? null : byId.get(tool.id)
          return (
            <li key={tool.id} className="shrink-0">
              <NavLink
                to={tool.segment ? `${base}/${tool.segment}` : base}
                end={tool.segment === ''}
                className={({ isActive }) =>
                  cn(
                    'inline-flex h-12 min-w-[5.75rem] flex-col justify-center gap-1 rounded-2xl px-3 transition-all duration-200',
                    isActive
                      ? 'bg-primary text-primary-foreground shadow-[0_10px_24px_-14px_var(--primary)]'
                      : 'border border-border/60 bg-card/80 text-secondary-foreground hover:bg-muted',
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    <span className="inline-flex items-center gap-1.5 text-[12px] font-bold whitespace-nowrap">
                      <Icon className="size-3.5 shrink-0" aria-hidden="true" />
                      {tool.label}
                    </span>
                    {stat ? (
                      <span
                        className={cn(
                          'h-1 w-full overflow-hidden rounded-full',
                          isActive ? 'bg-primary-foreground/30' : 'bg-muted',
                        )}
                      >
                        <span
                          className={cn(
                            'block h-full rounded-full transition-[width] duration-500',
                            isActive ? 'bg-primary-foreground' : 'bg-brand',
                          )}
                          style={{ width: `${stat.progress}%` }}
                        />
                      </span>
                    ) : (
                      <span
                        className={cn(
                          'text-[10px] font-medium',
                          isActive ? 'text-primary-foreground/80' : 'text-muted-foreground',
                        )}
                      >
                        Vue d’ensemble
                      </span>
                    )}
                  </>
                )}
              </NavLink>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
