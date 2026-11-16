import type { CoinEvent, CoinEventState } from '@/types/coin-market'

/** Indice avec une décimale et une virgule : 128.6 → « 128,6 ». */
export function formatIndex(value: number): string {
  return value.toFixed(1).replace('.', ',')
}

/**
 * Historique de la valeur d’un coin (FCFA), dérivé de l’indice :
 * valeur ≈ prix_initial × indice / 100 (arrondi inférieur, comme côté serveur).
 */
export function coinValueHistory(event: CoinEvent): number[] {
  if (event.indexHistory.length === 0) return [event.coinValue || event.coinPrice]
  return event.indexHistory.map((index) =>
    Math.floor((event.coinPrice * index) / 100),
  )
}

/** Écart de prix depuis le début de la série (−1…+∞ en fraction). */
export function getCoinPriceChange(event: CoinEvent): {
  ratio: number
  from: number
  to: number
} {
  const history = coinValueHistory(event)
  const from = history[0] ?? event.coinPrice
  const to = history[history.length - 1] ?? event.coinValue ?? event.coinPrice
  const ratio = from > 0 ? to / from - 1 : 0
  return { ratio, from, to }
}

/** Coins avec séparateur de milliers : 1000 → « 1 000 ». */
export function formatCoins(value: number): string {
  return value.toLocaleString('fr-FR')
}

export const COIN_STATE_LABEL: Record<CoinEventState, string> = {
  purchases_open: 'Achats ouverts',
  purchases_closed: 'Achats fermés',
  running: 'En cours',
  closing: 'Clôture en cours',
  closed: 'Clôturé',
  suspended: 'Suspendu',
}

export const COIN_STATE_CLASS: Record<CoinEventState, string> = {
  purchases_open: 'bg-accent text-brand',
  purchases_closed: 'bg-warning/20 text-foreground',
  running: 'bg-accent text-brand',
  closing: 'bg-warning/20 text-foreground',
  closed: 'bg-muted text-muted-foreground',
  suspended: 'bg-destructive/10 text-danger',
}

/** Filtres de la liste (regroupent plusieurs états). */
export type CoinFilter = 'all' | 'purchases' | 'running' | 'ended'

export function matchesCoinFilter(event: CoinEvent, filter: CoinFilter): boolean {
  switch (filter) {
    case 'all':
      return true
    case 'purchases':
      return event.state === 'purchases_open' || event.state === 'purchases_closed'
    case 'running':
      return (
        event.state === 'running' ||
        event.state === 'closing' ||
        event.state === 'suspended'
      )
    case 'ended':
      return event.state === 'closed'
  }
}

/** Le participant peut-il demander un retrait ? Décision d'affichage, le serveur contrôle. */
export function canRequestWithdrawal(event: CoinEvent): boolean {
  return event.state === 'running'
}

/** La valeur théorique des coins détenus dépasse-t-elle le solde du pool ? (simple comparaison) */
export function isPoolShort(event: CoinEvent): boolean {
  return event.heldTheoreticalValue > event.poolBalance
}

export interface LifecycleStep {
  id: string
  label: string
  hint: string
}

export const LIFECYCLE_STEPS: readonly LifecycleStep[] = [
  { id: 'purchases', label: 'Achats', hint: 'Avant le début' },
  { id: 'running', label: 'En cours', hint: 'Indice et retraits' },
  { id: 'closing', label: 'Clôture', hint: 'Mécanisme arrêté' },
  { id: 'settlement', label: 'Règlement', hint: 'Demandes traitées' },
]

/**
 * Étape atteinte dans le cycle (0 à 4 ; 4 = tout est terminé). Un événement suspendu
 * n'a pas d'étape : l'écran affiche alors le motif à la place du parcours.
 */
export function getLifecycleStep(event: CoinEvent): number | null {
  switch (event.state) {
    case 'purchases_open':
    case 'purchases_closed':
      return 0
    case 'running':
      return 1
    case 'closing':
      return 2
    case 'closed':
      return event.settlement === 'done' ? 4 : 3
    case 'suspended':
      return null
  }
}
