import type { DepositStatus, WithdrawalStatus } from '@/types/wallet'

/**
 * Libellés et explications des statuts du Wallet (rapport v3.0, sections 9 et 19).
 * Le frontend n'invente aucun statut : il traduit celui que le serveur envoie.
 */

/** Famille d'un statut : sert à la couleur et à l'icône, jamais à une décision. */
export type Outcome = 'progress' | 'success' | 'problem' | 'failure'

export interface StatusMeta {
  label: string
  outcome: Outcome
  /** Explication donnée à l'utilisateur. */
  message: string
  /** Index de l'étape atteinte dans la frise. */
  reached: number
}

export const DEPOSIT_STEPS = [
  'Demande créée',
  'Paiement détecté',
  'Vérification',
  'Wallet crédité',
] as const

export const DEPOSIT_STATUS: Record<DepositStatus, StatusMeta> = {
  CREATED: {
    label: 'Demande créée',
    outcome: 'progress',
    reached: 0,
    message: 'Votre demande est créée. Les instructions de transfert vont s’afficher.',
  },
  WAITING_PAYMENT: {
    label: 'En attente du transfert',
    outcome: 'progress',
    reached: 0,
    message: 'Effectuez le transfert avant la fin du délai de 5 minutes.',
  },
  PAYMENT_DETECTED: {
    label: 'Paiement détecté',
    outcome: 'progress',
    reached: 1,
    message: 'Un transfert correspondant a été détecté. Il reste à le vérifier.',
  },
  VERIFYING: {
    label: 'Vérification en cours',
    outcome: 'progress',
    reached: 2,
    message: 'Nous vérifions votre transfert. Vous serez prévenu dès que c’est terminé.',
  },
  APPROVED: {
    label: 'Transfert validé',
    outcome: 'progress',
    reached: 2,
    message: 'Votre transfert est validé. Le crédit de votre Wallet est en cours.',
  },
  CREDITED: {
    label: 'Wallet crédité',
    outcome: 'success',
    reached: 3,
    message: 'Le montant a été ajouté à votre solde disponible.',
  },
  REJECTED: {
    label: 'Dépôt rejeté',
    outcome: 'failure',
    reached: 2,
    message: 'Le transfert n’a pas pu être validé. Aucun montant n’a été crédité.',
  },
  EXPIRED: {
    label: 'Demande expirée',
    outcome: 'failure',
    reached: 0,
    message:
      'Le délai de 5 minutes est dépassé. Un transfert effectué après ce délai n’est pas crédité automatiquement : il passe en vérification complémentaire.',
  },
  MANUAL_REVIEW: {
    label: 'Vérification manuelle',
    outcome: 'problem',
    reached: 2,
    message:
      'Une vérification manuelle est nécessaire, par exemple si l’identifiant de transaction est absent ou si le montant diffère. Aucun crédit automatique n’est fait.',
  },
}

export const WITHDRAWAL_STEPS = [
  'Demande reçue',
  'Demande validée',
  'Transfert en cours',
  'Retrait effectué',
] as const

export const WITHDRAWAL_STATUS: Record<WithdrawalStatus, StatusMeta> = {
  PENDING_ADMIN: {
    label: 'En attente de validation',
    outcome: 'progress',
    reached: 0,
    message:
      'Demande reçue. Le montant est réservé et n’est plus disponible pour vos paiements. Le transfert n’a pas encore été effectué.',
  },
  VALIDATED: {
    label: 'Demande validée',
    outcome: 'progress',
    reached: 1,
    message:
      'L’administration a validé votre demande. Le transfert n’a pas encore été effectué.',
  },
  PROCESSING: {
    label: 'Transfert en cours',
    outcome: 'progress',
    reached: 2,
    message: 'L’administration effectue le transfert vers le bénéficiaire.',
  },
  COMPLETED: {
    label: 'Retrait effectué',
    outcome: 'success',
    reached: 3,
    message: 'Le transfert a été effectué et confirmé.',
  },
  REJECTED: {
    label: 'Demande rejetée',
    outcome: 'failure',
    reached: 0,
    message:
      'La demande a été rejetée avant tout transfert. Les fonds réservés sont de nouveau disponibles.',
  },
  FAILED: {
    label: 'Transfert échoué',
    outcome: 'failure',
    reached: 2,
    message: 'Le transfert n’a pas abouti. Les fonds ont été restitués à votre Wallet.',
  },
  MANUAL_REVIEW: {
    label: 'Vérification complémentaire',
    outcome: 'problem',
    reached: 2,
    message:
      'Le résultat du transfert est incertain. Les fonds restent réservés pendant la vérification : aucune restitution automatique n’est faite.',
  },
  CANCELLED: {
    label: 'Demande annulée',
    outcome: 'failure',
    reached: 0,
    message: 'Cette demande a été annulée.',
  },
}

/** Sort des fonds d'un retrait selon son statut (information, pas un calcul). */
export type FundsState = 'reserved' | 'sent' | 'restored' | 'undefined'

export const WITHDRAWAL_FUNDS: Record<WithdrawalStatus, FundsState> = {
  PENDING_ADMIN: 'reserved',
  VALIDATED: 'reserved',
  PROCESSING: 'reserved',
  MANUAL_REVIEW: 'reserved',
  COMPLETED: 'sent',
  REJECTED: 'restored',
  FAILED: 'restored',
  CANCELLED: 'undefined',
}

export const FUNDS_TEXT: Record<FundsState, string> = {
  reserved:
    'Fonds réservés : ils restent comptabilisés mais ne sont plus disponibles pour vos paiements.',
  sent: 'Les fonds réservés sont sortis définitivement de votre Wallet.',
  restored: 'Les fonds réservés ont été restitués à votre solde disponible.',
  undefined: 'Le sort des fonds dépend des règles d’annulation, encore à définir.',
}

/** Statuts qui ne sont pas terminés : l'opération apparaît dans « En cours ». */
export const ACTIVE_DEPOSIT: readonly DepositStatus[] = [
  'CREATED',
  'WAITING_PAYMENT',
  'PAYMENT_DETECTED',
  'VERIFYING',
  'APPROVED',
  'MANUAL_REVIEW',
]

export const ACTIVE_WITHDRAWAL: readonly WithdrawalStatus[] = [
  'PENDING_ADMIN',
  'VALIDATED',
  'PROCESSING',
  'MANUAL_REVIEW',
]
