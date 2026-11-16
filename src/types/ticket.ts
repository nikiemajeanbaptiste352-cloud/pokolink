import type { PaymentMethodId } from '@/types/service'

/**
 * Statut d'un ticket numérique.
 *   paid               : paiement confirmé par le système de paiement, pas encore utilisé
 *   pending_validation : paiement confirmé, le prestataire doit encore valider l'opération
 *   validated          : le prestataire a validé la prestation ou la remise du produit
 *   cancelled          : ticket annulé
 */
export type TicketStatus = 'paid' | 'pending_validation' | 'validated' | 'cancelled'

/**
 * Ticket de paiement : preuve numérique d'un paiement. En production, le SERVEUR le crée
 * après confirmation effective. En démonstration frontend, un ticket local peut être émis
 * juste après la confirmation PIN pour montrer le parcours (logo de l'espace pro inclus) ;
 * aucun solde n'est modifié.
 */
export interface PaymentTicket {
  id: string
  /** Numéro unique, sans le « # » (affiché « #AC-2026-008421 »). */
  number: string
  /** `professional_space_id` du Service Pro qui a reçu le paiement. */
  serviceId: string
  /** Nom d'utilisateur public du Service Pro (adresse de son profil public). */
  proRef: string
  /** Nom affiché de l'espace pro (si l'annuaire n'est pas encore chargé). */
  providerName?: string
  /** Logo ou photo de profil de l'espace pro, figé au moment de l'émission. */
  providerLogo?: string
  clientName: string
  /** Téléphone de l'acheteur, pour contact en cas de problème. */
  clientPhone?: string
  /** Ce ticket appartient à l'utilisateur connecté (il le voit dans « Mes tickets »). */
  mine: boolean
  /** Produit ou prestation concernée. */
  itemLabel: string
  /** Référence catalogue (ex. Réf. SAC-025). */
  itemReference?: string
  /** Quantité commandée. */
  quantity?: number
  /** Visuel produit figé à l’émission. */
  itemImageSrc?: string
  /** Montant effectivement payé en Wallet FCFA. */
  amount: number
  /** Prix initial avant réduction Rewards (FCFA). */
  originalAmount?: number
  /** Points Rewards utilisés. */
  rewardsPointsUsed?: number
  /** Réduction Rewards en FCFA. */
  rewardsDiscountFcfa?: number
  /** Montant reporté en crédit commerçant (dette créée), FCFA. */
  creditAmount?: number
  /** Montant restant dû sur cet achat, FCFA. */
  remainingDue?: number
  /** Statut de paiement affiché (ex. « Partiel · crédit »). */
  paymentStatusLabel?: string
  /** Date et heure du paiement confirmé (ms). */
  paidAt: number
  method: PaymentMethodId
  /** Référence de la transaction de paiement. */
  transactionRef: string
  status: TicketStatus
  /** Identifiant de vérification encodé dans le QR code. */
  verificationCode: string
  /** Moment de la validation par le prestataire (ms), si validé. */
  validatedAt?: number
  /** Vrai pour un ticket émis localement après confirmation PIN (démonstration). */
  local?: boolean
}
