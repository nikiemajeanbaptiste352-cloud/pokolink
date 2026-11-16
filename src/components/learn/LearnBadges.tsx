import { Clock } from 'lucide-react'

import type { LearnPostType } from '@/types/learn'

import { POST_TYPE_META } from './learn-utils'

const badgeBase =
  'inline-flex h-6 items-center gap-1 rounded-full bg-muted px-2 text-caption font-semibold text-foreground'

/** Type d'une publication (question, corrigé, examen…). Texte neutre : contraste AA garanti. */
export function PostTypeBadge({
  type,
  className,
}: {
  type: LearnPostType
  className?: string
}) {
  const { label, icon: Icon } = POST_TYPE_META[type]
  return (
    // Pas de `cn` ici : tailwind-merge prendrait `text-caption` pour une couleur et le retirerait.
    <span className={className ? `${badgeBase} ${className}` : badgeBase}>
      <Icon className="size-3.5 text-brand" aria-hidden="true" />
      {label}
    </span>
  )
}

/** Contenu retenu par le filtre automatique : visible seulement par son auteur et les modérateurs. */
export function FlaggedBadge() {
  return (
    <span className="inline-flex h-6 items-center gap-1 rounded-full bg-warning/20 px-2 text-caption font-semibold text-foreground">
      <Clock className="size-3.5" aria-hidden="true" />
      En vérification
    </span>
  )
}
