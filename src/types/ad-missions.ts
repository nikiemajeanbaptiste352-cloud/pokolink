import type { AdMissionType, AdPackId } from '@/types/ads'

/**
 * Mission publicitaire côté Rewards (utilisateur). Le serveur propose les missions,
 * valide l'action et crédite les points. Le frontend n'attribue aucun point.
 *
 *   available : mission proposée, pas encore réalisée aujourd'hui
 *   pending   : action envoyée, points en attente de confirmation
 *   done      : mission validée aujourd'hui (plafond journalier)
 *   capped    : plafond quotidien atteint pour ce type
 */
export type AdMissionStatus = 'available' | 'pending' | 'done' | 'capped'

export interface RewardsAdMission {
  id: string
  type: AdMissionType
  /** Campagne sponsorisée source (avec budget Rewards). */
  campaignId: string
  campaignTitle: string
  /** Établissement ou commerce promu. */
  businessName: string
  businessHandle: string
  pack: AdPackId
  /** Points nominaux offerts si la mission est validée. */
  points: number
  /** Plafond quotidien pour ce type de mission. */
  dailyLimit: number
  /** Nombre déjà réalisé aujourd'hui (affichage). */
  doneToday: number
  status: AdMissionStatus
  /** Lien vers la page à visiter / le contenu à voir. */
  to: string
}
