import { Outlet, ScrollRestoration } from 'react-router-dom'

import { InstallAppBanner } from '@/components/common/InstallAppBanner'
import { BottomNav } from '@/components/navigation/BottomNav'
import { SideRail } from '@/components/navigation/SideRail'

/**
 * Coque d’application native :
 * - Mobile : cadre plein écran, zone de contenu + onglets fixes en bas.
 * - md+ : rail latéral + contenu.
 */
export function AppShell() {
  return (
    <div className="app-shell bg-background md:min-h-dvh md:overflow-x-hidden md:pl-(--rail-width)">
      <InstallAppBanner />
      <SideRail />
      <div className="app-frame flex min-h-0 min-w-0 flex-1 flex-col md:block md:min-h-dvh">
        {/* Mobile : pleine largeur blanche. md+ : colonne centrée. */}
        <main className="app-main min-h-0 flex-1 bg-background md:mx-auto md:min-h-dvh md:max-w-180 lg:border-x lg:border-border">
          <Outlet />
        </main>
        <BottomNav />
      </div>
      <ScrollRestoration />
    </div>
  )
}
