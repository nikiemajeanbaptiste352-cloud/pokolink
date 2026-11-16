import type { CoinEvent } from '@/types/coin-market'
import type { MarketEvent } from '@/types/event'
import type { Product } from '@/types/explore'
import type { CreatorMarket } from '@/types/market'
import type { ChannelPost } from '@/types/pro'
import type { DemoPro } from '@/lib/directory'
import type { AdCampaign } from '@/types/ads'
export interface Story {
  id: string
  name: string
  avatarSrc?: string
  /** Story déjà vue : anneau discret au lieu de l'anneau vert. */
  seen?: boolean
  /** Story de l'utilisateur courant : bouton « + » pour en ajouter une. */
  isOwn?: boolean
}

export interface PostAuthor {
  name: string
  avatarSrc?: string
  verified?: boolean
  /** Profil public de l’auteur, si disponible. */
  to?: string
}

export interface Post {
  id: string
  author: PostAuthor
  /** Ancienneté affichée (ex. « 2h »). */
  time: string
  text: string
  /** Image de la publication. Sans `src`, un visuel provisoire est affiché. */
  media?: { src?: string; alt: string }
  likes: number
  comments: number
  shares: number
  /** Lien de partenariat collé (affiliation, forfait, pub…). */
  partnershipLink?: string
}

/**
 * Élément d'un fil immersif (Accueil, Explorer). Chaque type a son propre espace de
 * diffusion : toucher une carte ouvre cet espace (voir getFeedPath).
 */
export type FeedItem =
  | { kind: 'post'; id: string; post: Post }
  | { kind: 'event'; id: string; event: MarketEvent }
  | { kind: 'cote'; id: string; market: CreatorMarket; index: number }
  | { kind: 'coins'; id: string; event: CoinEvent; index: number }
  | { kind: 'pro_post'; id: string; pro: DemoPro; post: ChannelPost }
  | { kind: 'product'; id: string; product: Product; pro?: DemoPro }
  | { kind: 'pro'; id: string; pro: DemoPro; label: string }
  /** Annonce publicitaire sponsorisée (forfait → canaux Accueil / Explorer). */
  | { kind: 'ad'; id: string; campaign: AdCampaign; pro: DemoPro }
