import { Logo } from '@/components/common/Logo'
import { NavItemLink } from '@/components/navigation/NavItemLink'
import { navItems } from '@/components/navigation/nav-items'
import { TEMP_COUNTS } from '@/lib/placeholder-data'
import type { NavItemId } from '@/types/navigation'

const badges: Partial<Record<NavItemId, number>> = { messages: TEMP_COUNTS.messages }

/**
 * Navigation latérale fixe (tablette et bureau).
 * `md` : rail étroit icône + libellé. `lg` : panneau large avec libellés en ligne.
 */
export function SideRail() {
  return (
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-(--rail-width) flex-col gap-4 border-r bg-background px-2 py-4 md:flex lg:px-4">
      <div className="flex h-10 items-center justify-center lg:justify-start lg:px-2">
        <Logo compact className="lg:hidden" />
        <Logo className="hidden lg:block" />
      </div>
      <nav aria-label="Navigation principale">
        <ul className="flex flex-col gap-1">
          {navItems.map((item) => (
            <li key={item.id}>
              <NavItemLink item={item} badge={badges[item.id]} className="w-full" />
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  )
}
