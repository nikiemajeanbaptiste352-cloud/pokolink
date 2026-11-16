/**
 * DONNÉES TEMPORAIRES : uniquement pour vérifier le rendu des courbes de l'Espace Pro.
 * À remplacer par l'API (TanStack Query) : visites, commandes et revenus d'UN établissement,
 * agrégés par le serveur. Les valeurs sont déterministes (même établissement, même jour,
 * même chiffre) mais inventées : elles ne reflètent aucune activité réelle.
 */

const DAY = 24 * 60 * 60 * 1000
const MIN_BASKET = 2500

export interface ActivityDay {
  /** Début de journée (millisecondes depuis 1970). */
  date: number
  visitors: number
  orders: number
  /** Revenu du jour, en francs CFA (exemple). */
  revenue: number
}

function hash(text: string): number {
  let value = 2166136261
  for (let index = 0; index < text.length; index += 1) {
    value ^= text.charCodeAt(index)
    value = Math.imul(value, 16777619)
  }
  return value >>> 0
}

/** Générateur pseudo-aléatoire déterministe (mulberry32). */
function random(seed: number): () => number {
  let state = seed
  return () => {
    state = (state + 0x6d2b79f5) | 0
    let t = Math.imul(state ^ (state >>> 15), 1 | state)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/** Plus de monde le week-end et en début de semaine pour une boutique de quartier. */
const WEEKDAY_FACTOR = [1.15, 0.85, 0.9, 0.95, 1, 1.1, 1.25] as const

function startOfDay(ms: number): number {
  const date = new Date(ms)
  date.setHours(0, 0, 0, 0)
  return date.getTime()
}

/**
 * Activité d'exemple des `days` derniers jours (aujourd'hui compris), du plus ancien au plus
 * récent. `averageBasket` donne l'ordre de grandeur du revenu (prix moyen du catalogue).
 */
export function getTempActivity(
  seed: string,
  now: number,
  days: number,
  averageBasket: number,
): ActivityDay[] {
  // Panier minimal : un catalogue d'essai à quelques francs donnerait des revenus dérisoires.
  const basket = Math.max(MIN_BASKET, averageBasket)
  const base = 45 + (hash(seed) % 120)
  const today = startOfDay(now)
  return Array.from({ length: days }, (_, index) => {
    const date = today - (days - 1 - index) * DAY
    const dayNumber = Math.round(date / DAY)
    const next = random(hash(`${seed}:${dayNumber}`))
    const weekday = new Date(date).getDay()
    const trend = 1 + 0.18 * Math.sin(dayNumber / 9)
    const visitors = Math.round(
      base * (WEEKDAY_FACTOR[weekday] ?? 1) * trend * (0.85 + next() * 0.3),
    )
    const conversion = 0.05 + next() * 0.04
    const orders = Math.round(visitors * conversion)
    // Revenu continu (et non orders × panier) : évite une courbe en dents de scie.
    const revenue =
      Math.round((visitors * conversion * basket * (0.85 + next() * 0.3)) / 100) * 100
    return { date, visitors, orders, revenue }
  })
}
