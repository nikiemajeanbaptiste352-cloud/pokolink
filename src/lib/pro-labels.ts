import type {
  ChannelAccess,
  ChannelMode,
  ChannelVisibility,
  ParticipationStatus,
  PlanDuration,
  PlanStatus,
  PostStatus,
  PostType,
  ProEvent,
} from '@/types/pro'
import type { EventState } from '@/types/event'

export const POST_TYPE_LABEL: Record<PostType, string> = {
  announcement: 'Annonce',
  news: 'Actualité',
  promotion: 'Promotion',
  info: 'Information',
}

export const POST_STATUS_LABEL: Record<PostStatus, string> = {
  published: 'Publié',
  draft: 'Brouillon',
}

export const CHANNEL_MODE_LABEL: Record<ChannelMode, string> = {
  broadcast: 'Canal de diffusion',
  participatory: 'Canal participatif',
}

export const CHANNEL_MODE_HINT: Record<ChannelMode, string> = {
  broadcast: 'Vous publiez, les membres lisent et réagissent.',
  participatory: 'Les membres peuvent aussi publier, commenter et partager.',
}

export const CHANNEL_VISIBILITY_LABEL: Record<ChannelVisibility, string> = {
  public: 'Public',
  private: 'Privé',
}

export const CHANNEL_ACCESS_LABEL: Record<ChannelAccess, string> = {
  free: 'Libre et gratuit',
  request: 'Sur demande',
  plan: 'Réservé aux souscripteurs d’un forfait',
}

export const PLAN_DURATION_LABEL: Record<PlanDuration, string> = {
  monthly: 'Mensuel',
  quarterly: 'Trimestriel',
  semiannual: 'Semestriel',
  annual: 'Annuel',
  one_time: 'Paiement unique',
}

const DAY_MS = 24 * 60 * 60 * 1000

/** Durée de validité d’un forfait (ms), `null` pour un paiement unique. */
export function planDurationMs(duration: PlanDuration): number | null {
  switch (duration) {
    case 'monthly':
      return 30 * DAY_MS
    case 'quarterly':
      return 90 * DAY_MS
    case 'semiannual':
      return 180 * DAY_MS
    case 'annual':
      return 365 * DAY_MS
    case 'one_time':
      return null
  }
}

export const PLAN_STATUS_LABEL: Record<PlanStatus, string> = {
  draft: 'Brouillon',
  active: 'Actif',
  suspended: 'Suspendu',
}

export const PARTICIPATION_LABEL: Record<ParticipationStatus, string> = {
  none: 'Non inscrit',
  pending: 'Demande envoyée',
  confirmed: 'Inscription confirmée',
  attended: 'A participé',
  declined: 'Refusée',
}

/** État d'un événement à l'instant `now` : à venir, en cours ou terminé. */
export function getProEventState(event: ProEvent, now: number): EventState {
  if (now < event.startsAt) return 'upcoming'
  if (now >= event.endsAt) return 'ended'
  return 'live'
}

const dateFormatter = new Intl.DateTimeFormat('fr-FR', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
})
const dateTimeFormatter = new Intl.DateTimeFormat('fr-FR', {
  day: 'numeric',
  month: 'short',
  hour: '2-digit',
  minute: '2-digit',
})

/** « 12 nov. 2026 » à partir d'une date ISO ou d'un horodatage. */
export function formatDate(value: string | number): string {
  return dateFormatter.format(new Date(value))
}

/** « 12 nov., 14:30 » à partir d'un horodatage. */
export function formatDateTime(value: string | number): string {
  return dateTimeFormatter.format(new Date(value))
}

/** Valeur d'un champ `datetime-local` (heure locale) à partir d'un horodatage. */
export function toLocalInput(ms: number): string {
  const date = new Date(ms)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`
}
