import { TEMP_MARKET_PARAMS } from '@/lib/placeholder-markets'
import type {
  CreatorMarket,
  MarketStatus,
  MarketUpdateState,
  PoolState,
} from '@/types/market'

/** Affiche un facteur avec trois décimales et une virgule : 1.0164 → « 1,016 ». */
export function formatCote(value: number): string {
  return value.toFixed(3).replace('.', ',')
}

/** Pourcentage signé : 0.0164 → « +1,6 % », −0.029 → « −2,9 % ». */
export function formatPercent(ratio: number): string {
  const value = Math.abs(ratio * 100)
    .toFixed(1)
    .replace('.', ',')
  if (Number(value.replace(',', '.')) === 0) return '0,0 %'
  return `${ratio > 0 ? '+' : '−'}${value} %`
}

/** Signal entre −1 et +1 : 0.099 → « +0,10 ». */
export function formatSignal(value: number): string {
  const text = Math.abs(value).toFixed(2).replace('.', ',')
  if (Number(text.replace(',', '.')) === 0) return '0,00'
  return `${value > 0 ? '+' : '−'}${text}`
}

/** Vues par heure : 1900 → « 1 900 vues/h ». */
export function formatRate(value: number): string {
  return `${value.toLocaleString('fr-FR')} vues/h`
}

/** Taux de couverture en pourcentage entier : 0.82 → « 82 % ». */
export function formatCoverage(ratio: number): string {
  return `${Math.round(Math.min(Math.max(ratio, 0), 1) * 100)} %`
}

/** Montant signé en FCFA : 78 → « +78 FCFA », −1200 → « −1 200 FCFA ». */
export function formatSignedPrice(value: number): string {
  const text = `${Math.abs(value).toLocaleString('fr-FR')} FCFA`
  if (value === 0) return text
  return `${value > 0 ? '+' : '−'}${text}`
}

export const STATUS_LABEL: Record<MarketStatus, string> = {
  open: 'En cours',
  upcoming: 'À venir',
  closed: 'Terminé',
}

export const POOL_LABEL: Record<PoolState, string> = {
  covered: 'Couvert',
  limited: 'Limité',
  suspended: 'Suspendu',
}

export const UPDATE_STATE_LABEL: Record<MarketUpdateState, string> = {
  warmup: 'Démarrage neutre',
  active: 'Facteur actif',
  suspended: 'Calcul suspendu',
}

export type Trend = 'up' | 'down' | 'flat'

/**
 * Écart d'affichage entre le facteur actuel et celui d'ouverture (pas un calcul de marché) :
 * `ratio` est exprimé en fraction (0,016 = +1,6 %). En dessous de 0,05 %, on dit « stable ».
 */
export function getTrend(market: CreatorMarket): { trend: Trend; ratio: number } {
  const ratio = market.openingCote > 0 ? market.cote / market.openingCote - 1 : 0
  if (Math.abs(ratio) < 0.0005) return { trend: 'flat', ratio: 0 }
  return { trend: ratio > 0 ? 'up' : 'down', ratio }
}

/** Ligne de situation du facteur : rythme des vues, démarrage neutre ou calcul suspendu. */
export function getRhythmLine(market: CreatorMarket): string {
  if (market.status === 'upcoming') return 'Facteur neutre à l’ouverture'
  if (market.updateState === 'warmup') {
    return `Démarrage neutre · ${market.referencePeriodsDone}/${TEMP_MARKET_PARAMS.referencePeriods} périodes`
  }
  if (market.updateState === 'suspended') return 'Calcul suspendu · facteur figé'
  const direction = market.signal > 0 ? '↑' : market.signal < 0 ? '↓' : '='
  return `${direction} ${formatRate(market.recentRate)} · moyenne ${market.referenceRate.toLocaleString('fr-FR')}`
}
