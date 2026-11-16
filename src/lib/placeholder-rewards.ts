/**
 * DONNÉES TEMPORAIRES de Rewards : uniquement pour vérifier le rendu de l'écran. Les soldes,
 * opérations, références et statuts viennent du serveur (journal Rewards) : à remplacer par
 * l'API (TanStack Query). Aucun calcul de points n'est fait dans le frontend.
 */
import type { RewardsBalances, RewardsOperation } from '@/types/rewards'

const MIN = 60_000
const HOUR = 60 * MIN
const DAY = 24 * HOUR
const NOW = Date.now()

export const TEMP_REWARDS_BALANCES: RewardsBalances = {
  available: 12_450,
  pending: 1_000,
}

/** Opérations d'exemple, de la plus récente à la plus ancienne. */
export const TEMP_REWARDS_OPERATIONS: readonly RewardsOperation[] = [
  {
    id: 'rw-1',
    reference: 'RW-2026-000412',
    kind: 'EARN',
    points: 300,
    title: 'Mission publicitaire',
    detail: 'Visite · Garage Wend-Kuuni',
    at: NOW - 25 * MIN,
    status: 'confirmed',
  },
  {
    id: 'rw-2',
    reference: 'RW-2026-000409',
    kind: 'RESERVE',
    points: 1_000,
    title: 'Transfert vers @awa.k',
    detail: 'En attente de la réponse du serveur',
    at: NOW - 2 * HOUR,
    status: 'pending',
  },
  {
    id: 'rw-3',
    reference: 'RW-2026-000398',
    kind: 'EARN',
    points: 500,
    title: 'Achat éligible',
    detail: 'Commande chez Chez Alima',
    at: NOW - 1 * DAY,
    status: 'confirmed',
  },
  {
    id: 'rw-4',
    reference: 'RW-2026-000380',
    kind: 'TRANSFER_IN',
    points: 2_000,
    title: 'Points reçus de @moussa.t',
    at: NOW - 3 * DAY,
    status: 'confirmed',
  },
  {
    id: 'rw-5',
    reference: 'RW-2026-000371',
    kind: 'SPEND',
    points: 5_000,
    title: 'Voucher de réduction',
    detail: 'Refusé : seuil minimum d’achat non atteint',
    at: NOW - 4 * DAY,
    status: 'refused',
  },
  {
    id: 'rw-6',
    reference: 'RW-2026-000350',
    kind: 'TRANSFER_OUT',
    points: 1_500,
    title: 'Transfert vers @issa.d',
    at: NOW - 6 * DAY,
    status: 'confirmed',
  },
]
