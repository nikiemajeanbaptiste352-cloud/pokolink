import { ACCENT_IDS } from '@/lib/service-accents'
import type {
  AccentId,
  OpeningHours,
  Service,
  ServiceContacts,
  ServiceType,
  TicketSettings,
} from '@/types/service'

const SERVICE_TYPE_IDS: readonly ServiceType[] = [
  'boutique',
  'pharmacie',
  'restaurant',
  'transport',
  'hopital',
  'station',
  'hotel',
]

/** Horaires par défaut : lundi–samedi 08:00–18:00, dimanche fermé. */
export function createDefaultHours(): OpeningHours[] {
  return Array.from({ length: 7 }, (_, day) => ({
    day,
    open: day < 6,
    from: '08:00',
    to: '18:00',
  }))
}

export const DEFAULT_TICKET_SETTINGS: TicketSettings = {
  header: '',
  footer: 'Merci de votre visite !',
  showLogo: true,
  showQr: true,
  paper: '80mm',
}

export const EMPTY_CONTACTS: ServiceContacts = {
  phone: '',
  whatsapp: '',
  email: '',
  website: '',
  facebook: '',
  instagram: '',
  tiktok: '',
}

/** Transforme un nom en identifiant public : « Le Délice » → « le.delice ». */
export function slugifyUsername(name: string): string {
  return name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '.')
    .replace(/^\.+|\.+$/g, '')
    .slice(0, 30)
}

/** Identifiant public libre : ajoute un numéro si le nom est déjà pris. */
export function makeUniqueUsername(name: string, taken: ReadonlySet<string>): string {
  const base = slugifyUsername(name).padEnd(3, 'x') || 'service'
  if (!taken.has(base)) return base
  for (let i = 2; i < 1000; i++) {
    const candidate = `${base.slice(0, 26)}.${i}`
    if (!taken.has(candidate)) return candidate
  }
  return `${base.slice(0, 20)}.${Date.now().toString(36)}`
}

interface DraftInput {
  id: string
  type: ServiceType
  name: string
  username: string
}

/** Service tout neuf : brouillon avec des valeurs par défaut pour chaque champ. */
export function createServiceDraft({ id, type, name, username }: DraftInput): Service {
  return {
    id,
    type,
    name,
    logo: '',
    cover: '',
    description: '',
    country: 'Sénégal',
    city: '',
    address: '',
    latitude: null,
    longitude: null,
    contacts: { ...EMPTY_CONTACTS },
    businessDetails: {},
    hours: createDefaultHours(),
    // Le Wallet AfriConnect est le seul moyen de paiement.
    paymentMethods: ['wallet'],
    allowMerchantCredit: false,
    ticket: { ...DEFAULT_TICKET_SETTINGS },
    accent: 'green',
    username,
    welcomeMessage: '',
    status: 'draft',
    setupStep: 1,
    createdAt: new Date().toISOString(),
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

/**
 * Complète un service enregistré par une ancienne version : chaque champ ajouté depuis
 * reçoit sa valeur par défaut, et les valeurs devenues invalides sont écartées.
 */
export function normalizeService(raw: Record<string, unknown>): Service {
  const type = SERVICE_TYPE_IDS.find((t) => t === raw['type']) ?? 'boutique'
  const name = typeof raw['name'] === 'string' ? raw['name'] : ''
  const id = String(raw['id'])
  const base = createServiceDraft({
    id,
    type,
    name,
    username: slugifyUsername(name) || id.slice(0, 8),
  })

  const hours = raw['hours']
  // Les anciens établissements (espèces, Mobile Money…) passent au Wallet, seul moyen de paiement.
  const paymentMethods = base.paymentMethods
  const accent: AccentId = ACCENT_IDS.find((a) => a === raw['accent']) ?? base.accent
  const status = raw['status'] === 'active' ? 'active' : 'draft'

  return {
    ...base,
    ...(raw as Partial<Service>),
    type,
    name,
    status,
    accent,
    paymentMethods,
    allowMerchantCredit: raw['allowMerchantCredit'] === true,
    hours:
      Array.isArray(hours) && hours.length === 7 ? (hours as OpeningHours[]) : base.hours,
    contacts: {
      ...base.contacts,
      ...(isRecord(raw['contacts']) ? (raw['contacts'] as Partial<ServiceContacts>) : {}),
    },
    ticket: {
      ...base.ticket,
      ...(isRecord(raw['ticket']) ? (raw['ticket'] as Partial<TicketSettings>) : {}),
    },
    businessDetails: isRecord(raw['businessDetails'])
      ? (raw['businessDetails'] as Record<string, string>)
      : {},
    latitude: typeof raw['latitude'] === 'number' ? raw['latitude'] : null,
    longitude: typeof raw['longitude'] === 'number' ? raw['longitude'] : null,
  }
}
