/**
 * DONNÉES TEMPORAIRES : tickets d'exemple pour vérifier le rendu des écrans.
 *
 * Dans l'application réelle, le SERVEUR crée un ticket après la confirmation effective du
 * paiement par le système de paiement, lui attribue un numéro et une référence de
 * transaction uniques et décide de son statut. Le frontend n'en fabrique jamais.
 *
 * `mine: true` : tickets de l'utilisateur (Profil → Tickets). `mine: false` : tickets payés
 * par d'autres clients auprès du service `svc-poko` (l'établissement de test de
 * l'utilisateur), pour essayer la vérification dans son Espace Pro.
 */
import type { PaymentTicket } from '@/types/ticket'

const NOW = Date.now()
const HOUR = 3_600_000
const DAY = 24 * HOUR

/** Établissement de test de l'utilisateur (voir `services-storage.ts`). */
export const TEST_SERVICE_ID = 'svc-poko'

const ME = 'Amadou B.'

export const TEMP_TICKETS: readonly PaymentTicket[] = [
  // --- Tickets de l'utilisateur ---
  {
    id: 'tk-1',
    number: 'AC-2026-008421',
    serviceId: 'demo-garage.wend-kuuni',
    proRef: 'garage.wend-kuuni',
    clientName: ME,
    mine: true,
    itemLabel: 'Vidange complète',
    amount: 15000,
    paidAt: NOW - 3 * HOUR,
    method: 'wallet',
    transactionRef: 'AF-7K92-41P',
    status: 'paid',
    verificationCode: 'VK7Q-2M9X-A41P',
  },
  {
    id: 'tk-2',
    number: 'AC-2026-008377',
    serviceId: 'demo-techpro',
    proRef: 'techpro',
    clientName: ME,
    mine: true,
    itemLabel: 'Casque Bluetooth',
    amount: 25000,
    paidAt: NOW - 2 * DAY,
    method: 'orange_money',
    transactionRef: 'AF-3H81-70D',
    status: 'validated',
    validatedAt: NOW - 2 * DAY + 40 * 60_000,
    verificationCode: 'VH3R-8T1B-K70D',
  },
  {
    id: 'tk-3',
    number: 'AC-2026-008402',
    serviceId: 'demo-boutique.alpha',
    proRef: 'boutique.alpha',
    clientName: ME,
    mine: true,
    itemLabel: 'Smartphone Pro 128 Go',
    amount: 650000,
    paidAt: NOW - 20 * HOUR,
    method: 'card',
    transactionRef: 'AF-9C45-22M',
    status: 'pending_validation',
    verificationCode: 'VC9W-4N6E-M22M',
  },
  {
    id: 'tk-4',
    number: 'AC-2026-008290',
    serviceId: 'demo-chez.alima',
    proRef: 'chez.alima',
    clientName: ME,
    mine: true,
    itemLabel: 'Plats du terroir × 2',
    amount: 7000,
    paidAt: NOW - 6 * DAY,
    method: 'wave',
    transactionRef: 'AF-5B12-98L',
    status: 'cancelled',
    verificationCode: 'VB5J-1Q7Z-L98L',
  },

  // --- Tickets payés par d'autres clients auprès de l'établissement de test ---
  {
    id: 'tk-10',
    number: 'AC-2026-008433',
    serviceId: TEST_SERVICE_ID,
    proRef: 'poko',
    clientName: 'Awa K.',
    mine: false,
    itemLabel: 'Commande du catalogue',
    amount: 4500,
    paidAt: NOW - 40 * 60_000,
    method: 'wallet',
    transactionRef: 'AF-2D70-15A',
    status: 'paid',
    verificationCode: 'VD2S-6F3Y-A15A',
  },
  {
    id: 'tk-11',
    number: 'AC-2026-008431',
    serviceId: TEST_SERVICE_ID,
    proRef: 'poko',
    clientName: 'Moussa T.',
    mine: false,
    itemLabel: 'Commande du catalogue',
    amount: 12000,
    paidAt: NOW - 5 * HOUR,
    method: 'orange_money',
    transactionRef: 'AF-8E33-64B',
    status: 'pending_validation',
    verificationCode: 'VE8G-9P2L-B64B',
  },
  {
    id: 'tk-12',
    number: 'AC-2026-008398',
    serviceId: TEST_SERVICE_ID,
    proRef: 'poko',
    clientName: 'Fatou S.',
    mine: false,
    itemLabel: 'Commande du catalogue',
    amount: 2500,
    paidAt: NOW - DAY,
    method: 'moov_money',
    transactionRef: 'AF-4F58-03C',
    status: 'validated',
    validatedAt: NOW - DAY + 30 * 60_000,
    verificationCode: 'VF4H-7R5K-C03C',
  },
  {
    id: 'tk-13',
    number: 'AC-2026-008360',
    serviceId: TEST_SERVICE_ID,
    proRef: 'poko',
    clientName: 'Issa D.',
    mine: false,
    itemLabel: 'Commande du catalogue',
    amount: 8000,
    paidAt: NOW - 3 * DAY,
    method: 'wave',
    transactionRef: 'AF-6A09-87E',
    status: 'cancelled',
    verificationCode: 'VA6M-3U8V-E87E',
  },
]
