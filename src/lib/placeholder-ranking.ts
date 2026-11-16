/**
 * DONNÉES TEMPORAIRES : classements Créateurs (vues / participants) et Vendeurs
 * (ventes / visiteurs). À remplacer par l'API : agrégats calculés côté serveur.
 */
import { listCreators } from '@/lib/creators'
import { DEMO_PROS } from '@/lib/directory'

export interface CreatorRank {
  rank: number
  handle: string
  name: string
  avatar?: string
  verified: boolean
  /** Vues cumulées des publications / événements. */
  views: number
  /** Participants aux événements Creator Market / Studio. */
  participants: number
}

export interface SellerRank {
  rank: number
  handle: string
  name: string
  logo?: string
  verified: boolean
  city: string
  /** Nombre de ventes (commandes). */
  sales: number
  /** Visiteurs de la boutique / page publique. */
  visitors: number
}

/** Score temporaire dérivé du handle (stable entre deux chargements). */
function seed(text: string): number {
  let value = 0
  for (let index = 0; index < text.length; index += 1) {
    value = (value * 31 + text.charCodeAt(index)) >>> 0
  }
  return value
}

/** Classement des créateurs : vues puis participants. */
export function getCreatorRanking(
  sort: 'views' | 'participants' = 'views',
): CreatorRank[] {
  const rows = listCreators().map((creator) => {
    const s = seed(creator.handle)
    const views = 8_000 + (s % 90_000) + Math.floor(creator.followers / 4)
    const participants = 120 + (s % 4_800) + Math.floor(creator.followers / 80)
    return {
      handle: creator.handle,
      name: creator.name,
      ...(creator.avatar ? { avatar: creator.avatar } : {}),
      verified: creator.verified,
      views,
      participants,
    }
  })
  rows.sort((a, b) =>
    sort === 'views' ? b.views - a.views : b.participants - a.participants,
  )
  return rows.map((row, index) => ({ ...row, rank: index + 1 }))
}

/** Classement des vendeurs : ventes puis visiteurs. */
export function getSellerRanking(sort: 'sales' | 'visitors' = 'sales'): SellerRank[] {
  const rows = DEMO_PROS.map((pro) => {
    const s = seed(pro.service.username)
    const sales = 40 + (s % 2_400) + Math.floor(pro.followers / 50)
    const visitors = 800 + (s % 28_000) + Math.floor(pro.followers / 2)
    return {
      handle: pro.service.username,
      name: pro.service.name,
      ...(pro.service.logo ? { logo: pro.service.logo } : {}),
      verified: pro.verified,
      city: pro.service.city,
      sales,
      visitors,
    }
  })
  rows.sort((a, b) => (sort === 'sales' ? b.sales - a.sales : b.visitors - a.visitors))
  return rows.map((row, index) => ({ ...row, rank: index + 1 }))
}
