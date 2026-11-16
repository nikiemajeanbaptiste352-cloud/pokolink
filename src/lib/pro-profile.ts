/**
 * Données de la page publique d'un Service Pro, présentées comme une fiche entreprise
 * (fiche signalétique, catégories, horaires, contacts). Tout est dérivé de ce que
 * l'établissement a renseigné (`Service`, catalogue, avis) : rien n'est inventé. Les
 * valeurs absentes sont simplement omises.
 */
import type { PublicPro } from '@/hooks/use-public-pro'
import { PAYMENT_METHODS, WEEK_DAYS, getServiceTypeMeta } from '@/lib/service-types'
import type { Review } from '@/types/pro'
import type { CatalogItem, OpeningHours, Service } from '@/types/service'

export interface CompanyFact {
  label: string
  value: string
}

const monthFormatter = new Intl.DateTimeFormat('fr-FR', {
  month: 'long',
  year: 'numeric',
})

/** « novembre 2026 » : date d'inscription sur AfriConnect (`undefined` si illisible). */
export function getMemberSince(service: Service): string | undefined {
  const time = new Date(service.createdAt).getTime()
  return Number.isNaN(time) ? undefined : monthFormatter.format(time)
}

/** Libellés des moyens de paiement acceptés. */
export function getPaymentLabels(service: Service): string[] {
  return PAYMENT_METHODS.filter((method) =>
    service.paymentMethods.includes(method.id),
  ).map((method) => method.label)
}

/** Fiche signalétique : les informations d'identité de l'établissement, sans valeur vide. */
export function getCompanyFacts(pro: PublicPro): CompanyFact[] {
  const { service } = pro
  const meta = getServiceTypeMeta(service.type)
  const facts: CompanyFact[] = [{ label: 'Activité', value: meta.label }]
  const place = [service.city, service.country].filter(Boolean).join(', ')
  if (place) facts.push({ label: 'Localisation', value: place })
  if (service.address) facts.push({ label: 'Adresse', value: service.address })
  const since = getMemberSince(service)
  if (since) facts.push({ label: 'Membre depuis', value: since })
  if (service.username)
    facts.push({ label: 'Identifiant', value: `@${service.username}` })
  for (const field of meta.businessFields) {
    const value = service.businessDetails[field.id]?.trim()
    if (value) facts.push({ label: field.label, value })
  }
  const payments = getPaymentLabels(service)
  if (payments.length > 0) facts.push({ label: 'Paiements', value: payments.join(', ') })
  return facts
}

export interface CategoryCount {
  name: string
  count: number
}

/** Catégories du catalogue, les plus fournies d'abord. */
export function getCategories(items: readonly CatalogItem[]): CategoryCount[] {
  const counts = new Map<string, number>()
  for (const item of items) {
    const name = item.category.trim()
    if (name) counts.set(name, (counts.get(name) ?? 0) + 1)
  }
  return [...counts]
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name, 'fr'))
}

export interface RatingBar {
  stars: number
  count: number
  /** Part des avis, de 0 à 100. */
  share: number
}

/** Répartition des avis publiés par note, de 5 étoiles à 1. */
export function getRatingDistribution(reviews: readonly Review[]): RatingBar[] {
  return [5, 4, 3, 2, 1].map((stars) => {
    const count = reviews.filter((review) => Math.round(review.rating) === stars).length
    return { stars, count, share: reviews.length ? (count / reviews.length) * 100 : 0 }
  })
}

export interface HoursRow {
  day: string
  label: string
  open: boolean
  today: boolean
}

/** Horaires de la semaine, du lundi au dimanche. `todayIndex` : 0 = lundi. */
export function getHoursRows(
  hours: readonly OpeningHours[],
  todayIndex: number,
): HoursRow[] {
  return WEEK_DAYS.map((day, index) => {
    const entry = hours.find((hour) => hour.day === index)
    const open = Boolean(entry?.open)
    return {
      day,
      open,
      label: open && entry ? `${entry.from} – ${entry.to}` : 'Fermé',
      today: index === todayIndex,
    }
  })
}

export type ContactId =
  'phone' | 'whatsapp' | 'email' | 'website' | 'facebook' | 'instagram' | 'tiktok'

export interface ContactLink {
  id: ContactId
  label: string
  /** Valeur lisible (numéro, adresse, identifiant). */
  value: string
  href: string
  /** Ouvre un autre site : lien externe. */
  external: boolean
}

const SOCIAL_BASES = {
  facebook: 'https://facebook.com/',
  instagram: 'https://instagram.com/',
  tiktok: 'https://tiktok.com/@',
} as const

/**
 * Adresse web saisie à la main -> URL http(s). Un autre schéma (`javascript:`, `data:`…)
 * est refusé : seul le web ordinaire est proposé en lien.
 */
function toWebUrl(raw: string, base?: string): string | null {
  const value = raw.trim()
  if (!value) return null
  if (/^https?:\/\//i.test(value)) return value
  if (/^[a-z][a-z0-9+.-]*:/i.test(value)) return null
  return base ? `${base}${value.replace(/^@/, '')}` : `https://${value}`
}

function digitsOf(value: string): string {
  return value.replace(/\D/g, '')
}

/** Moyens de contact renseignés, avec leur lien (appel, message, courriel, site, réseaux). */
export function getContactLinks(service: Service): ContactLink[] {
  const { contacts } = service
  const links: ContactLink[] = []
  const phone = contacts.phone.trim()
  if (digitsOf(phone)) {
    links.push({
      id: 'phone',
      label: 'Téléphone',
      value: phone,
      href: `tel:${phone.startsWith('+') ? '+' : ''}${digitsOf(phone)}`,
      external: false,
    })
  }
  const whatsapp = contacts.whatsapp.trim()
  if (digitsOf(whatsapp)) {
    links.push({
      id: 'whatsapp',
      label: 'WhatsApp',
      value: whatsapp,
      href: `https://wa.me/${digitsOf(whatsapp)}`,
      external: true,
    })
  }
  const email = contacts.email.trim()
  if (/^\S+@\S+$/.test(email)) {
    links.push({
      id: 'email',
      label: 'E-mail',
      value: email,
      href: `mailto:${email}`,
      external: false,
    })
  }
  const website = toWebUrl(contacts.website)
  if (website) {
    links.push({
      id: 'website',
      label: 'Site web',
      value: contacts.website.trim().replace(/^https?:\/\//i, ''),
      href: website,
      external: true,
    })
  }
  for (const id of ['facebook', 'instagram', 'tiktok'] as const) {
    const url = toWebUrl(contacts[id], SOCIAL_BASES[id])
    if (url) {
      links.push({
        id,
        label: id.charAt(0).toUpperCase() + id.slice(1),
        value: contacts[id].trim().replace(/^https?:\/\/(www\.)?/i, ''),
        href: url,
        external: true,
      })
    }
  }
  return links
}

/** Lien d'itinéraire (carte) : position GPS si elle existe, sinon l'adresse saisie. */
export function getMapUrl(service: Service): string | null {
  if (service.latitude !== null && service.longitude !== null) {
    return `https://www.google.com/maps/search/?api=1&query=${service.latitude},${service.longitude}`
  }
  const query = [service.address, service.city, service.country]
    .filter(Boolean)
    .join(', ')
  return service.address
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`
    : null
}
