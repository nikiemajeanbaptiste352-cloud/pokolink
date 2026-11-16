import { z } from 'zod'

import { parseHashtags, STUDIO_DURATIONS, STUDIO_LIMITS } from '@/lib/studio'

/**
 * Validation locale du formulaire d'événement du Creator Studio. Elle sert à guider le
 * créateur ; le serveur revérifie tout (droits sur la vidéo, limites, modération).
 *
 * Deux niveaux : un BROUILLON accepte un formulaire incomplet (seules les valeurs saisies
 * doivent être correctes), l'ENVOI POUR VALIDATION exige tout.
 */
export const studioFormSchema = z.object({
  kind: z.enum(['factor', 'coins']),
  caption: z.string(),
  hashtags: z.string(),
  cover: z.string(),
  videoName: z.string(),
  videoSize: z.number(),
  startsAt: z.string(),
  duration: z.string(),
  maxCoins: z.string(),
  coinPrice: z.string(),
  partnershipLink: z.string(),
  rights: z.boolean(),
  noSelfTrade: z.boolean(),
  serverRules: z.boolean(),
})
export type StudioFormValues = z.infer<typeof studioFormSchema>

export type StudioFormMode = 'draft' | 'submit'

const MB = 1024 * 1024
const HOUR = 60 * 60 * 1000

/** Entier saisi dans un champ texte : `null` si vide ou invalide. */
export function toInteger(raw: string): number | null {
  const text = raw.replace(/[\s\u00a0]/g, '')
  return /^\d{1,9}$/.test(text) ? Number(text) : null
}

/** Schéma complet pour un mode donné. `now` sert à vérifier le délai avant le début. */
export function buildStudioSchema(now: number, mode: StudioFormMode) {
  const strict = mode === 'submit'

  return studioFormSchema.superRefine((values, ctx) => {
    const fail = (path: keyof StudioFormValues, message: string) =>
      ctx.addIssue({ code: 'custom', path: [path], message })

    // Légende
    const caption = values.caption.trim()
    if (caption.length > STUDIO_LIMITS.captionMax) {
      fail(
        'caption',
        `La légende ne peut pas dépasser ${STUDIO_LIMITS.captionMax} caractères`,
      )
    } else if (strict && caption.length < 5) {
      fail('caption', 'Écrivez une légende d’au moins 5 caractères')
    }

    // Mots-clés
    const tags = parseHashtags(values.hashtags)
    if (tags.length > STUDIO_LIMITS.hashtagsMax) {
      fail('hashtags', `${STUDIO_LIMITS.hashtagsMax} mots-clés au maximum`)
    } else if (tags.some((tag) => tag.length > STUDIO_LIMITS.hashtagLength)) {
      fail(
        'hashtags',
        `Chaque mot-clé fait ${STUDIO_LIMITS.hashtagLength} caractères au maximum`,
      )
    }

    // Vidéo
    if (values.videoSize > STUDIO_LIMITS.videoMaxMb * MB) {
      fail('videoName', `La vidéo ne peut pas dépasser ${STUDIO_LIMITS.videoMaxMb} Mo`)
    } else if (strict && !values.videoName) {
      fail('videoName', 'Ajoutez la vidéo de votre événement')
    }

    // Calendrier
    const startsAt = values.startsAt ? new Date(values.startsAt).getTime() : NaN
    if (values.startsAt && Number.isNaN(startsAt)) {
      fail('startsAt', 'Date de début invalide')
    } else if (!values.startsAt) {
      // Même un brouillon garde une date de début : elle est préremplie dans le formulaire.
      fail('startsAt', 'Choisissez la date de début')
    } else if (strict && startsAt < now + STUDIO_LIMITS.leadHours * HOUR) {
      fail(
        'startsAt',
        `Le début doit être dans plus de ${STUDIO_LIMITS.leadHours} heures, le temps de la validation`,
      )
    }
    if (!STUDIO_DURATIONS.some((d) => String(d.hours) === values.duration)) {
      fail('duration', 'Choisissez une durée')
    }

    // Coins
    if (values.kind === 'coins') {
      const coins = toInteger(values.maxCoins)
      if (values.maxCoins.trim() === '') {
        if (strict) fail('maxCoins', 'Indiquez le nombre de coins')
      } else if (
        coins === null ||
        coins < STUDIO_LIMITS.coinsMin ||
        coins > STUDIO_LIMITS.coinsMax
      ) {
        fail(
          'maxCoins',
          `Entre ${STUDIO_LIMITS.coinsMin} et ${STUDIO_LIMITS.coinsMax.toLocaleString('fr-FR')} coins`,
        )
      }

      const price = toInteger(values.coinPrice)
      if (values.coinPrice.trim() === '') {
        if (strict) fail('coinPrice', 'Indiquez le prix d’un coin')
      } else if (
        price === null ||
        price < STUDIO_LIMITS.priceMin ||
        price > STUDIO_LIMITS.priceMax
      ) {
        fail(
          'coinPrice',
          `Entre ${STUDIO_LIMITS.priceMin} et ${STUDIO_LIMITS.priceMax.toLocaleString('fr-FR')} FCFA`,
        )
      }
    }

    // Engagements (envoi seulement)
    if (strict) {
      if (!values.rights) {
        fail('rights', 'Confirmez que vous détenez les droits sur la vidéo')
      }
      if (!values.noSelfTrade) {
        fail('noSelfTrade', 'Confirmez que vous ne participerez pas à votre événement')
      }
      if (!values.serverRules) {
        fail('serverRules', 'Confirmez que vous avez compris le rôle d’AfriConnect')
      }
    }
  })
}
