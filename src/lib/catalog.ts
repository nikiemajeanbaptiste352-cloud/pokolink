import type { CatalogItem } from '@/types/service'

/** Quantité maximale commandable à la fois quand seule la disponibilité est suivie. */
const MAX_WHEN_AVAILABLE = 99

/** Quantité maximale qu'on peut ajouter au panier pour un élément. */
export function getMaxQuantity(item: CatalogItem): number {
  if (item.stockMode === 'quantity') return item.quantity
  return item.available ? MAX_WHEN_AVAILABLE : 0
}

/**
 * Référence affichée d'un article (« REF-3F9A2C »), dérivée de son identifiant : elle ne
 * change pas tant que l'article existe. Le serveur attribuera la référence officielle.
 */
export function itemReference(item: CatalogItem): string {
  const code = item.id.replace(/[^a-z0-9]/gi, '').slice(-6)
  return `REF-${code.toUpperCase().padStart(6, '0')}`
}

export function isOrderable(item: CatalogItem): boolean {
  return getMaxQuantity(item) > 0
}

/** Texte de disponibilité : « 12 en stock », « Disponible », « Indisponible »… */
export function getStockLabel(item: CatalogItem): string {
  if (item.stockMode === 'quantity') {
    if (item.quantity <= 0) return 'Épuisé'
    return `${item.quantity} en stock`
  }
  return item.available ? 'Disponible' : 'Indisponible'
}

export type CatalogSort = 'default' | 'name' | 'price-asc' | 'price-desc'

export const CATALOG_SORTS: readonly { id: CatalogSort; label: string }[] = [
  { id: 'default', label: 'Ordre d’ajout' },
  { id: 'name', label: 'Nom (A → Z)' },
  { id: 'price-asc', label: 'Prix croissant' },
  { id: 'price-desc', label: 'Prix décroissant' },
]

/** Minuscules sans accents, pour une recherche tolérante (« the » trouve « Thé »). */
export function normalize(text: string): string {
  return text
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .trim()
}

interface CatalogView {
  query: string
  /** `null` = toutes les catégories. */
  category: string | null
  sort: CatalogSort
}

/** Recherche (nom, catégorie, description), filtre par catégorie, puis tri. */
export function selectItems(
  items: readonly CatalogItem[],
  { query, category, sort }: CatalogView,
): CatalogItem[] {
  const q = normalize(query)
  const result = items.filter((item) => {
    if (category !== null && item.category !== category) return false
    if (q === '') return true
    return normalize(`${item.name} ${item.category} ${item.description}`).includes(q)
  })
  if (sort === 'name') result.sort((a, b) => a.name.localeCompare(b.name, 'fr'))
  if (sort === 'price-asc') result.sort((a, b) => a.price - b.price)
  if (sort === 'price-desc') result.sort((a, b) => b.price - a.price)
  return result
}

/** Catégories présentes dans une liste d'éléments, dans l'ordre d'apparition. */
export function getCategories(items: readonly CatalogItem[]): string[] {
  return [...new Set(items.map((item) => item.category))]
}
