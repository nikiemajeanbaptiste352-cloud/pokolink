import { Link } from 'react-router-dom'

import { formatCount } from '@/lib/format'
import { paths } from '@/routes/paths'
import type { LearnLevel } from '@/types/learn'

/** Niveau ou classe : un appui mène directement à son fil. */
export function LevelTile({ level }: { level: LearnLevel }) {
  return (
    <Link
      to={paths.learnFeed(level.id)}
      className="flex min-h-16 flex-col justify-center rounded-xl border bg-card px-3.5 py-2.5 shadow-card transition-colors hover:bg-muted"
    >
      <span className="text-body font-bold">{level.name}</span>
      <span className="text-caption text-muted-foreground">
        {level.hasFeed ? `${formatCount(level.membersCount)} membres` : 'Nouveau fil'}
      </span>
    </Link>
  )
}
