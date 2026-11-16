import { ChevronRight, GraduationCap } from 'lucide-react'
import { Link } from 'react-router-dom'

import { paths } from '@/routes/paths'

/** Accès à AfriLearn depuis Explorer : choix de la classe, puis fil de discussion et documents. */
export function LearnEntryButton() {
  return (
    <Link
      to={paths.learn}
      className="flex min-h-16 items-center gap-3 rounded-xl border bg-card p-4 shadow-card transition-colors hover:bg-muted"
    >
      <span className="grid size-11 shrink-0 place-items-center rounded-full bg-accent text-accent-foreground">
        <GraduationCap className="size-6" aria-hidden="true" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-title leading-tight font-extrabold">AfriLearn</span>
        <span className="block text-caption text-muted-foreground">
          Votre classe, vos questions et les documents partagés
        </span>
      </span>
      <ChevronRight
        className="size-5 shrink-0 text-muted-foreground"
        aria-hidden="true"
      />
    </Link>
  )
}
