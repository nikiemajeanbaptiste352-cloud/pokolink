import type { LucideIcon } from 'lucide-react'

import type { Tone } from '@/lib/tones'
import type { ServiceType } from '@/types/service'

export interface Banner {
  id: string
  title: string
  description: string
  cta: string
  to: string
  tone: 'brand' | 'violet' | 'gold'
  icon: LucideIcon
}

export interface Category {
  id: string
  label: string
  icon: LucideIcon
  tone: Tone
  /** Nombre d'éléments affiché sous le libellé (facultatif). */
  count?: number
  /** Ce que la catégorie filtre dans Explorer ; absent = tout afficher. */
  target?: CategoryTarget
}

/**
 * Aperçu « top / plus proche » affiché sur une carte-catégorie Explorer
 * (restaurants, transport, boutiques…).
 */
export interface CategorySpotlight {
  title: string
  /** Ligne secondaire : distance, vendeur, délai… */
  detail: string
  /** Pastille courte : « 1,2 km », « Top », « Ouvert ». */
  badge: string
  imageSrc?: string
}

export interface CategoryTarget {
  section: 'products' | 'pro'
  /** Types d'activité des Services Pro retenus (tous si absent). */
  types?: readonly ServiceType[]
}

export interface Product {
  id: string
  name: string
  /** Prix en francs CFA. */
  price: number
  seller: string
  sellerVerified?: boolean
  /** Photo de profil du vendeur, pour la pastille en haut de la carte. */
  sellerLogo?: string
  rating: number
  imageSrc?: string
  /** Nom d'utilisateur du profil public du vendeur : la pastille du vendeur l'ouvre. */
  proRef?: string
  /** Prix promotionnel en cours, inférieur à price. */
  promoPrice?: number
  /** Ville du vendeur. */
  city?: string
  category?: string
  available?: boolean
  /** Disponibilité en toutes lettres : « 12 en stock », « Épuisé »… */
  stockLabel?: string
}

export interface ServiceProvider {
  id: string
  /** Nom d'utilisateur public du profil professionnel correspondant. */
  proRef: string
  name: string
  category: string
  icon: LucideIcon
  tone: Tone
  rating: number
  reviews: number
  verified?: boolean
}

export interface Shop {
  id: string
  /** Nom d'utilisateur public du profil professionnel correspondant. */
  proRef: string
  name: string
  followers: number
  products: number
  rating: number
  verified?: boolean
  logoSrc?: string
}

export interface Restaurant {
  id: string
  /** Nom d'utilisateur public du profil professionnel correspondant. */
  proRef: string
  name: string
  distanceKm: number
  /** Délai affiché (ex. « 25-35 min »). */
  eta: string
  open: boolean
  rating: number
  imageSrc?: string
}
