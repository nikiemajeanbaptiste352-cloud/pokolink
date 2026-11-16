export type ConversationKind = 'direct' | 'group' | 'business' | 'channel'

/** Origine d'une conversation (cahier des charges, section 9). */
export type ContextType =
  | 'product'
  | 'service'
  | 'professional_profile'
  | 'pro_channel'
  | 'market_event'
  | 'creator_content'
  | 'user'

/** Le contenu à l'origine de la conversation, avec le chemin pour y retourner. */
export interface ConversationContext {
  type: ContextType
  id: string
  /** Libellé affiché (ex. nom du produit). */
  label: string
  /** Route du contenu d'origine. */
  to: string
}

export interface Conversation {
  id: string
  name: string
  avatarSrc?: string
  kind: ConversationKind
  /** Dernier message affiché en aperçu. */
  preview: string
  /** Heure ou jour affiché (ex. « 14:32 », « Hier »). */
  time: string
  unread: number
  /** Présence en ligne (conversations directes uniquement). */
  online?: boolean
  /** Identifiant du destinataire (utilisateur ou propriétaire de l'espace). */
  recipientId?: string
  /** Espace professionnel concerné, le cas échéant (`Service.id`). */
  professionalSpaceId?: string
  context?: ConversationContext
  /** Route du profil du correspondant. */
  profileTo?: string
  /** Création, en millisecondes (conversations ouvertes dans l'application). */
  createdAt?: number
  /** Dernière activité, en millisecondes : sert au tri. */
  updatedAt?: number
}

export interface ChatMessage {
  id: string
  conversationId: string
  /** `me` = l'utilisateur connecté. */
  from: 'me' | 'them'
  text: string
  /** Envoi, en millisecondes. */
  at: number
}
