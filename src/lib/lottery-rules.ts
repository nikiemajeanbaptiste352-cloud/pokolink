import type { EventLottery } from '@/types/event'

/**
 * Loterie marketing : les volumes (chances, places) suivent le prix du lot.
 * L’organisateur choisit le lot et le prix de participation ; il ne fixe pas
 * arbitrairement le nombre de chances ni le plafond de places.
 */

/** 1 chance par tranche de valeur du lot (FCFA). */
export const LOTTERY_CHANCE_UNIT_FCFA = 10_000

/** Plafond raisonnable de chances par participant. */
const MAX_ENTRIES_PER_PERSON = 10

/**
 * Nombre de chances par participant, proportionnel à la valeur du lot.
 * Ex. 25 000 FCFA → 3 chances ; 90 000 FCFA → 9 chances.
 */
export function lotteryEntriesFromPrizeValue(prizeValue: number): number {
  const value = Math.max(0, Math.round(prizeValue))
  if (value <= 0) return 1
  return Math.min(
    MAX_ENTRIES_PER_PERSON,
    Math.max(1, Math.round(value / LOTTERY_CHANCE_UNIT_FCFA)),
  )
}

/**
 * Places maximales : couverture du lot (valeur ÷ participation).
 * Participation gratuite : plafond indicatif lié à la valeur du lot.
 */
export function lotteryMaxParticipantsFromPrices(
  prizeValue: number,
  entryFee: number,
): number {
  const value = Math.max(0, Math.round(prizeValue))
  const fee = Math.max(0, Math.round(entryFee))
  if (fee <= 0) return Math.max(500, Math.round(value / 50))
  return Math.max(1, Math.floor(value / fee))
}

/** Applique les règles système (ignore les plafonds / chances saisis côté vendeur). */
export function resolveLotteryRules(lottery: EventLottery): EventLottery {
  return {
    ...lottery,
    entriesPerPerson: lotteryEntriesFromPrizeValue(lottery.prizeValue),
    maxParticipants: lotteryMaxParticipantsFromPrices(
      lottery.prizeValue,
      lottery.entryFee,
    ),
  }
}

export function lotteryChanceRuleLabel(prizeValue: number): string {
  const entries = lotteryEntriesFromPrizeValue(prizeValue)
  return `${entries} chance${entries > 1 ? 's' : ''} (auto · ${LOTTERY_CHANCE_UNIT_FCFA.toLocaleString('fr-FR')} FCFA de lot)`
}

/** Détail chiffré : produit, mise totale, places et gagnants. */
export function lotteryValueBreakdown(lottery: EventLottery) {
  const rules = resolveLotteryRules(lottery)
  const totalStake =
    rules.entryFee > 0 ? rules.entryFee * rules.maxParticipants : 0
  return {
    ...rules,
    /** Mise totale si toutes les places sont prises. */
    totalStake,
    /** Personnes susceptibles de participer (plafond auto). */
    eligiblePeople: rules.maxParticipants,
    /** Personnes susceptibles de gagner. */
    winnerSlots: rules.winnersCount,
  }
}
