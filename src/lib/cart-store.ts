/**
 * STOCKAGE TEMPORAIRE du panier de cet appareil : un panier par vendeur (service), car un
 * paiement va toujours à un seul vendeur. Gardé dans le localStorage pour que le panier
 * survive à la navigation.
 *
 * Le panier ne contient que des identifiants et des quantités : noms, prix et disponibilité
 * sont relus dans le catalogue à chaque affichage, et le serveur recalcule le total à la
 * commande. Rien ici n'est un solde ni un paiement.
 */

const STORAGE_KEY = 'africonnect.cart.v1'

/** serviceId → (itemId → quantité). */
export type CartState = Readonly<Record<string, Readonly<Record<string, number>>>>

type Listener = () => void

let cart: CartState | null = null
const listeners = new Set<Listener>()

function isQuantity(value: unknown): value is number {
  return typeof value === 'number' && Number.isInteger(value) && value > 0 && value <= 99
}

export function getCart(): CartState {
  if (cart) return cart
  const loaded: Record<string, Record<string, number>> = {}
  try {
    const parsed: unknown = JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? 'null')
    if (typeof parsed === 'object' && parsed !== null && !Array.isArray(parsed)) {
      for (const [serviceId, lines] of Object.entries(parsed)) {
        if (typeof lines !== 'object' || lines === null) continue
        const valid: Record<string, number> = {}
        for (const [itemId, quantity] of Object.entries(lines)) {
          if (isQuantity(quantity)) valid[itemId] = quantity
        }
        if (Object.keys(valid).length > 0) loaded[serviceId] = valid
      }
    }
  } catch {
    // Données illisibles : panier vide.
  }
  cart = loaded
  return cart
}

export function subscribeCart(listener: Listener): () => void {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

function commit(next: CartState) {
  cart = next
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  } catch {
    // Quota dépassé : le panier reste en mémoire.
  }
  listeners.forEach((listener) => listener())
}

/** Fixe la quantité d'un article ; 0 le retire. `max` borne la quantité (stock). */
export function setCartQuantity(
  serviceId: string,
  itemId: string,
  quantity: number,
  max = 99,
) {
  const current = getCart()
  const lines = { ...(current[serviceId] ?? {}) }
  const next = Math.min(Math.floor(quantity), max, 99)
  if (next <= 0) delete lines[itemId]
  else lines[itemId] = next
  const rest = { ...current }
  if (Object.keys(lines).length === 0) delete rest[serviceId]
  else rest[serviceId] = lines
  commit(rest)
}

/** Ajoute `delta` unité(s) d'un article, dans la limite de `max`. */
export function addToCart(serviceId: string, itemId: string, max = 99, delta = 1) {
  const quantity = getCart()[serviceId]?.[itemId] ?? 0
  setCartQuantity(serviceId, itemId, quantity + delta, max)
}

/** Vide le panier d'un vendeur. */
export function clearServiceCart(serviceId: string) {
  const rest = { ...getCart() }
  delete rest[serviceId]
  commit(rest)
}
