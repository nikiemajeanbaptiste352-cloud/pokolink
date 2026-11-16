import { z } from 'zod'

/** Schémas de validation locale des formulaires Canal, Avis, Abonnements et Événements. */

export const POST_TYPES = ['announcement', 'news', 'promotion', 'info'] as const
export const PLAN_DURATIONS = [
  'monthly',
  'quarterly',
  'semiannual',
  'annual',
  'one_time',
] as const
export const EVENT_KIND_IDS = [
  'flash',
  'live',
  'launch',
  'promo',
  'community',
  'game',
  'draw',
] as const

const mediaSchema = z.object({
  kind: z.enum(['image', 'video']),
  name: z.string(),
  src: z.string(),
})

export const postSchema = z.object({
  type: z.enum(POST_TYPES),
  title: z
    .string()
    .trim()
    .min(3, 'Le titre doit contenir au moins 3 caractères')
    .max(80, 'Le titre ne peut pas dépasser 80 caractères'),
  description: z
    .string()
    .trim()
    .min(5, 'Décrivez votre publication en quelques mots')
    .max(1000, 'La description ne peut pas dépasser 1 000 caractères'),
  media: z.array(mediaSchema).max(6, 'Six fichiers au maximum'),
  itemId: z.string(),
  promoPrice: z
    .string()
    .trim()
    .regex(/^\d{0,9}$/, 'Saisissez un montant entier en FCFA'),
  partnershipLink: z.string().trim().max(500, 'Lien trop long'),
})
export type PostValues = z.infer<typeof postSchema>

export const replySchema = z.object({
  comment: z
    .string()
    .trim()
    .min(2, 'Écrivez votre réponse')
    .max(500, 'La réponse ne peut pas dépasser 500 caractères'),
})
export type ReplyValues = z.infer<typeof replySchema>

export const planSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'Le nom doit contenir au moins 2 caractères')
    .max(40, 'Le nom ne peut pas dépasser 40 caractères'),
  description: z.string().trim().max(200, 'Maximum 200 caractères'),
  price: z
    .number({ error: 'Indiquez un prix' })
    .int('Le prix doit être un nombre entier')
    .min(100, 'Le prix minimum est de 100 FCFA')
    .max(100_000_000, 'Prix trop élevé'),
  duration: z.enum(PLAN_DURATIONS),
  benefits: z
    .array(
      z.object({
        text: z
          .string()
          .trim()
          .min(1, 'Écrivez l’avantage')
          .max(80, 'Maximum 80 caractères'),
      }),
    )
    .min(1, 'Ajoutez au moins un avantage'),
  conditions: z.string().trim().max(300, 'Maximum 300 caractères'),
  image: z.string(),
  active: z.boolean(),
})
export type PlanValues = z.infer<typeof planSchema>

export const eventSchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(3, 'Le nom doit contenir au moins 3 caractères')
      .max(80, 'Le nom ne peut pas dépasser 80 caractères'),
    kind: z.enum(EVENT_KIND_IDS),
    description: z
      .string()
      .trim()
      .min(10, 'Décrivez l’événement en quelques phrases')
      .max(500, 'La description ne peut pas dépasser 500 caractères'),
    cover: z.string(),
    startsAt: z.string().min(1, 'Indiquez la date de début'),
    endsAt: z.string().min(1, 'Indiquez la date de fin'),
    location: z
      .string()
      .trim()
      .min(2, 'Indiquez le lieu (ou « En ligne »)')
      .max(100, 'Maximum 100 caractères'),
    extra: z.string().trim().max(300, 'Maximum 300 caractères'),
    partnershipLink: z.string().trim().max(500, 'Lien trop long'),
  })
  .refine(
    (values) =>
      !values.startsAt ||
      !values.endsAt ||
      new Date(values.endsAt).getTime() > new Date(values.startsAt).getTime(),
    { path: ['endsAt'], message: 'La fin doit être après le début' },
  )
export type EventValues = z.infer<typeof eventSchema>

export const channelSettingsSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'Le nom doit contenir au moins 2 caractères')
    .max(60, 'Le nom ne peut pas dépasser 60 caractères'),
  description: z.string().trim().max(300, 'Maximum 300 caractères'),
  avatar: z.string(),
  mode: z.enum(['broadcast', 'participatory']),
  visibility: z.enum(['public', 'private']),
  access: z.enum(['free', 'request', 'plan']),
  notifications: z.boolean(),
})
export type ChannelSettingsValues = z.infer<typeof channelSettingsSchema>
