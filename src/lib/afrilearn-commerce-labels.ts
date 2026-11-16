import type {
  LearnEduDelivery,
  LearnEduProductKind,
  LearnEduPublishStatus,
} from '@/types/afrilearn-commerce'

export const LEARN_EDU_KIND_LABEL: Record<LearnEduProductKind, string> = {
  ebook: 'Livre numérique',
  physical_book: 'Livre physique',
  revision: 'Fiche de révision',
  exercises: 'Exercices corrigés',
  course: 'Support de cours',
  document: 'Document pédagogique',
  other: 'Autre produit éducatif',
}

export const LEARN_EDU_DELIVERY_LABEL: Record<LearnEduDelivery, string> = {
  download: 'Téléchargement',
  pickup: 'Remise en main propre',
  delivery: 'Livraison',
  online: 'Consultation en ligne',
}

export const LEARN_EDU_STATUS_LABEL: Record<LearnEduPublishStatus, string> = {
  draft: 'Brouillon',
  published: 'Publié',
  archived: 'Archivé',
}

/** Commission plateforme sur ventes produits éducatifs (pas sur abonnements Canal). */
export const LEARN_EDU_PLATFORM_FEE_RATE = 0.05
