/**
 * DONNÉES TEMPORAIRES : uniquement pour vérifier le rendu de la page Profil.
 * À remplacer par les données réelles de l'API (TanStack Query).
 *
 * Les établissements professionnels (boutique, restaurant, transport…) ne sont plus ici :
 * ils sont créés par l'utilisateur, voir `ServicesProvider`.
 */
import {
  Clapperboard,
  Gift,
  HandCoins,
  Handshake,
  ShoppingBasket,
  GraduationCap,
  History,
  Ticket,
  Wallet,
} from 'lucide-react'

import { paths } from '@/routes/paths'
import type { PersonalTool, UserProfile } from '@/types/profile'

export const TEMP_PROFILE: UserProfile = {
  name: 'Amadou Ba',
  handle: 'amadou.ba',
  verified: true,
  bio: 'Entrepreneur à Dakar. Je partage mon parcours, mes conseils et mes bons plans.',
  city: 'Dakar',
  country: 'Sénégal',
  phone: '+221 77 123 45 67',
  stats: { posts: 128, followers: 12400, following: 356 },
}

/** Outils personnels du compte (distincts des établissements professionnels). */
export const TEMP_PERSONAL_TOOLS: readonly PersonalTool[] = [
  {
    id: 'creator',
    title: 'Creator Studio',
    description: 'Événements, historique et statistiques',
    icon: Clapperboard,
    tone: 'violet',
    to: paths.studio,
  },
  {
    id: 'affiliation',
    title: 'Affiliation',
    description: 'Programmes, liens et commissions',
    icon: Handshake,
    tone: 'brand',
    to: paths.studioAffiliate,
  },
  {
    id: 'learn',
    title: 'AfriLearn',
    description: 'Canal Pro, produits, contributions',
    icon: GraduationCap,
    tone: 'info',
    to: paths.learnMine,
  },
  {
    id: 'wallet',
    title: 'Wallet',
    description: 'Dépôts, retraits et transactions',
    icon: Wallet,
    tone: 'brand',
    to: paths.wallet,
  },
  {
    id: 'cart',
    title: 'Panier et achats',
    description: 'Mes commandes payées avec le Wallet',
    icon: ShoppingBasket,
    tone: 'brand',
    to: paths.cart,
  },
  {
    id: 'credits',
    title: 'Mes crédits',
    description: 'Dettes envers les commerçants',
    icon: HandCoins,
    tone: 'amber',
    to: paths.merchantCredits,
  },
  {
    id: 'rewards',
    title: 'Rewards',
    description: 'Mes points et avantages',
    icon: Gift,
    tone: 'gold',
    to: paths.rewards,
  },
  {
    id: 'tickets',
    title: 'Tickets',
    description: 'Mes tickets numériques',
    icon: Ticket,
    tone: 'red',
    to: paths.tickets,
  },
  {
    id: 'historique',
    title: 'Historique',
    description: 'Paiements, achats et réservations',
    icon: History,
    tone: 'neutral',
    to: paths.history,
  },
]
