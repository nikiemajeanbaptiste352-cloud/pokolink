import { formatPrice } from '@/lib/format'
import { resolveLotteryRules } from '@/lib/lottery-rules'
import type { EventCollective, EventState, MarketEvent, PriceTier } from '@/types/event'

/**
 * Parcours des deux mécanismes de promotion participative (loterie marketing, réduction
 * collective). L'étape en cours est déduite de l'état de l'événement et des champs
 * fournis par le serveur ; le frontend ne décide d'aucun résultat.
 */
export interface ParticipationStep {
  id: string
  label: string
  hint: string
}

const LOTTERY_STEPS: readonly ParticipationStep[] = [
  { id: 'publication', label: 'Publication', hint: 'Règles et valeur du lot' },
  {
    id: 'participation',
    label: 'Participation',
    hint: 'Tickets numérotés émis',
  },
  { id: 'closing', label: 'Clôture', hint: 'Liste des tickets figée' },
  {
    id: 'selection',
    label: 'Tirage',
    hint: 'Tirage sur les numéros de tickets',
  },
  {
    id: 'award',
    label: 'Attribution',
    hint: 'Cartes gagnantes publiées',
  },
]

const COLLECTIVE_STEPS: readonly ParticipationStep[] = [
  { id: 'publication', label: 'Publication', hint: 'Règles publiées' },
  { id: 'contribution', label: 'Contributions', hint: 'Le prix baisse' },
  { id: 'closing', label: 'Clôture', hint: 'Prix arrêté' },
  { id: 'purchase', label: 'Achats', hint: 'Au prix final' },
]

/**
 * `current` est l'index de l'étape active ; il vaut `steps.length` quand tout est terminé.
 */
export function getParticipationSteps(
  event: MarketEvent,
  state: EventState,
): { steps: readonly ParticipationStep[]; current: number } | null {
  if (event.lottery) {
    const { phase } = resolveLotteryRules(event.lottery)
    const current =
      state === 'upcoming'
        ? 0
        : state === 'live'
          ? 1
          : phase === 'awarded'
            ? LOTTERY_STEPS.length
            : phase === 'selection'
              ? 3
              : 2
    return { steps: LOTTERY_STEPS, current }
  }
  if (event.collective) {
    const current =
      state === 'upcoming'
        ? 0
        : state === 'live'
          ? 1
          : event.collective.stockLeft > 0
            ? 3
            : COLLECTIVE_STEPS.length
    return { steps: COLLECTIVE_STEPS, current }
  }
  return null
}

/** Premier palier pas encore atteint, s'il en reste. */
export function getNextTier(collective: EventCollective): PriceTier | undefined {
  return collective.tiers.find((tier) => tier.collected > collective.collected)
}

const dateFormatter = new Intl.DateTimeFormat('fr-FR', { dateStyle: 'long' })

/** Date en toutes lettres : « 16 juillet 2026 ». */
export function formatLongDate(timestamp: number): string {
  return dateFormatter.format(timestamp)
}

const dateTimeFormatter = new Intl.DateTimeFormat('fr-FR', {
  dateStyle: 'long',
  timeStyle: 'short',
})

/** Date et heure : « 16 juillet 2026 à 18:30 ». */
export function formatDateTime(timestamp: number): string {
  return dateTimeFormatter.format(timestamp)
}

export function entryFeeLabel(fee: number): string {
  return fee > 0 ? formatPrice(fee) : 'Gratuite'
}

export type ParticipationActionKind = 'enter' | 'purchase' | 'remind' | 'none'

export interface ParticipationAction {
  kind: ParticipationActionKind
  /** Libellé du bouton, ou message quand rien n'est possible. */
  label: string
  /** Montant rappelé à gauche du bouton (participation ou prix final). */
  amountLabel?: string
  amount?: number
}

/** Ce que l'utilisateur peut faire maintenant, selon l'état de l'événement. */
export function getParticipationAction(
  event: MarketEvent,
  state: EventState,
): ParticipationAction {
  if (event.lottery) {
    const { entryFee, maxParticipants, phase } = resolveLotteryRules(event.lottery)
    if (state === 'upcoming') {
      return { kind: 'remind', label: 'Me rappeler le début' }
    }
    if (state === 'ended') {
      return {
        kind: 'none',
        label:
          phase === 'awarded'
            ? 'Lots attribués : participation fermée'
            : 'Participation fermée : tirage en cours de traitement',
      }
    }
    if (event.participants >= maxParticipants) {
      return { kind: 'none', label: 'Complet : plus aucune place disponible' }
    }
    return {
      kind: 'enter',
      label: entryFee > 0 ? 'Participer' : 'Participer gratuitement',
      amountLabel: entryFee > 0 ? 'Participation' : 'Participation',
      amount: entryFee > 0 ? entryFee : 0,
    }
  }

  if (event.collective) {
    const { entryFee, currentPrice, stockLeft } = event.collective
    if (state === 'upcoming') {
      return { kind: 'remind', label: 'Me rappeler le début' }
    }
    if (state === 'live') {
      return {
        kind: 'enter',
        label: 'Contribuer',
        amountLabel: 'Participation',
        amount: entryFee,
      }
    }
    if (stockLeft > 0) {
      return {
        kind: 'purchase',
        label: 'Acheter au prix final',
        amountLabel: 'Prix final',
        amount: currentPrice,
      }
    }
    return { kind: 'none', label: 'Stock épuisé : les achats sont fermés' }
  }

  // Offre produit (vente flash, live, lancement, promo…).
  if (event.offer) {
    if (state === 'upcoming') {
      return { kind: 'remind', label: 'Me rappeler le début' }
    }
    if (state === 'ended' || event.offer.stockLeft <= 0) {
      return {
        kind: 'none',
        label:
          event.offer.stockLeft <= 0
            ? 'Stock épuisé'
            : 'Événement terminé',
      }
    }
    return {
      kind: 'purchase',
      label: 'Acheter maintenant',
      amountLabel: 'Participation',
      amount: event.offer.eventPrice,
    }
  }

  // Jeux, tirages, communauté…
  if (state === 'upcoming') {
    return { kind: 'remind', label: 'Me rappeler le début' }
  }
  if (state === 'ended') {
    return { kind: 'none', label: 'Événement terminé' }
  }
  return {
    kind: 'enter',
    label: 'Participer',
    amountLabel: 'Participation',
    amount: 0,
  }
}
