import { z } from 'zod'

import { ACCENT_IDS } from '@/lib/service-accents'

const TIME_PATTERN = /^([01]\d|2[0-3]):[0-5]\d$/
const PHONE_PATTERN = /^\+?[0-9 ()-]{8,20}$/
const USERNAME_PATTERN = /^[a-z0-9._]{3,30}$/

const serviceTypeSchema = z.enum(
  ['boutique', 'pharmacie', 'restaurant', 'transport', 'hopital', 'station', 'hotel'],
  { error: "Choisissez un type d'activité" },
)

const nameSchema = z
  .string()
  .trim()
  .min(2, 'Le nom doit contenir au moins 2 caractères')
  .max(60, 'Le nom ne peut pas dépasser 60 caractères')

/** Champ facultatif : vide, ou valide selon `check`. */
function optional(check: (value: string) => boolean, message: string) {
  return z
    .string()
    .trim()
    .refine((value) => value === '' || check(value), message)
}

function isHttpUrl(value: string): boolean {
  try {
    const url = new URL(value)
    return url.protocol === 'http:' || url.protocol === 'https:'
  } catch {
    return false
  }
}

/** Étape 1 : création du service. */
export const createServiceSchema = z.object({
  type: serviceTypeSchema,
  name: nameSchema,
})
export type CreateServiceValues = z.infer<typeof createServiceSchema>

const openingHoursSchema = z.object({
  day: z.number(),
  open: z.boolean(),
  from: z.string().regex(TIME_PATTERN, 'Heure invalide'),
  to: z.string().regex(TIME_PATTERN, 'Heure invalide'),
})

/** Configuration complète de l'établissement (étapes 1 à 7 de l'assistant). */
export const serviceConfigSchema = z.object({
  // 1. Création
  type: serviceTypeSchema,
  name: nameSchema,
  // 2. Identité
  logo: z.string(),
  cover: z.string(),
  description: z
    .string()
    .trim()
    .max(300, 'La description ne peut pas dépasser 300 caractères'),
  // 3. Localisation
  country: z.string().min(1, 'Choisissez un pays'),
  city: z.string().trim().min(2, 'Indiquez la ville').max(60),
  address: z.string().trim().max(160, "L'adresse ne peut pas dépasser 160 caractères"),
  latitude: z.number().nullable(),
  longitude: z.number().nullable(),
  // 4. Contacts
  contacts: z.object({
    phone: z
      .string()
      .trim()
      .regex(PHONE_PATTERN, 'Indiquez un numéro de téléphone valide'),
    whatsapp: optional((v) => PHONE_PATTERN.test(v), 'Numéro WhatsApp invalide'),
    email: optional((v) => z.email().safeParse(v).success, 'Adresse e-mail invalide'),
    website: optional(isHttpUrl, 'Adresse invalide (commence par https://)'),
    facebook: z.string().trim().max(100, 'Maximum 100 caractères'),
    instagram: z.string().trim().max(100, 'Maximum 100 caractères'),
    tiktok: z.string().trim().max(100, 'Maximum 100 caractères'),
  }),
  // 5. Configuration métier
  businessDetails: z.record(
    z.string(),
    z.string().trim().max(120, 'Maximum 120 caractères'),
  ),
  hours: z.array(openingHoursSchema).length(7),
  // 6. Paiements et tickets
  paymentMethods: z
    .array(z.enum(['wallet', 'orange_money', 'moov_money', 'wave', 'card', 'cash']))
    .min(1, 'Choisissez au moins un moyen de paiement'),
  allowMerchantCredit: z.boolean(),
  ticket: z.object({
    header: z.string().trim().max(80, 'Maximum 80 caractères'),
    footer: z.string().trim().max(120, 'Maximum 120 caractères'),
    showLogo: z.boolean(),
    showQr: z.boolean(),
    paper: z.enum(['58mm', '80mm']),
  }),
  // 7. Personnalisation
  accent: z.enum(ACCENT_IDS),
  username: z
    .string()
    .trim()
    .regex(
      USERNAME_PATTERN,
      '3 à 30 caractères : lettres minuscules, chiffres, point ou tiret bas',
    ),
  welcomeMessage: z.string().trim().max(200, 'Maximum 200 caractères'),
})
export type ServiceConfigValues = z.infer<typeof serviceConfigSchema>

/** Élément du catalogue. */
export const catalogItemSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'Le nom doit contenir au moins 2 caractères')
    .max(80, 'Le nom ne peut pas dépasser 80 caractères'),
  image: z.string(),
  description: z
    .string()
    .trim()
    .max(300, 'La description ne peut pas dépasser 300 caractères'),
  price: z
    .number({ error: 'Indiquez un prix' })
    .int('Le prix doit être un nombre entier')
    .min(0, 'Le prix ne peut pas être négatif')
    .max(1_000_000_000, 'Prix trop élevé'),
  category: z.string().trim().min(1, 'Choisissez ou saisissez une catégorie').max(40),
  stockMode: z.enum(['quantity', 'availability']),
  quantity: z
    .number({ error: 'Indiquez une quantité' })
    .int('La quantité doit être un nombre entier')
    .min(0, 'La quantité ne peut pas être négative')
    .max(1_000_000, 'Quantité trop élevée'),
  available: z.boolean(),
  allowMerchantCredit: z.boolean(),
  options: z.array(
    z.object({
      name: z.string().trim().min(1, "Nommez l'option").max(40, 'Maximum 40 caractères'),
      extraPrice: z
        .number({ error: 'Indiquez un montant (0 si gratuit)' })
        .int('Le montant doit être un nombre entier')
        .min(0, 'Le montant ne peut pas être négatif'),
    }),
  ),
})
export type CatalogItemValues = z.infer<typeof catalogItemSchema>
