import { NavLink, useLocation } from 'react-router-dom'

import { CountBadge } from '@/components/common/CountBadge'
import { navItems } from '@/components/navigation/nav-items'
import { cn } from '@/lib/utils'
import { paths } from '@/routes/paths'
import type { NavItem } from '@/types/navigation'

interface NavItemLinkProps {
  item: NavItem
  badge?: number
  className?: string
  /** `tab` = barre d’onglets mobile native ; défaut = rail bureau. */
  variant?: 'tab' | 'rail'
}

function prefixMatchLength(pathname: string, prefix: string): number {
  if (pathname === prefix || pathname.startsWith(`${prefix}/`)) return prefix.length
  return 0
}

/**
 * Onglet actif : le préfixe le plus long gagne (ex. `/afrilearn/moi` → Profil,
 * `/afrilearn/marche` → Explorer).
 */
function isSectionActive(item: NavItem, pathname: string): boolean {
  let bestLen = 0
  let bestId: string | null = null
  for (const candidate of navItems) {
    for (const prefix of candidate.activePrefixes ?? []) {
      const len = prefixMatchLength(pathname, prefix)
      if (len > bestLen) {
        bestLen = len
        bestId = candidate.id
      }
    }
  }
  return bestId === item.id
}

/**
 * Entrée de navigation.
 * - tab : onglet fixe bas (app mobile).
 * - rail : ligne latérale (tablette / bureau).
 */
export function NavItemLink({
  item,
  badge = 0,
  className,
  variant = 'rail',
}: NavItemLinkProps) {
  const { icon: Icon, label, to } = item
  const { pathname } = useLocation()
  const inSection = isSectionActive(item, pathname)
  const isTab = variant === 'tab'

  const badgeLabel =
    badge > 0 ? `${badge > 99 ? '99+' : badge} non lus, ${label}` : label

  return (
    <NavLink
      to={to}
      end={to === paths.home}
      aria-label={badge > 0 ? badgeLabel : undefined}
      className={({ isActive }) => {
        const active = isActive || inSection
        if (isTab) {
          return cn(
            'relative flex h-full min-w-0 flex-col items-center justify-center gap-0.5 px-0.5 no-underline transition-colors active:scale-[0.96]',
            active ? 'text-brand' : 'text-muted-foreground',
            className,
          )
        }
        return cn(
          'group flex min-h-12 w-full flex-col items-center justify-center gap-0.5 rounded-xl transition-colors',
          'lg:flex-row lg:justify-start lg:gap-3 lg:rounded-full lg:px-4',
          active ? 'lg:bg-accent' : 'lg:hover:bg-muted',
          className,
        )
      }}
    >
      {({ isActive: isExactActive }) => {
        const isActive = isExactActive || inSection
        if (isTab) {
          return (
            <>
              {isActive ? (
                <span className="nav-tab-active-bar" aria-hidden="true" />
              ) : null}
              <span className="relative grid size-8 place-items-center" aria-hidden="true">
                <Icon
                  className="size-[1.45rem]"
                  strokeWidth={isActive ? 2.4 : 1.65}
                />
                <CountBadge count={badge} className="absolute -top-0.5 -right-2" />
              </span>
              <span
                className={cn(
                  'max-w-full truncate text-[10px] leading-none',
                  isActive ? 'font-extrabold' : 'font-medium',
                )}
              >
                {label}
              </span>
            </>
          )
        }

        return (
          <>
            <span
              aria-hidden="true"
              className={cn(
                'relative grid h-8 w-14 place-items-center rounded-full transition-colors lg:h-auto lg:w-auto',
                isActive
                  ? 'bg-accent text-accent-foreground lg:bg-transparent'
                  : 'text-muted-foreground group-hover:bg-muted lg:group-hover:bg-transparent',
              )}
            >
              <Icon className="size-6" strokeWidth={isActive ? 2.25 : 1.75} />
              <CountBadge
                count={badge}
                className="absolute top-0 right-2 lg:-top-1.5 lg:-right-2"
              />
            </span>
            <span
              className={cn(
                'text-[11px] leading-tight lg:text-sm',
                isActive
                  ? 'font-bold text-brand'
                  : 'font-medium text-muted-foreground lg:text-foreground',
              )}
            >
              {label}
            </span>
          </>
        )
      }}
    </NavLink>
  )
}
