import type { LucideIcon } from 'lucide-react'

export type NavItemId = 'home' | 'markets' | 'explore' | 'messages' | 'profile'

export interface NavItem {
  id: NavItemId
  label: string
  to: string
  icon: LucideIcon
  /** Autres préfixes d'URL qui gardent cet onglet actif (ex. `/services` pour Profil). */
  activePrefixes?: readonly string[]
}
