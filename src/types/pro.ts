import type { EventKind } from '@/types/event'

/** Formats que l'Espace Pro sait créer (loterie et réduction collective : pas encore de formulaire). */
export type ProEventKind = Exclude<EventKind, 'lottery' | 'collective'>

/**
 * Types des rubriques privées de l'Espace Pro : Canal, Avis, Abonnements, Événements.
 * Les données viennent aujourd'hui d'un stockage temporaire (voir `lib/pro-extras-store.ts`) ;
 * elles seront fournies par l'API. Les noms de champs suivent la structure décrite dans les
 * rapports (canal, membres, publications, médias) pour faciliter le raccordement.
 */

// ---------------------------------------------------------------- Canal Pro

export type PostType = 'announcement' | 'news' | 'promotion' | 'info'
export type PostStatus = 'published' | 'draft'

export interface PostMedia {
  kind: 'image' | 'video'
  name: string
  /** Data URL d'une image. Absente pour une vidéo (aperçu indisponible dans la démo). */
  src: string
}

export interface ChannelPost {
  id: string
  type: PostType
  title: string
  description: string
  media: PostMedia[]
  /** Élément du catalogue associé, chaîne vide si aucun. */
  itemId: string
  /** Prix promotionnel en FCFA, `null` si aucun. */
  promoPrice: number | null
  status: PostStatus
  /** Date de publication (ISO), vide pour un brouillon. */
  publishedAt: string
  createdAt: string
  views: number
  reactions: number
  /** Publication issue d’une campagne publicitaire (marquée « Sponsorisé »). */
  sponsored?: boolean
  /** Campagne source, si sponsorisée. */
  campaignId?: string
  /** Lien de partenariat collé sous la publication. */
  partnershipLink?: string
}

/** Mode de fonctionnement : le propriétaire publie seul, ou les membres peuvent participer. */
export type ChannelMode = 'broadcast' | 'participatory'
export type ChannelVisibility = 'public' | 'private'
/** Conditions d'accès : libre, sur demande, ou réservé aux souscripteurs d'un forfait. */
export type ChannelAccess = 'free' | 'request' | 'plan'
export type ChannelState = 'active' | 'archived'

export interface ChannelSettings {
  name: string
  description: string
  avatar: string
  mode: ChannelMode
  visibility: ChannelVisibility
  access: ChannelAccess
  notifications: boolean
  state: ChannelState
}

export type MemberStatus = 'active' | 'suspended'
export type MemberRole = 'member' | 'admin'

export interface ChannelMember {
  id: string
  name: string
  role: MemberRole
  status: MemberStatus
  /** Date d'adhésion (ISO). */
  joinedAt: string
}

// -------------------------------------------------------------------- Avis

export interface ReviewReply {
  comment: string
  /** Date de publication (ISO). */
  createdAt: string
}

export interface Review {
  id: string
  customerName: string
  /** Note de 1 à 5. */
  rating: number
  comment: string
  createdAt: string
  reply: ReviewReply | null
}

// ------------------------------------------------------------ Abonnements

export interface Subscriber {
  id: string
  name: string
  subscribedAt: string
}

export type PlanDuration = 'monthly' | 'quarterly' | 'semiannual' | 'annual' | 'one_time'
export type PlanStatus = 'draft' | 'active' | 'suspended'

export interface Plan {
  id: string
  name: string
  description: string
  /** Prix en FCFA. */
  price: number
  duration: PlanDuration
  benefits: string[]
  conditions: string
  image: string
  status: PlanStatus
  createdAt: string
}

export type PlanClientStatus = 'active' | 'expired'

export interface PlanClient {
  id: string
  name: string
  planId: string
  subscribedAt: string
  /** Fin de la période en cours (ISO), vide pour un paiement unique. */
  endsAt: string
  status: PlanClientStatus
}

// -------------------------------------------------------------- Événements

export type ParticipationStatus =
  'none' | 'pending' | 'confirmed' | 'attended' | 'declined'

export interface ProEvent {
  id: string
  title: string
  kind: ProEventKind
  description: string
  cover: string
  /** Début et fin en millisecondes depuis 1970. */
  startsAt: number
  endsAt: number
  location: string
  extra: string
  organizer: string
  /** Événement créé par le propriétaire de l'Espace Pro. */
  mine: boolean
  /** Un événement créé reste en brouillon tant qu'il n'est pas publié. */
  published: boolean
  participation: ParticipationStatus
  /** Nombre de participants, `null` si l'information n'est pas disponible. */
  participants: number | null
  /** Lien de partenariat collé sous l’événement. */
  partnershipLink?: string
}

// ----------------------------------------------------------------- Ensemble

/** Toutes les données privées d'UN service pour ces quatre rubriques. */
export interface ProExtras {
  channel: ChannelSettings
  posts: ChannelPost[]
  members: ChannelMember[]
  reviews: Review[]
  subscribers: Subscriber[]
  plans: Plan[]
  planClients: PlanClient[]
  events: ProEvent[]
}
