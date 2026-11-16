/** Outils partagés par les graphiques (axes et courbes). Aucun calcul métier ici. */

/** Arrondit au « beau » maximum supérieur (ex. 128 400 → 150 000) pour l'axe vertical. */
export function niceCeil(value: number): number {
  if (value <= 0) return 2
  // Petits effectifs : maximum pair, pour que le repère du milieu reste un entier.
  if (value <= 100) return Math.max(2, Math.ceil(value / 2) * 2)
  const step = 10 ** Math.floor(Math.log10(value)) / 2
  return Math.ceil(value / step) * step
}

export interface PlotPoint {
  x: number
  y: number
}

/**
 * Courbe lissée (Catmull-Rom convertie en Bézier cubique) passant par tous les points.
 * Les ordonnées sont bornées à la zone de tracé pour éviter tout dépassement du lissage.
 */
export function smoothPath(points: readonly PlotPoint[], minY = 0, maxY = 100): string {
  const first = points[0]
  if (!first) return ''
  if (points.length === 1) return `M${first.x},${first.y}`
  const clamp = (y: number) => Math.min(maxY, Math.max(minY, y))
  let path = `M${first.x.toFixed(2)},${first.y.toFixed(2)}`
  for (let i = 0; i < points.length - 1; i += 1) {
    const p0 = points[i - 1] ?? points[i]!
    const p1 = points[i]!
    const p2 = points[i + 1]!
    const p3 = points[i + 2] ?? p2
    const c1x = p1.x + (p2.x - p0.x) / 6
    const c1y = clamp(p1.y + (p2.y - p0.y) / 6)
    const c2x = p2.x - (p3.x - p1.x) / 6
    const c2y = clamp(p2.y - (p3.y - p1.y) / 6)
    path += ` C${c1x.toFixed(2)},${c1y.toFixed(2)} ${c2x.toFixed(2)},${c2y.toFixed(2)} ${p2.x.toFixed(2)},${p2.y.toFixed(2)}`
  }
  return path
}

/** Indices (répartis régulièrement) des repères à écrire sous l'axe horizontal. */
export function tickIndexes(length: number, wanted = 4): number[] {
  if (length <= 0) return []
  if (length <= wanted) return Array.from({ length }, (_, index) => index)
  return Array.from({ length: wanted }, (_, index) =>
    Math.round((index / (wanted - 1)) * (length - 1)),
  )
}
