import type { RewardsOperationKind, RewardsOperationStatus } from '@/types/rewards'

/** Libellé de chaque type d'opération du journal. */
export const REWARDS_KIND_LABEL: Record<RewardsOperationKind, string> = {
  EARN: 'Gain',
  RESERVE: 'Réservation',
  RELEASE: 'Libération',
  SPEND: 'Dépense',
  TRANSFER_OUT: 'Transfert envoyé',
  TRANSFER_IN: 'Transfert reçu',
  REVERSE: 'Annulation',
}

/** Sens d'une opération confirmée sur le solde : `in` ajoute, `out` retire, `hold` met de côté. */
export const REWARDS_KIND_FLOW: Record<RewardsOperationKind, 'in' | 'out' | 'hold'> = {
  EARN: 'in',
  RELEASE: 'in',
  TRANSFER_IN: 'in',
  SPEND: 'out',
  TRANSFER_OUT: 'out',
  REVERSE: 'out',
  RESERVE: 'hold',
}

export interface RewardsStatusMeta {
  label: string
  message: string
}

export const REWARDS_STATUS: Record<RewardsOperationStatus, RewardsStatusMeta> = {
  pending: {
    label: 'En attente',
    message: 'Le serveur n’a pas encore répondu : votre solde n’est pas modifié.',
  },
  confirmed: {
    label: 'Confirmée',
    message: 'L’opération est confirmée par le serveur.',
  },
  refused: {
    label: 'Refusée',
    message: 'L’opération est refusée : aucun point n’a été déplacé.',
  },
  cancelled: {
    label: 'Annulée',
    message: 'L’opération est annulée : aucun point n’a été déplacé.',
  },
}

/** Points avec leur unité : 12450 → « 12 450 pts ». */
export function formatPoints(value: number): string {
  return `${new Intl.NumberFormat('fr-FR').format(value)} pts`
}
