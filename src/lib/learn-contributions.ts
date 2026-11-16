import { getLearnContributions } from '@/lib/learn-data'
import type { LearnAuthor } from '@/types/learn'

/**
 * Contenus d'un membre d'AfriLearn. Sur sa propre page il voit tout ; sur celle d'un autre
 * membre, seuls les contenus actifs (non signalés) sont visibles.
 * Inclut le contenu local (composer) pour le pont Moi ↔ public.
 */
export function getContributions(author: LearnAuthor, own: boolean) {
  return getLearnContributions(author, own)
}
