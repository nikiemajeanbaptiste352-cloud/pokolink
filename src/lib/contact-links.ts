import { Camera, Globe, Mail, MessageCircle, Music2, Phone, Users } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

import type { ServiceContacts } from '@/types/service'

export interface ContactLink {
  id: string
  label: string
  href: string
  icon: LucideIcon
  /** Ouvre un site externe (nouvel onglet) plutôt qu'une application du téléphone. */
  external: boolean
}

const SOCIALS = {
  facebook: {
    label: 'Facebook',
    base: 'https://www.facebook.com/',
    icon: Users,
    at: false,
  },
  instagram: {
    label: 'Instagram',
    base: 'https://www.instagram.com/',
    icon: Camera,
    at: false,
  },
  tiktok: { label: 'TikTok', base: 'https://www.tiktok.com/', icon: Music2, at: true },
} as const

/** Une URL http(s) est gardée telle quelle ; sinon on la traite comme un @identifiant. */
function socialHref(value: string, base: string, at: boolean): string {
  if (/^https?:\/\//i.test(value)) return value
  const handle = encodeURIComponent(value.replace(/^@/, ''))
  return `${base}${at ? '@' : ''}${handle}`
}

/** Liens de contact d'un établissement, uniquement pour les coordonnées renseignées. */
export function getContactLinks(contacts: ServiceContacts): ContactLink[] {
  const links: ContactLink[] = []
  if (contacts.phone) {
    links.push({
      id: 'phone',
      label: 'Appeler',
      href: `tel:${contacts.phone.replace(/[^+\d]/g, '')}`,
      icon: Phone,
      external: false,
    })
  }
  if (contacts.whatsapp) {
    links.push({
      id: 'whatsapp',
      label: 'WhatsApp',
      href: `https://wa.me/${contacts.whatsapp.replace(/\D/g, '')}`,
      icon: MessageCircle,
      external: true,
    })
  }
  if (contacts.email) {
    links.push({
      id: 'email',
      label: 'E-mail',
      href: `mailto:${contacts.email}`,
      icon: Mail,
      external: false,
    })
  }
  if (contacts.website) {
    links.push({
      id: 'website',
      label: 'Site web',
      href: contacts.website,
      icon: Globe,
      external: true,
    })
  }
  for (const [key, social] of Object.entries(SOCIALS)) {
    const value = contacts[key as keyof typeof SOCIALS]
    if (value) {
      links.push({
        id: key,
        label: social.label,
        href: socialHref(value, social.base, social.at),
        icon: social.icon,
        external: true,
      })
    }
  }
  return links
}
