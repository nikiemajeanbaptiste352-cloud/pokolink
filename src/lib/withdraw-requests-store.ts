/**
 * Retraits de positions Cotes / Coins déjà réglés sur cet appareil (démo).
 * Empêche un double crédit Wallet ; le serveur restera la source de vérité.
 */
import { createLocalStore } from '@/lib/local-store'

export const withdrawRequestsStore = createLocalStore<readonly string[]>(
  'africonnect.withdraw-requests.v1',
  (raw) =>
    Array.isArray(raw) ? raw.filter((id): id is string => typeof id === 'string') : [],
)

export function requestWithdrawal(positionId: string) {
  const list = withdrawRequestsStore.get()
  if (!list.includes(positionId)) withdrawRequestsStore.set([...list, positionId])
}
