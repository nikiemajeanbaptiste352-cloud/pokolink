/**
 * Demandes Rewards faites depuis cet appareil (transferts de points).
 *
 * STOCKAGE TEMPORAIRE : le frontend n'exécute rien. Une demande reste « en attente » ; le
 * serveur Rewards vérifie le destinataire et le solde, déplace les points, attribue la
 * référence et décide du résultat. Les soldes affichés ne changent donc jamais ici.
 */
import { createLocalStore } from '@/lib/local-store'
import type { RewardsOperation } from '@/types/rewards'

function isOperation(value: unknown): value is RewardsOperation {
  if (typeof value !== 'object' || value === null) return false
  const v = value as Record<string, unknown>
  return (
    typeof v.id === 'string' &&
    typeof v.reference === 'string' &&
    v.kind === 'TRANSFER_OUT' &&
    typeof v.points === 'number' &&
    typeof v.title === 'string' &&
    typeof v.at === 'number' &&
    v.status === 'pending'
  )
}

export const rewardsRequestsStore = createLocalStore<readonly RewardsOperation[]>(
  'africonnect.rewards-requests.v1',
  (raw) => (Array.isArray(raw) ? raw.filter(isOperation) : []),
)

/** Enregistre une demande de transfert de points « en attente de confirmation ». */
export function addRewardsTransferRequest(
  input: { recipient: string; points: number; note?: string },
  now: number,
): RewardsOperation {
  const operation: RewardsOperation = {
    id: `rw-local-${now}`,
    reference: 'Attribuée par le serveur',
    kind: 'TRANSFER_OUT',
    points: input.points,
    title: `Transfert vers ${input.recipient}`,
    detail: input.note
      ? `Demande envoyée · ${input.note}`
      : 'Demande envoyée, en attente de confirmation',
    at: now,
    status: 'pending',
  }
  rewardsRequestsStore.set([operation, ...rewardsRequestsStore.get()])
  return operation
}
