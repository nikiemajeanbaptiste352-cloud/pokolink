import { NavItemLink } from '@/components/navigation/NavItemLink'
import { navItems } from '@/components/navigation/nav-items'
import { TEMP_COUNTS } from '@/lib/placeholder-data'
import type { NavItemId } from '@/types/navigation'

const badges: Partial<Record<NavItemId, number>> = { messages: TEMP_COUNTS.messages }

/**
 * Barre d’onglets fixe — style Facebook fluide (icônes + pastilles).
 * Masquée dès `md` (remplacée par le rail).
 */
export function BottomNav() {
  return (
    <nav
      aria-label="Rubriques principales"
      className="app-tabbar pb-safe z-40 shrink-0 border-t border-black/5 md:hidden"
    >
      <ul className="flex h-(--bottom-nav-height) w-full items-stretch">
        {navItems.map((item) => (
          <li key={item.id} className="min-w-0 flex-1">
            <NavItemLink item={item} badge={badges[item.id]} variant="tab" />
          </li>
        ))}
      </ul>
    </nav>
  )
}
