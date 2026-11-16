/**
 * DONNÉES TEMPORAIRES : deux achats d'exemple, uniquement pour vérifier le rendu de « Mes
 * achats » (commande prête, commande remise). À remplacer par les données réelles de l'API :
 * les statuts viennent du serveur, jamais du client.
 */
import { findDemoPro } from '@/lib/directory'
import { TEMP_PROFILE } from '@/lib/placeholder-profile'
import type { Purchase } from '@/types/purchase'

const NOW = Date.now()
const HOUR = 3_600_000
const DAY = 24 * HOUR

const BUYER = {
  firstName: TEMP_PROFILE.name.split(' ')[0] ?? '',
  lastName: TEMP_PROFILE.name.split(' ').slice(1).join(' '),
  userId: TEMP_PROFILE.handle,
}

function demoSeller(username: string) {
  const pro = findDemoPro(username)
  return {
    serviceId: pro?.service.id ?? `demo-${username}`,
    proRef: username,
    sellerName: pro?.service.name ?? 'Service Pro',
    ...(pro?.service.logo ? { sellerLogo: pro.service.logo } : {}),
  }
}

export const TEMP_PURCHASES: readonly Purchase[] = [
  {
    id: 'purchase-demo-1',
    reference: 'ACH-2026-DEMO01',
    ...demoSeller('good.food'),
    lines: [
      { itemId: 'demo-line-1', name: 'Plat du jour', quantity: 2, unitPrice: 2_500 },
    ],
    total: 5_000,
    buyer: BUYER,
    note: '',
    status: 'ready',
    createdAt: NOW - 3 * HOUR,
    local: false,
  },
  {
    id: 'purchase-demo-2',
    reference: 'ACH-2026-DEMO02',
    ...demoSeller('boutique.alpha'),
    lines: [
      {
        itemId: 'demo-line-2',
        name: 'Article de démonstration',
        quantity: 1,
        unitPrice: 12_000,
      },
    ],
    total: 12_000,
    buyer: BUYER,
    note: 'Merci de préparer un emballage cadeau.',
    status: 'completed',
    createdAt: NOW - 9 * DAY,
    local: false,
  },
]
