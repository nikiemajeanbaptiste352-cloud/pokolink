/**
 * DONNÉES TEMPORAIRES : cartes d'abonnement d'exemple pour vérifier le rendu des écrans et
 * essayer le scanner de l'Espace Pro.
 *
 * Dans l'application réelle, le SERVEUR confirme le paiement d'un forfait, active la carte,
 * lui attribue un numéro et un code uniques, fixe ses dates et décide si elle est valable.
 * Le frontend n'en active jamais.
 *
 * `mine: true` : cartes de l'utilisateur (Profil → Tickets → Abonnements). `mine: false` :
 * cartes vendues par `svc-poko` (l'établissement de test de l'utilisateur), pour essayer la
 * vérification (valide, expirée, annulée, paiement en attente).
 */
import { TEST_SERVICE_ID } from '@/lib/placeholder-tickets'
import type { SubscriptionCard } from '@/types/subscription'

const NOW = Date.now()
const HOUR = 3_600_000
const DAY = 24 * HOUR

const ME = 'Amadou Ba'

export const TEMP_SUBSCRIPTIONS: readonly SubscriptionCard[] = [
  // --- Cartes de l'utilisateur ---
  {
    id: 'sub-1',
    number: 'AB-2026-004217',
    serviceId: 'demo-garage.wend-kuuni',
    proRef: 'garage.wend-kuuni',
    planId: 'plan-demo-entretien',
    planName: 'Entretien Premium',
    planDuration: 'monthly',
    price: 15000,
    holderName: ME,
    mine: true,
    status: 'active',
    createdAt: NOW - 9 * DAY,
    startsAt: NOW - 9 * DAY,
    endsAt: NOW + 21 * DAY,
    verificationCode: 'SB4K-9X2M-7QPL',
  },
  {
    id: 'sub-2',
    number: 'AB-2026-003950',
    serviceId: 'demo-chez.alima',
    proRef: 'chez.alima',
    planId: 'plan-demo-gourmande',
    planName: 'Carte Gourmande',
    planDuration: 'monthly',
    price: 20000,
    holderName: ME,
    mine: true,
    status: 'expired',
    createdAt: NOW - 45 * DAY,
    startsAt: NOW - 45 * DAY,
    endsAt: NOW - 15 * DAY,
    verificationCode: 'SC2N-5T8R-4WXD',
  },

  // --- Cartes vendues par l'établissement de test ---
  {
    id: 'sub-10',
    number: 'AB-2026-004302',
    serviceId: TEST_SERVICE_ID,
    proRef: 'poko',
    planId: 'plan-demo-essentiel',
    planName: 'Forfait Essentiel',
    planDuration: 'monthly',
    price: 5000,
    holderName: 'Awa Kaboré',
    mine: false,
    status: 'active',
    createdAt: NOW - 5 * DAY,
    startsAt: NOW - 5 * DAY,
    endsAt: NOW + 25 * DAY,
    verificationCode: 'SD6P-3K7V-9HMA',
  },
  {
    id: 'sub-11',
    number: 'AB-2026-004288',
    serviceId: TEST_SERVICE_ID,
    proRef: 'poko',
    planId: 'plan-demo-premium',
    planName: 'Forfait Premium',
    planDuration: 'annual',
    price: 45000,
    holderName: 'Moussa Traoré',
    mine: false,
    status: 'active',
    createdAt: NOW - 60 * DAY,
    startsAt: NOW - 60 * DAY,
    endsAt: NOW + 305 * DAY,
    verificationCode: 'SE8Q-2L4Y-6BNC',
  },
  {
    id: 'sub-12',
    number: 'AB-2026-004101',
    serviceId: TEST_SERVICE_ID,
    proRef: 'poko',
    planId: 'plan-demo-essentiel',
    planName: 'Forfait Essentiel',
    planDuration: 'monthly',
    price: 5000,
    holderName: 'Fatou Sawadogo',
    mine: false,
    status: 'expired',
    createdAt: NOW - 40 * DAY,
    startsAt: NOW - 40 * DAY,
    endsAt: NOW - 10 * DAY,
    verificationCode: 'SF3R-7M9Z-2KTE',
  },
  {
    id: 'sub-13',
    number: 'AB-2026-004055',
    serviceId: TEST_SERVICE_ID,
    proRef: 'poko',
    planId: 'plan-demo-premium',
    planName: 'Forfait Premium',
    planDuration: 'quarterly',
    price: 15000,
    holderName: 'Issa Diallo',
    mine: false,
    status: 'cancelled',
    createdAt: NOW - 30 * DAY,
    verificationCode: 'SG5T-8N2X-3JPF',
  },
  {
    id: 'sub-14',
    number: 'AB-2026-004311',
    serviceId: TEST_SERVICE_ID,
    proRef: 'poko',
    planId: 'plan-demo-essentiel',
    planName: 'Forfait Essentiel',
    planDuration: 'monthly',
    price: 5000,
    holderName: 'Rasmané Ouédraogo',
    mine: false,
    status: 'pending_payment',
    createdAt: NOW - 20 * 60_000,
    verificationCode: 'SH7V-4P6C-8RQG',
  },
]
