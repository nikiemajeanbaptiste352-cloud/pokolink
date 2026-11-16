/** Formate un compteur : 342 → « 342 », 12400 → « 12,4K », 2500000 → « 2,5M ». */
export function formatCount(value: number): string {
  const compact = (n: number, unit: string) =>
    `${n.toFixed(1).replace(/\.0$/, '').replace('.', ',')}${unit}`

  if (value >= 1_000_000) return compact(value / 1_000_000, 'M')
  if (value >= 1_000) return compact(value / 1_000, 'K')
  return String(value)
}

const priceFormatter = new Intl.NumberFormat('fr-FR')

/** Nombre entier complet avec séparateur de milliers : 2700 → « 2 700 ». */
export function formatNumber(value: number): string {
  return priceFormatter.format(value)
}

/** Formate un prix en francs CFA : 650000 → « 650 000 FCFA ». */
export function formatPrice(value: number): string {
  return `${priceFormatter.format(value)} FCFA`
}

/** Formate une note : 4.6 → « 4,6 ». */
export function formatRating(value: number): string {
  return value.toFixed(1).replace('.', ',')
}

/** Heure du jour à la française : « 14 h 32 ». */
export function formatClock(ms: number): string {
  const date = new Date(ms)
  return `${date.getHours()} h ${String(date.getMinutes()).padStart(2, '0')}`
}
