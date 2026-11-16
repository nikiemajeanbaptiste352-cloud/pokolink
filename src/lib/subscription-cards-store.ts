/**
 * STOCKAGE TEMPORAIRE des cartes d'abonnement demandées depuis cet appareil : gardées dans
 * le localStorage pour pouvoir essayer le parcours complet (souscription, paiement, carte
 * avec QR code, téléchargement).
 *
 * À remplacer par l'API : le numéro, le code de vérification, la confirmation du paiement,
 * l'activation de la carte et ses dates sont décidés par le SERVEUR. Une carte créée ici est
 * toujours « en attente de paiement » : le frontend ne l'active jamais et ne touche à aucun
 * solde.
 */
import { createId } from '@/lib/ids'
import type { SubscriptionCard, SubscriptionCardStatus } from '@/types/subscription'

const STORAGE_KEY = 'africonnect.subscription-cards.v1'
const MAX_CARDS = 50

type Listener = () => void

let cards: readonly SubscriptionCard[] | null = null
const listeners = new Set<Listener>()

const STATUSES: readonly SubscriptionCardStatus[] = [
  'pending_payment',
  'active',
  'expired',
  'cancelled',
]

function isCard(value: unknown): value is SubscriptionCard {
  if (typeof value !== 'object' || value === null) return false
  const item = value as Partial<SubscriptionCard>
  return (
    typeof item.id === 'string' &&
    typeof item.number === 'string' &&
    typeof item.serviceId === 'string' &&
    typeof item.proRef === 'string' &&
    typeof item.planName === 'string' &&
    typeof item.price === 'number' &&
    typeof item.createdAt === 'number' &&
    typeof item.verificationCode === 'string' &&
    item.status !== undefined &&
    STATUSES.includes(item.status)
  )
}

/** Cartes demandées sur cet appareil, de la plus récente à la plus ancienne. */
export function getStoredCards(): readonly SubscriptionCard[] {
  if (cards) return cards
  let loaded: SubscriptionCard[] = []
  try {
    const parsed: unknown = JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? 'null')
    if (Array.isArray(parsed)) loaded = parsed.filter(isCard)
  } catch {
    // Données illisibles : aucune carte enregistrée.
  }
  cards = loaded
  return cards
}

export function subscribeCards(listener: Listener): () => void {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

const CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'

function randomChars(length: number): string {
  const bytes = new Uint8Array(length)
  crypto.getRandomValues(bytes)
  return Array.from(bytes, (byte) => CODE_ALPHABET[byte % CODE_ALPHABET.length]).join('')
}

export type NewSubscriptionCard = Pick<
  SubscriptionCard,
  'serviceId' | 'proRef' | 'planId' | 'planName' | 'planDuration' | 'price' | 'holderName'
>

/**
 * Enregistre une carte « en attente de paiement ». Le numéro et le code sont provisoires :
 * le serveur attribuera les définitifs.
 */
export function addCard(card: NewSubscriptionCard, now: number): SubscriptionCard {
  const digits = Array.from(
    crypto.getRandomValues(new Uint8Array(6)),
    (b) => b % 10,
  ).join('')
  const created: SubscriptionCard = {
    ...card,
    id: createId(),
    number: `AB-${new Date(now).getFullYear()}-${digits}`,
    mine: true,
    status: 'pending_payment',
    createdAt: now,
    verificationCode: `${randomChars(4)}-${randomChars(4)}-${randomChars(4)}`,
  }
  cards = [created, ...getStoredCards()].slice(0, MAX_CARDS)
  persist()
  return created
}

function persist() {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(cards ?? []))
  } catch {
    // Quota dépassé : l’état reste en mémoire.
  }
  listeners.forEach((listener) => listener())
}

/**
 * Active une carte après paiement Wallet confirmé (démo locale).
 * `endsAt` omis = paiement unique (pas de date de fin).
 */
export function activateCard(
  cardId: string,
  now: number,
  endsAt?: number,
): SubscriptionCard | undefined {
  const current = getStoredCards()
  const existing = current.find((c) => c.id === cardId)
  if (!existing) return undefined
  const next: SubscriptionCard = {
    ...existing,
    status: 'active',
    startsAt: now,
    ...(endsAt !== undefined ? { endsAt } : {}),
  }
  cards = current.map((c) => (c.id === cardId ? next : c))
  persist()
  return next
}
