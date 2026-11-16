import type { PlanDuration } from '@/types/pro'

/**
 * Statut d'une carte d'abonnement.
 *   pending_payment : le paiement du forfait n'est pas encore confirmé par le serveur
 *   active          : paiement confirmé, la carte est valable jusqu'à `endsAt`
 *   expired         : la période est terminée
 *   cancelled       : carte annulée ou remboursée
 */
export type SubscriptionCardStatus =
  'pending_payment' | 'active' | 'expired' | 'cancelled'

/**
 * Carte d'abonnement : preuve numérique de la souscription à un forfait d'un Service Pro,
 * avec un QR code que le prestataire scanne dans son Espace Pro. Le SERVEUR confirme le
 * paiement, active la carte, fixe ses dates et décide si elle est valable : le frontend ne
 * fait que la demander (carte « en attente de paiement ») et l'afficher.
 */
export interface SubscriptionCard {
  id: string
  /** Numéro unique, sans le « # » (affiché « #AB-2026-004217 »). */
  number: string
  /** `professional_space_id` du Service Pro qui vend le forfait. */
  serviceId: string
  /** Nom d'utilisateur public du Service Pro (adresse de son profil public). */
  proRef: string
  planId: string
  planName: string
  planDuration: PlanDuration
  /** Prix du forfait en FCFA, tel qu'annoncé par le Service Pro. */
  price: number
  holderName: string
  /** Cette carte appartient à l'utilisateur connecté. */
  mine: boolean
  status: SubscriptionCardStatus
  /** Demande de souscription (ms). */
  createdAt: number
  /** Début et fin de validité (ms), fixés par le serveur à la confirmation du paiement. */
  startsAt?: number
  /** Absente pour un paiement unique. */
  endsAt?: number
  /** Identifiant de vérification encodé dans le QR code. */
  verificationCode: string
}
