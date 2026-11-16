/**
 * Ce qu'un VISITEUR voit d'un établissement : uniquement le public. Les brouillons, les
 * événements non publiés, les forfaits suspendus et le canal privé ne sortent jamais de
 * l'Espace Pro (règle du cahier des charges : le propriétaire gère, le visiteur consulte).
 */
import type { ChannelPost, Plan, ProEvent, ProExtras, Review } from '@/types/pro'

const byDateDesc = (a: string, b: string) => b.localeCompare(a)

/** Publications du canal visibles par tous (canal public et actif, hors brouillons). */
export function getPublicPosts(extras: ProExtras): ChannelPost[] {
  if (extras.channel.visibility !== 'public' || extras.channel.state !== 'active')
    return []
  return extras.posts
    .filter((post) => post.status === 'published')
    .sort((a, b) => byDateDesc(a.publishedAt, b.publishedAt))
}

/** Prix promotionnels annoncés dans les publications publiques : identifiant d'article → prix. */
export function getPromoPrices(extras: ProExtras): Map<string, number> {
  const promos = new Map<string, number>()
  for (const post of getPublicPosts(extras)) {
    if (post.itemId && post.promoPrice !== null) promos.set(post.itemId, post.promoPrice)
  }
  return promos
}
/** Annonces : promotions et communiqués. Le reste (actualités, infos) = publications. */
export function isAnnouncement(post: ChannelPost): boolean {
  return post.type === 'promotion' || post.type === 'announcement'
}

/**
 * Événements que l'établissement organise (publiés) ou auxquels il participe
 * (inscription confirmée ou déjà vécue), du plus proche au plus lointain.
 */
export function getPublicEvents(extras: ProExtras): ProEvent[] {
  return extras.events
    .filter(
      (event) =>
        event.published &&
        (event.mine ||
          event.participation === 'confirmed' ||
          event.participation === 'attended'),
    )
    .sort((a, b) => a.startsAt - b.startsAt)
}

/** Événement à mettre en avant : en cours, sinon le prochain. */
export function getFeaturedEvent(events: readonly ProEvent[], now: number) {
  return events.find((event) => event.endsAt > now)
}

/** Forfaits proposés aux visiteurs. */
export function getPublicPlans(extras: ProExtras): Plan[] {
  return extras.plans.filter((plan) => plan.status === 'active')
}

export function getAverageRating(reviews: readonly Review[]): number | null {
  if (reviews.length === 0) return null
  return reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
}

const dayFormatter = new Intl.DateTimeFormat('fr-FR', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
})

/** « 15 nov. 2026 » ou « Du 15 nov. 2026 au 17 nov. 2026 ». */
export function formatDateRange(start: number, end: number): string {
  const first = dayFormatter.format(start)
  const last = dayFormatter.format(end)
  return first === last ? first : `Du ${first} au ${last}`
}

/** « Il y a 2 h », « Il y a 3 j » : durée écoulée depuis une date ISO. */
export function formatAgo(iso: string, now: number): string {
  const minutes = Math.max(0, Math.floor((now - new Date(iso).getTime()) / 60_000))
  if (minutes < 60) return `Il y a ${Math.max(minutes, 1)} min`
  if (minutes < 24 * 60) return `Il y a ${Math.floor(minutes / 60)} h`
  return `Il y a ${Math.floor(minutes / (24 * 60))} j`
}

/** Décompte avant un début : jours, heures et minutes restants. */
export function splitCountdown(ms: number): {
  days: number
  hours: number
  minutes: number
} {
  const total = Math.max(0, Math.floor(ms / 60_000))
  return {
    days: Math.floor(total / (24 * 60)),
    hours: Math.floor((total % (24 * 60)) / 60),
    minutes: total % 60,
  }
}
/** Nombre d'événements à venir ou en cours, pour la pastille de la rubrique. */
export function countUpcomingEvents(extras: ProExtras, now: number): number {
  return getPublicEvents(extras).filter((event) => event.endsAt > now).length
}
