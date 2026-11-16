import type { LucideIcon } from 'lucide-react'

import type { Tone } from '@/lib/tones'

/** Type d'activité d'un établissement. */
export type ServiceType =
  'boutique' | 'pharmacie' | 'restaurant' | 'transport' | 'hopital' | 'station' | 'hotel'

/**
 * draft  : créé, configuration en cours (l'espace professionnel n'existe pas encore)
 * active : configuration validée, espace professionnel généré
 */
export type ServiceStatus = 'draft' | 'active'

export type PaymentMethodId =
  'wallet' | 'orange_money' | 'moov_money' | 'wave' | 'card' | 'cash'

export type TicketPaper = '58mm' | '80mm'

/** Couleur d'accent choisie par l'établissement (palette contrôlée, contraste AA). */
export type AccentId =
  | 'green'
  | 'blue'
  | 'red'
  | 'amber'
  | 'violet'
  | 'orange'
  | 'teal'
  | 'pink'
  | 'slate'
  | 'lime'

/** Horaires d'un jour : `day` va de 0 (lundi) à 6 (dimanche). */
export interface OpeningHours {
  day: number
  open: boolean
  /** Format HH:MM */
  from: string
  /** Format HH:MM */
  to: string
}

export interface TicketSettings {
  /** Texte en haut du ticket (ex. slogan). */
  header: string
  /** Texte en bas du ticket (ex. « Merci de votre visite »). */
  footer: string
  showLogo: boolean
  showQr: boolean
  paper: TicketPaper
}

/** Moyens de contact : toutes les valeurs sont des chaînes, vides si non renseignées. */
export interface ServiceContacts {
  phone: string
  whatsapp: string
  email: string
  website: string
  facebook: string
  instagram: string
  tiktok: string
}

/**
 * Un service = un établissement professionnel, totalement indépendant :
 * toutes ses données (catalogue, commandes, clients…) portent son `id`.
 */
export interface Service {
  id: string
  type: ServiceType
  name: string
  /** Image en data URL, chaîne vide si aucun logo. */
  logo: string
  /** Photo de couverture en data URL, chaîne vide si aucune. */
  cover: string
  description: string
  country: string
  city: string
  /** Adresse complète : rue, quartier, point de repère. */
  address: string
  /** Position GPS, `null` tant qu'elle n'est pas enregistrée. */
  latitude: number | null
  longitude: number | null
  contacts: ServiceContacts
  /** Réponses aux champs propres à l'activité, indexées par identifiant de champ. */
  businessDetails: Record<string, string>
  hours: OpeningHours[]
  paymentMethods: PaymentMethodId[]
  /**
   * Autorise le crédit commerçant pour cet établissement.
   * Si désactivé, aucun produit ne peut être payé à crédit (même si un article l’autorise).
   */
  allowMerchantCredit: boolean
  ticket: TicketSettings
  accent: AccentId
  /** Identifiant public unique (sans « @ »), utilisé dans l'adresse du profil public. */
  username: string
  welcomeMessage: string
  status: ServiceStatus
  /** Dernière étape de configuration atteinte (0 à 7), pour reprendre un brouillon. */
  setupStep: number
  createdAt: string
}

export type StockMode = 'quantity' | 'availability'

export interface ItemOption {
  name: string
  /** Supplément de prix en FCFA (0 = gratuit). */
  extraPrice: number
}

/** Élément du catalogue d'un service. */
export interface CatalogItem {
  id: string
  serviceId: string
  name: string
  /** Image en data URL, chaîne vide si aucune. */
  image: string
  description: string
  /** Prix en FCFA. */
  price: number
  category: string
  stockMode: StockMode
  /** Utilisée si `stockMode` vaut `quantity`. */
  quantity: number
  /** Utilisée si `stockMode` vaut `availability`. */
  available: boolean
  /**
   * Autorise l’achat à crédit commerçant pour CET article uniquement.
   * Désactivé par défaut ; ne se propage pas aux autres produits.
   */
  allowMerchantCredit: boolean
  options: ItemOption[]
}

/** Champ de configuration propre à une activité (étape « Configuration métier »). */
export interface BusinessField {
  id: string
  label: string
  placeholder: string
  icon: LucideIcon
  /** Clavier numérique pour les nombres. */
  numeric?: boolean
}

/** Métadonnées d'affichage d'un type d'activité. */
export interface ServiceTypeMeta {
  id: ServiceType
  label: string
  description: string
  icon: LucideIcon
  tone: Tone
  /** Titre du catalogue (ex. « Plats et boissons »). */
  catalogLabel: string
  /** Nom d'un élément (ex. « Plat »). */
  itemLabel: string
  /** Catégories suggérées lors de l'ajout d'un élément. */
  categories: readonly string[]
  /** Champs de l'étape « Configuration métier ». */
  businessFields: readonly BusinessField[]
}

export type ServiceToolId =
  | 'dashboard'
  | 'catalog'
  | 'orders'
  | 'scanner'
  | 'customers'
  | 'history'
  | 'reports'
  | 'notifications'
  | 'channel'
  | 'reviews'
  | 'subscriptions'
  | 'events'
  | 'ads'
  | 'affiliation'
  | 'credits'
  | 'settings'

export interface ServiceTool {
  id: ServiceToolId
  label: string
  description: string
  icon: LucideIcon
  tone: Tone
  /** Segment d'URL relatif à l'espace du service ('' = tableau de bord). */
  segment: string
}
