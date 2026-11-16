/**
 * DONNÉES TEMPORAIRES : deux campagnes d'exemple, uniquement pour vérifier le rendu de la
 * rubrique Publicité (diffusion, résultats, campagne terminée).
 * À remplacer par les données réelles de l'API (TanStack Query) : les résultats viennent du
 * serveur, jamais du client.
 */
import type { AdCampaign } from '@/types/ads'

const NOW = Date.now()
const DAY = 24 * 60 * 60 * 1000

/** Campagnes d'exemple d'un Service Pro. */
export function getPlaceholderCampaigns(serviceId: string): AdCampaign[] {
  return [
    {
      id: `ad-demo-1-${serviceId}`,
      reference: 'PUB-2026-DEMO01',
      serviceId,
      pack: 'silver',
      target: 'establishment',
      title: 'Découvrez notre établissement',
      text: 'Nouveautés de la semaine et offres pour nos abonnés.',
      cta: 'discover',
      image: '',
      channels: ['home', 'explore', 'publications'],
      status: 'active',
      createdAt: NOW - 6 * DAY,
      results: { views: 12_480, visits: 1_126, subscribers: 87 },
      local: false,
    },
    {
      id: `ad-demo-2-${serviceId}`,
      reference: 'PUB-2026-DEMO02',
      serviceId,
      pack: 'bronze',
      target: 'promotion',
      title: 'Offre de rentrée',
      text: 'Profitez de -10 % jusqu’à la fin du mois.',
      cta: 'order',
      image: '',
      channels: ['home', 'explore', 'publications'],
      status: 'finished',
      createdAt: NOW - 40 * DAY,
      results: { views: 5_000, visits: 492, subscribers: 50 },
      local: false,
    },
  ]
}
