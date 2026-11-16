import {
  BookOpen,
  CircleHelp,
  FileText,
  Megaphone,
  MessageSquare,
  PenLine,
  ScrollText,
  type LucideIcon,
} from 'lucide-react'

import type {
  LearnDocumentKind,
  LearnFileType,
  LearnPostType,
  LearnRole,
} from '@/types/learn'

export const POST_TYPE_META: Record<LearnPostType, { label: string; icon: LucideIcon }> =
  {
    text: { label: 'Discussion', icon: MessageSquare },
    question: { label: 'Question', icon: CircleHelp },
    exercice: { label: 'Exercice', icon: PenLine },
    corrige: { label: 'Corrigé', icon: BookOpen },
    examen: { label: 'Examen', icon: ScrollText },
    document: { label: 'Document', icon: FileText },
    annonce: { label: 'Annonce', icon: Megaphone },
  }

export const DOCUMENT_KIND_LABEL: Record<LearnDocumentKind, string> = {
  cours: 'Cours',
  exercice: 'Exercice',
  corrige: 'Corrigé',
  examen: 'Examen',
  memoire: 'Mémoire',
  rapport: 'Rapport',
}

export const FILE_TYPE_LABEL: Record<LearnFileType, string> = {
  pdf: 'PDF',
  docx: 'Word',
  image: 'Image',
}

export const ROLE_LABEL: Record<LearnRole, string | null> = {
  member: null,
  moderator: 'Modérateur',
  admin: 'Administrateur',
}

/** Taille lisible : 2411724 → « 2,3 Mo », 842000 → « 822 Ko ». */
export function formatFileSize(bytes: number): string {
  if (bytes >= 1_048_576) return `${(bytes / 1_048_576).toFixed(1).replace('.', ',')} Mo`
  return `${Math.max(1, Math.round(bytes / 1024))} Ko`
}

/**
 * Contrôles d'envoi affichés à l'utilisateur pour lui éviter un échec évident.
 * Ils ne remplacent rien : le serveur revérifie le type réel, la taille et analyse le fichier.
 */
export const UPLOAD_RULES = {
  maxBytes: 10 * 1_048_576,
  extensions: ['pdf', 'docx', 'jpg', 'jpeg', 'png'],
} as const

export function getFileExtension(name: string): string {
  const dot = name.lastIndexOf('.')
  return dot === -1 ? '' : name.slice(dot + 1).toLowerCase()
}

export const REPORT_REASONS = [
  { id: 'inappropriate', label: 'Contenu inapproprié ou offensant' },
  { id: 'spam', label: 'Spam ou publicité' },
  { id: 'wrong', label: 'Information fausse ou fichier erroné' },
  { id: 'copyright', label: 'Document protégé ou copié' },
  { id: 'other', label: 'Autre raison' },
] as const

export type ReportReasonId = (typeof REPORT_REASONS)[number]['id']
