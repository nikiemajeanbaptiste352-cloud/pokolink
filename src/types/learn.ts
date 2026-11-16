/**
 * Types du module AfriLearn (classes, fils de discussion, bibliothèque).
 * Toute la logique est côté serveur : ces types décrivent ce que le serveur renvoie.
 */

export type LearnCategory = 'Primaire' | 'Collège' | 'Lycée' | 'Université'

/** Niveau ou classe (table learn_levels), administrable sans changer le code. */
export interface LearnLevel {
  id: string
  name: string
  category: LearnCategory
  country: string
  /** Nombre de membres du fil. 0 et `hasFeed: false` : le fil sera créé à la première arrivée. */
  membersCount: number
  hasFeed: boolean
}

export type LearnRole = 'member' | 'moderator' | 'admin'

export interface LearnAuthor {
  id: string
  name: string
  handle: string
  role: LearnRole
  avatarSrc?: string
}

export type LearnPostType =
  'text' | 'question' | 'exercice' | 'corrige' | 'examen' | 'document' | 'annonce'

/** active : visible ; flagged : retenue par le filtre automatique, en attente de modération. */
export type LearnPostStatus = 'active' | 'flagged'

export type LearnDocumentKind =
  'cours' | 'exercice' | 'corrige' | 'examen' | 'memoire' | 'rapport'

export type LearnFileType = 'pdf' | 'docx' | 'image'

export interface LearnDocument {
  id: string
  levelId: string
  title: string
  description: string
  kind: LearnDocumentKind
  fileType: LearnFileType
  /** Taille en octets. */
  fileSize: number
  downloadsCount: number
  /** Marqué « populaire » par le serveur (téléchargements, enregistrements, likes, commentaires). */
  isPopular: boolean
  author: LearnAuthor
  timeLabel: string
}

export interface LearnPost {
  id: string
  levelId: string
  author: LearnAuthor
  type: LearnPostType
  title?: string
  content: string
  timeLabel: string
  status: LearnPostStatus
  likesCount: number
  commentsCount: number
  sharesCount: number
  /** Annonce épinglée en tête du fil. */
  isPinned?: boolean
  /** Question : au moins une réponse reçue. */
  isAnswered?: boolean
  /** Document attaché à la publication. */
  documentId?: string
}

export interface LearnComment {
  id: string
  postId: string
  author: LearnAuthor
  content: string
  timeLabel: string
  /** Réponse à un autre commentaire ; null pour un commentaire de premier niveau. */
  parentId: string | null
  likesCount: number
}

export type LearnReportTarget = 'post' | 'comment' | 'document' | 'user'
