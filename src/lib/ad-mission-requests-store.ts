/**
 * Demandes de validation de missions publicitaires faites depuis cet appareil.
 *
 * STOCKAGE TEMPORAIRE : le frontend n'attribue aucun point. Une demande reste « en attente » ;
 * le serveur Rewards vérifie l'action (vue / visite / abonnement), les plafonds et le budget
 * de campagne, puis crédite éventuellement. Les soldes affichés ne changent jamais ici.
 */
import { createLocalStore } from '@/lib/local-store'
import type { RewardsOperation } from '@/types/rewards'

function isEarnPending(value: unknown): value is RewardsOperation {
  if (typeof value !== 'object' || value === null) return false
  const v = value as Record<string, unknown>
  return (
    typeof v.id === 'string' &&
    typeof v.reference === 'string' &&
    v.kind === 'EARN' &&
    typeof v.points === 'number' &&
    typeof v.title === 'string' &&
    typeof v.at === 'number' &&
    v.status === 'pending'
  )
}

export const adMissionRequestsStore = createLocalStore<readonly RewardsOperation[]>(
  'africonnect.ad-mission-requests.v1',
  (raw) => (Array.isArray(raw) ? raw.filter(isEarnPending) : []),
)

/** Enregistre une demande EARN « en attente » pour une mission publicitaire. */
export function addAdMissionEarnRequest(
  input: { missionId: string; title: string; points: number; detail?: string },
  now: number,
): RewardsOperation {
  const operation: RewardsOperation = {
    id: `adm-local-${input.missionId}-${now}`,
    reference: 'Attribuée par le serveur',
    kind: 'EARN',
    points: input.points,
    title: input.title,
    detail: input.detail ?? 'Mission publicitaire · en attente de validation',
    at: now,
    status: 'pending',
  }
  adMissionRequestsStore.set([operation, ...adMissionRequestsStore.get()])
  return operation
}

/** True si une demande en attente existe déjà pour cette mission sur cet appareil. */
export function hasPendingAdMissionRequest(missionId: string): boolean {
  return adMissionRequestsStore
    .get()
    .some((op) => op.id.includes(`adm-local-${missionId}-`))
}
