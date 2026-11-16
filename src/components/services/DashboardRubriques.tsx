import { Link, NavLink } from 'react-router-dom'

import { getServiceTool, SERVICE_TOOLS } from '@/lib/service-tools'
import type { RubriqueStat } from '@/lib/service-rubrique-stats'
import { cn } from '@/lib/utils'
import { paths } from '@/routes/paths'
import type { ServiceToolId } from '@/types/service'

const statusDot: Record<RubriqueStat['status'], string> = {
  ok: 'bg-brand',
  warn: 'bg-amber-500',
  idle: 'bg-muted-foreground/40',
}

const progressTone: Record<RubriqueStat['status'], string> = {
  ok: 'bg-brand',
  warn: 'bg-amber-500',
  idle: 'bg-muted-foreground/35',
}

/**
 * Navigation fixe des rubriques Espace Pro : chaque entrée affiche un chiffre
 * et une barre d’avancement de l’activité.
 */
export function DashboardRubriques({
  serviceId,
  stats,
}: {
  serviceId: string
  stats: readonly RubriqueStat[]
}) {
  const base = paths.service(serviceId)
  const byId = new Map(stats.map((s) => [s.id, s]))
  const tools = SERVICE_TOOLS.filter((tool) => tool.segment !== '' && tool.id !== 'notifications')

  return (
    <nav
      aria-label="Rubriques de l’établissement"
      className="sticky top-16 z-10 flex max-h-[calc(100dvh-4rem)] w-[8.25rem] shrink-0 flex-col border-r border-border/60 bg-card/80 backdrop-blur-xl sm:w-48"
    >
      <div className="hidden border-b border-border/50 px-3 pt-3 pb-2 sm:block">
        <p className="text-[10px] font-bold tracking-[0.14em] text-muted-foreground uppercase">
          Rubriques
        </p>
        <p className="mt-0.5 text-[11px] text-muted-foreground">Avancement par outil</p>
      </div>
      <ul className="flex-1 space-y-1 overflow-y-auto overscroll-contain p-1.5 sm:p-2">
        {tools.map((tool) => {
          const Icon = tool.icon
          const stat = byId.get(tool.id)
          const to = `${base}/${tool.segment}`
          return (
            <li key={tool.id}>
              <NavLink
                to={to}
                className={({ isActive }) =>
                  cn(
                    'group flex flex-col gap-1.5 rounded-2xl px-1.5 py-2 transition-all duration-200 sm:px-2.5',
                    isActive
                      ? 'bg-primary text-primary-foreground shadow-[0_10px_24px_-14px_var(--primary)]'
                      : 'hover:bg-muted/80',
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    <span className="flex items-center gap-1.5">
                      <span
                        className={cn(
                          'grid size-7 shrink-0 place-items-center rounded-xl transition-colors sm:size-8',
                          isActive
                            ? 'bg-primary-foreground/15 text-primary-foreground'
                            : 'bg-muted text-foreground group-hover:bg-background',
                        )}
                      >
                        <Icon className="size-3.5 sm:size-4" strokeWidth={1.75} aria-hidden="true" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span
                          className={cn(
                            'block truncate text-[11px] leading-tight font-bold sm:text-caption',
                            isActive ? 'text-primary-foreground' : 'text-foreground',
                          )}
                        >
                          {tool.label}
                        </span>
                        <span className="mt-0.5 flex items-center gap-1">
                          <span
                            className={cn(
                              'size-1.5 shrink-0 rounded-full',
                              isActive ? 'bg-primary-foreground/80' : statusDot[stat?.status ?? 'idle'],
                            )}
                            aria-hidden="true"
                          />
                          <span
                            className={cn(
                              'truncate text-[10px] sm:text-[11px]',
                              isActive
                                ? 'text-primary-foreground/75'
                                : 'text-muted-foreground',
                            )}
                          >
                            {stat ? `${stat.value} · ${stat.hint}` : tool.description}
                          </span>
                        </span>
                      </span>
                    </span>
                    <span
                      role="meter"
                      aria-label={`Avancement ${tool.label}`}
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-valuenow={stat?.progress ?? 0}
                      className={cn(
                        'h-1 overflow-hidden rounded-full',
                        isActive ? 'bg-primary-foreground/25' : 'bg-muted',
                      )}
                    >
                      <span
                        className={cn(
                          'block h-full rounded-full transition-[width] duration-500 ease-out',
                          isActive
                            ? 'bg-primary-foreground'
                            : progressTone[stat?.status ?? 'idle'],
                        )}
                        style={{ width: `${stat?.progress ?? 0}%` }}
                      />
                    </span>
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

/** Cartes résumé (vue d’ensemble) : une par rubrique prioritaire. */
export function RubriqueOverviewCards({
  serviceId,
  stats,
  ids,
}: {
  serviceId: string
  stats: readonly RubriqueStat[]
  ids: readonly ServiceToolId[]
}) {
  const base = paths.service(serviceId)
  const byId = new Map(stats.map((s) => [s.id, s]))

  return (
    <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-3">
      {ids.map((id) => {
        const tool = getServiceTool(id)
        const stat = byId.get(id)
        const Icon = tool.icon
        const segment = tool.segment
        if (!segment || !stat) return null
        return (
          <li key={id}>
            <Link
              to={`${base}/${segment}`}
              className="flex h-full flex-col gap-2 rounded-2xl border border-border/70 bg-card/90 p-2.5 shadow-[0_8px_24px_-20px_rgba(15,23,42,0.35)] transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-[0_14px_32px_-22px_rgba(15,23,42,0.4)] sm:gap-2.5 sm:p-3"
            >
              <span className="flex items-center justify-between gap-2">
                <span className="flex min-w-0 items-center gap-2">
                  <span className="grid size-8 shrink-0 place-items-center rounded-xl bg-muted/80 ring-1 ring-border/60 sm:size-9">
                    <Icon className="size-3.5 sm:size-4" aria-hidden="true" />
                  </span>
                  <span className="min-w-0 truncate text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">
                    {tool.label}
                  </span>
                </span>
                <span
                  className={cn(
                    'size-2 shrink-0 rounded-full ring-2 ring-background',
                    statusDot[stat.status],
                  )}
                  title={stat.status}
                />
              </span>
              <span>
                <span className="block text-title font-extrabold tracking-tight tabular-nums">
                  {stat.value}
                </span>
                <span className="block truncate text-[11px] text-muted-foreground">
                  {stat.hint}
                </span>
              </span>
              <span className="mt-auto h-1.5 overflow-hidden rounded-full bg-muted">
                <span
                  className={cn(
                    'block h-full rounded-full transition-[width] duration-500 ease-out',
                    progressTone[stat.status],
                  )}
                  style={{ width: `${stat.progress}%` }}
                />
              </span>
            </Link>
          </li>
        )
      })}
    </ul>
  )
}
