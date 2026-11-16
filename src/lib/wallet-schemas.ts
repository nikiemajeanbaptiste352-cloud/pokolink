import { z } from 'zod'

import { formatPrice } from '@/lib/format'
import { TEMP_LIMITS } from '@/lib/placeholder-wallet'

/**
 * Validation locale des formulaires Wallet : elle ne sert qu'à aider la saisie. Le serveur
 * vérifie tout de nouveau (solde, limites, bénéficiaire, PIN) et reste seul décisionnaire.
 */

const PHONE_DIGITS_MIN = 8

const amountText = z
  .string()
  .trim()
  .min(1, 'Saisissez un montant')
  .regex(/^\d+$/, 'Saisissez un montant en chiffres, sans espace ni virgule')

const phone = z
  .string()
  .trim()
  .refine((value) => value.replace(/\D/g, '').length >= PHONE_DIGITS_MIN, {
    message: `Saisissez un numéro d’au moins ${PHONE_DIGITS_MIN} chiffres`,
  })

function amountBetween(min: number, max: number) {
  return amountText
    .refine((value) => Number(value) >= min, {
      message: `Le montant minimum est de ${formatPrice(min)}`,
    })
    .refine((value) => Number(value) <= max, {
      message: `Le montant maximum est de ${formatPrice(max)}`,
    })
}

/**
 * Demande de dépôt après transfert externe Mobile Money.
 * Preuves pour le rapprochement backend (notification opérateur → crédit auto).
 */
export const depositRequestSchema = z.object({
  firstName: z
    .string()
    .trim()
    .min(2, 'Le prénom contient au moins 2 caractères')
    .max(40, 'Prénom trop long'),
  lastName: z
    .string()
    .trim()
    .min(2, 'Le nom contient au moins 2 caractères')
    .max(40, 'Nom trop long'),
  amount: amountBetween(TEMP_LIMITS.depositMin, TEMP_LIMITS.depositMax),
  transactionId: z
    .string()
    .trim()
    .min(4, 'Indiquez l’identifiant de transaction Mobile Money')
    .max(60, 'Identifiant trop long'),
  transferredAt: z.string().min(1, 'Indiquez la date et l’heure du transfert'),
  senderNumber: phone,
})
export type DepositRequestValues = z.infer<typeof depositRequestSchema>

export const PIN_MIN = 4
export const PIN_MAX = 6

/** `available` : solde disponible affiché, pour prévenir une demande trop élevée. */
export function createWithdrawalSchema(available: number) {
  return z.object({
    methodId: z.string().min(1, 'Choisissez un moyen de retrait'),
    amount: amountBetween(TEMP_LIMITS.withdrawalMin, TEMP_LIMITS.withdrawalMax).refine(
      (value) => Number(value) <= available,
      { message: 'Le montant dépasse votre solde disponible' },
    ),
    beneficiaryNumber: phone,
    beneficiaryName: z.string().trim().max(80, 'Nom trop long'),
    pin: z
      .string()
      .regex(
        new RegExp(`^\\d{${PIN_MIN},${PIN_MAX}}$`),
        `Votre code PIN contient ${PIN_MIN} à ${PIN_MAX} chiffres`,
      ),
  })
}
export type WithdrawalValues = z.infer<ReturnType<typeof createWithdrawalSchema>>

/** Identifiant public d'un utilisateur : « @awa.k » (3 à 30 caractères). */
const HANDLE_PATTERN = /^[a-z0-9._-]{3,30}$/

/**
 * Destinataire d'un envoi P2P : « @identifiant » ou numéro de téléphone. Renvoie la forme
 * normalisée (« @awa.k », « +22670000000 »), ou `null` si la saisie n'est ni l'un ni l'autre.
 */
export function normalizeRecipient(value: string): string | null {
  const text = value.trim()
  if (text === '') return null
  const handle = text.replace(/^@/, '').toLowerCase()
  if (/[a-z]/.test(handle) && HANDLE_PATTERN.test(handle)) return `@${handle}`
  const digits = text.replace(/\D/g, '')
  if (/^[+\d\s().-]+$/.test(text) && digits.length >= PHONE_DIGITS_MIN) {
    return `${text.startsWith('+') ? '+' : ''}${digits}`
  }
  return null
}

/**
 * Formulaire P2P (envoi ou demande d'argent). Le serveur vérifie de nouveau le destinataire,
 * le solde et les limites ; ici on n'aide qu'à la saisie.
 */
export function createP2PSchema(ownHandle: string) {
  return z.object({
    recipient: z
      .string()
      .trim()
      .min(1, 'Indiquez un @identifiant ou un numéro de téléphone')
      .refine((value) => normalizeRecipient(value) !== null, {
        message:
          'Saisissez un @identifiant (ex. @awa.k) ou un numéro d’au moins 8 chiffres',
      })
      .refine((value) => normalizeRecipient(value) !== `@${ownHandle}`, {
        message: 'Vous ne pouvez pas choisir votre propre compte',
      }),
    amount: amountBetween(TEMP_LIMITS.p2pMin, TEMP_LIMITS.p2pMax),
    note: z.string().trim().max(100, '100 caractères au plus'),
  })
}
export type P2PValues = z.infer<ReturnType<typeof createP2PSchema>>
