import { ChartCandlestick, Compass, House, MessageCircle, User } from 'lucide-react'

import { paths, sectionPrefixes } from '@/routes/paths'
import type { NavItem } from '@/types/navigation'

/** Navigation principale (cahier des charges, section 7). */
export const navItems: readonly NavItem[] = [
  { id: 'home', label: 'Accueil', to: paths.home, icon: House },
  {
    id: 'markets',
    label: 'Marché',
    to: paths.markets,
    icon: ChartCandlestick,
    activePrefixes: sectionPrefixes.markets,
  },
  {
    id: 'explore',
    label: 'Explorer',
    to: paths.explore,
    icon: Compass,
    activePrefixes: sectionPrefixes.explore,
  },
  {
    id: 'messages',
    label: 'Messages',
    to: paths.messages,
    icon: MessageCircle,
    activePrefixes: sectionPrefixes.messages,
  },
  {
    id: 'profile',
    label: 'Profil',
    to: paths.profile,
    icon: User,
    activePrefixes: sectionPrefixes.profile,
  },
]
